import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateWorkLogSchema, createValidationErrorResponse } from "@/validation";

const idSchema = z.string().uuid({ message: "Invalid ID format" });

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = idSchema.safeParse(id);

    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    const log = await prisma.workLog.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!log) {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Work log not found.",
          },
        },
        { status: 404 }
      );
    }

    return Response.json({ data: formatWorkLog(log) });
  } catch (error: unknown) {
    console.error("GET /api/logs/[id] error:", error);
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = idSchema.safeParse(id);

    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    const body = await request.json();
    const updateResult = updateWorkLogSchema.safeParse(body);

    if (!updateResult.success) {
      return Response.json(createValidationErrorResponse(updateResult.error), {
        status: 400,
      });
    }

    const existingLog = await prisma.workLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Work log not found.",
          },
        },
        { status: 404 }
      );
    }

    const { tagIds, ...logData } = updateResult.data;

    // Validate tagIds if provided
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

    const updatedLog = await prisma.$transaction(async (tx) => {
      if (tagIds !== undefined) {
        // Clear existing associations
        await tx.workLogTag.deleteMany({
          where: { workLogId: id },
        });

        // Add new associations
        if (tagIds.length > 0) {
          await tx.workLogTag.createMany({
            data: tagIds.map((tagId) => ({
              workLogId: id,
              tagId,
            })),
          });
        }
      }

      return await tx.workLog.update({
        where: { id },
        data: logData,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    return Response.json({ data: formatWorkLog(updatedLog) });
  } catch (error: unknown) {
    console.error("PATCH /api/logs/[id] error:", error);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = idSchema.safeParse(id);

    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    const existingLog = await prisma.workLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Work log not found.",
          },
        },
        { status: 404 }
      );
    }

    await prisma.workLog.delete({
      where: { id },
    });

    return Response.json({ data: { id } });
  } catch (error: unknown) {
    console.error("DELETE /api/logs/[id] error:", error);
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
