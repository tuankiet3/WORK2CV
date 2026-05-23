import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCvBullets } from "@/lib/cvGenerator";
import { createValidationErrorResponse } from "@/validation";
import { z } from "zod";
import { CV_TONES } from "@/constants";
import { createClient } from "@/lib/supabase/server";

// Target section enum options
const TARGET_SECTIONS = ["project", "work_experience", "skills_evidence", "internship_report"] as const;

// Zod schema for generation request
const generateRequestSchema = z.object({
  logIds: z
    .array(z.string().uuid({ message: "Invalid log ID format" }))
    .min(1, { message: "At least one log ID must be selected" })
    .optional(),
  sourceLogIds: z
    .array(z.string().uuid({ message: "Invalid log ID format" }))
    .min(1, { message: "At least one source log ID must be selected" })
    .optional(),
  tone: z.enum(CV_TONES, {
    message: "Invalid CV tone",
  }).optional(),
  targetSection: z.enum(TARGET_SECTIONS, {
    message: "Invalid target section",
  }).optional(),
}).refine(
  (data) => !!data.logIds || !!data.sourceLogIds,
  {
    message: "Either logIds or sourceLogIds must be provided",
    path: ["logIds"],
  }
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
          },
        },
        { status: 401 }
      );
    }

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

    const result = generateRequestSchema.safeParse(body);
    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    // Unify logIds and sourceLogIds
    const logIds = result.data.logIds || result.data.sourceLogIds || [];

    // Verify all log IDs exist in the database and belong to the user
    const existingLogs = await prisma.workLog.findMany({
      where: {
        id: { in: logIds },
        userId: user.id,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (existingLogs.length !== logIds.length) {
      const foundIds = existingLogs.map((l) => l.id);
      const missingIds = logIds.filter((id) => !foundIds.includes(id));
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed.",
            details: missingIds.map((id) => ({
              field: "logIds",
              message: `Log ID ${id} does not exist or does not belong to you.`,
            })),
          },
        },
        { status: 400 }
      );
    }

    // Order existingLogs to match the order of input logIds to keep it predictable
    const orderedLogs = logIds
      .map((id) => existingLogs.find((l) => l.id === id))
      .filter((l): l is typeof existingLogs[0] => !!l);

    // Format tags from db to match generator input shape
    const formattedLogs = orderedLogs.map((log) => ({
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
      })),
    }));

    // Call offline generator logic
    const generatorOutput = generateCvBullets(formattedLogs);

    // Create the structured list of variants with target section and labels
    const allVariants = [
      {
        targetSection: "project",
        label: "Projects Section",
        content: generatorOutput.project,
      },
      {
        targetSection: "work_experience",
        label: "Work Experience Section",
        content: generatorOutput.workExperience,
      },
      {
        targetSection: "skills_evidence",
        label: "Skills Evidence Section",
        content: generatorOutput.skillsEvidence,
      },
      {
        targetSection: "internship_report",
        label: "Internship Report Section",
        content: generatorOutput.internshipReport,
      },
    ];

    // If targetSection was explicitly requested, filter to only that variant, or keep all
    const filteredVariants = result.data.targetSection
      ? allVariants.filter((v) => v.targetSection === result.data.targetSection)
      : allVariants;

    return Response.json({
      data: {
        variants: filteredVariants,
        ...(generatorOutput.projectEntry ? { projectEntry: generatorOutput.projectEntry } : {}),
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/cv-bullets/generate error:", error);
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
