import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWorkLogSchema, createValidationErrorResponse, strictDateSchema } from "@/validation";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { TASK_TYPES, IMPACT_LEVELS } from "@/constants";

interface LogTagWithTag {
  tag: {
    id: string;
    name: string;
    category: string;
    createdAt: Date;
  };
}

interface LogData {
  id: string;
  date: Date;
  title: string;
  description: string | null;
  taskType: string;
  impactLevel: string;
  problem: string | null;
  solution: string | null;
  learning: string | null;
  links: string[];
  tags: LogTagWithTag[];
  createdAt: Date;
  updatedAt: Date;
}

function formatWorkLog(log: LogData) {
  return {
    id: log.id,
    date: log.date.toISOString().split("T")[0],
    title: log.title,
    description: log.description,
    taskType: log.taskType,
    impactLevel: log.impactLevel,
    problem: log.problem,
    solution: log.solution,
    learning: log.learning,
    links: log.links,
    tags: log.tags.map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      category: t.tag.category,
      createdAt: t.tag.createdAt,
    })),
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q");
    const fromVal = searchParams.get("from");
    const toVal = searchParams.get("to");
    const taskType = searchParams.get("taskType");
    const impactLevel = searchParams.get("impactLevel");
    const tagId = searchParams.get("tagId");
    const problemSolutionOnly = searchParams.get("problemSolutionOnly");

    const andConditions: Prisma.WorkLogWhereInput[] = [];

    if (q) {
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { problem: { contains: q, mode: "insensitive" } },
          { solution: { contains: q, mode: "insensitive" } },
          { learning: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (fromVal !== null) {
      const result = strictDateSchema.safeParse(fromVal);
      if (!result.success) {
        return Response.json(createValidationErrorResponse(result.error), {
          status: 400,
        });
      }
      fromDate = result.data;
    }

    if (toVal !== null) {
      const result = strictDateSchema.safeParse(toVal);
      if (!result.success) {
        return Response.json(createValidationErrorResponse(result.error), {
          status: 400,
        });
      }
      toDate = result.data;
    }

    if (taskType !== null && taskType !== "") {
      const result = z.object({
        taskType: z.enum(TASK_TYPES, {
          message: "Invalid task type",
        }),
      }).safeParse({ taskType });
      if (!result.success) {
        return Response.json(createValidationErrorResponse(result.error), {
          status: 400,
        });
      }
    }

    if (impactLevel !== null && impactLevel !== "") {
      const result = z.object({
        impactLevel: z.enum(IMPACT_LEVELS, {
          message: "Invalid impact level",
        }),
      }).safeParse({ impactLevel });
      if (!result.success) {
        return Response.json(createValidationErrorResponse(result.error), {
          status: 400,
        });
      }
    }

    if (tagId !== null && tagId !== "") {
      const result = z.object({
        tagId: z.string().uuid({ message: "Invalid tag ID format" }),
      }).safeParse({ tagId });
      if (!result.success) {
        return Response.json(createValidationErrorResponse(result.error), {
          status: 400,
        });
      }
    }

    if (problemSolutionOnly !== null && problemSolutionOnly !== "true" && problemSolutionOnly !== "false") {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "problemSolutionOnly must be 'true' or 'false'.",
          },
        },
        { status: 400 }
      );
    }

    if (fromDate || toDate) {
      const dateCondition: Prisma.DateTimeFilter = {};
      if (fromDate) {
        dateCondition.gte = fromDate;
      }
      if (toDate) {
        dateCondition.lte = toDate;
      }
      andConditions.push({ date: dateCondition });
    }

    if (taskType) {
      andConditions.push({ taskType });
    }

    if (impactLevel) {
      andConditions.push({ impactLevel });
    }

    if (tagId) {
      andConditions.push({
        tags: {
          some: {
            tagId: tagId,
          },
        },
      });
    }

    if (problemSolutionOnly === "true") {
      andConditions.push({
        OR: [
          {
            AND: [
              { problem: { not: null } },
              { problem: { not: "" } },
            ],
          },
          {
            AND: [
              { solution: { not: null } },
              { solution: { not: "" } },
            ],
          },
        ],
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const logs = await prisma.workLog.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    const data = logs.map(formatWorkLog);
    return Response.json({ data });
  } catch (error: unknown) {
    console.error("GET /api/logs error:", error);
    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Invalid JSON body.",
          },
        },
        { status: 400 }
      );
    }
    const result = createWorkLogSchema.safeParse(body);

    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    const { tagIds, ...logData } = result.data;

    // Check if tagIds exist
    if (tagIds && tagIds.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: {
          id: { in: tagIds },
        },
      });

      if (existingTags.length !== tagIds.length) {
        const foundIds = existingTags.map((t) => t.id);
        const missingIds = tagIds.filter((id) => !foundIds.includes(id));
        return Response.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed.",
              details: missingIds.map((id) => ({
                field: "tagIds",
                message: `Tag ID ${id} does not exist.`,
              })),
            },
          },
          { status: 400 }
        );
      }
    }

    const newLog = await prisma.workLog.create({
      data: {
        ...logData,
        tags: {
          create: (tagIds || []).map((tagId: string) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return Response.json({ data: formatWorkLog(newLog) }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/logs error:", error);
    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 }
    );
  }
}
