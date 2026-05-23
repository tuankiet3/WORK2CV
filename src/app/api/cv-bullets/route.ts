import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createValidationErrorResponse } from "@/validation";
import { z } from "zod";
import { CV_TONES } from "@/constants";
import { createClient } from "@/lib/supabase/server";

// Zod schema to validate saving a CV bullet
const saveCvBulletSchema = z.object({
  sourceLogIds: z
    .array(z.string().uuid({ message: "Invalid log ID format" }))
    .min(1, { message: "At least one source log must be selected" }),
  content: z
    .string({ message: "Content is required" })
    .trim()
    .min(1, { message: "Content must not be empty" }),
  tone: z.enum(CV_TONES, {
    message: "Invalid CV tone",
  }),
});

export async function GET() {
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

    const bullets = await prisma.cvBullet.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ data: bullets });
  } catch (error: unknown) {
    console.error("GET /api/cv-bullets error:", error);
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

    const result = saveCvBulletSchema.safeParse(body);
    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    const { sourceLogIds, content, tone } = result.data;

    // Verify all source log IDs exist in the database and belong to the user
    const existingLogs = await prisma.workLog.findMany({
      where: {
        id: { in: sourceLogIds },
        userId: user.id,
      },
    });

    if (existingLogs.length !== sourceLogIds.length) {
      const foundIds = existingLogs.map((l) => l.id);
      const missingIds = sourceLogIds.filter((id) => !foundIds.includes(id));
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed.",
            details: missingIds.map((id) => ({
              field: "sourceLogIds",
              message: `Log ID ${id} does not exist or does not belong to you.`,
            })),
          },
        },
        { status: 400 }
      );
    }

    const newBullet = await prisma.cvBullet.create({
      data: {
        userId: user.id,
        sourceLogIds,
        content,
        tone,
      },
    });

    return Response.json({ data: newBullet }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/cv-bullets error:", error);
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
