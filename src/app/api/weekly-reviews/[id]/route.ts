import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createValidationErrorResponse, strictDateSchema } from "@/validation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

function formatWeeklyReview(review: {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  shipped: string | null;
  blockers: string | null;
  learned: string | null;
  collaboration: string | null;
  nextFocus: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: review.id,
    weekStart: review.weekStart.toISOString().split("T")[0],
    weekEnd: review.weekEnd.toISOString().split("T")[0],
    shipped: review.shipped,
    blockers: review.blockers,
    learned: review.learned,
    collaboration: review.collaboration,
    nextFocus: review.nextFocus,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

const updateWeeklyReviewSchema = z.object({
  weekStart: strictDateSchema.optional(),
  weekEnd: strictDateSchema.optional(),
  shipped: z.string().trim().optional().nullable(),
  blockers: z.string().trim().optional().nullable(),
  learned: z.string().trim().optional().nullable(),
  collaboration: z.string().trim().optional().nullable(),
  nextFocus: z.string().trim().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ID format
    const idValidation = z.string().uuid({ message: "Invalid weekly review ID format" }).safeParse(id);
    if (!idValidation.success) {
      return Response.json(createValidationErrorResponse(idValidation.error), {
        status: 400,
      });
    }

    // Retrieve existing review owned by this user
    const existing = await prisma.weeklyReview.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `Weekly review with ID ${id} not found.`,
          },
        },
        { status: 404 }
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

    const result = updateWeeklyReviewSchema.safeParse(body);
    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    const weekStart = result.data.weekStart ?? existing.weekStart;
    const weekEnd = result.data.weekEnd ?? existing.weekEnd;

    // Validate date range constraints
    if (weekStart > weekEnd) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed.",
            details: [
              {
                field: "weekStart",
                message: "Week start date must not be after week end date",
              },
            ],
          },
        },
        { status: 400 }
      );
    }

    // Prevent duplicate week conflicts for this user
    if (result.data.weekStart || result.data.weekEnd) {
      const duplicate = await prisma.weeklyReview.findFirst({
        where: {
          weekStart,
          weekEnd,
          userId: user.id,
          id: { not: id },
        },
      });

      if (duplicate) {
        return Response.json(
          {
            error: {
              code: "CONFLICT",
              message: "A weekly review already exists for this week range.",
            },
          },
          { status: 409 }
        );
      }
    }

    // Update the review
    const updated = await prisma.weeklyReview.update({
      where: { id },
      data: {
        weekStart,
        weekEnd,
        shipped: result.data.shipped !== undefined ? result.data.shipped : existing.shipped,
        blockers: result.data.blockers !== undefined ? result.data.blockers : existing.blockers,
        learned: result.data.learned !== undefined ? result.data.learned : existing.learned,
        collaboration: result.data.collaboration !== undefined ? result.data.collaboration : existing.collaboration,
        nextFocus: result.data.nextFocus !== undefined ? result.data.nextFocus : existing.nextFocus,
      },
    });

    return Response.json({ data: formatWeeklyReview(updated) });
  } catch (error: unknown) {
    console.error("PATCH /api/weekly-reviews/[id] error:", error);
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ID format
    const idValidation = z.string().uuid({ message: "Invalid weekly review ID format" }).safeParse(id);
    if (!idValidation.success) {
      return Response.json(createValidationErrorResponse(idValidation.error), {
        status: 400,
      });
    }

    // Check existence and ownership
    const existing = await prisma.weeklyReview.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `Weekly review with ID ${id} not found.`,
          },
        },
        { status: 404 }
      );
    }

    // Delete the review
    await prisma.weeklyReview.delete({
      where: { id },
    });

    return Response.json({ data: { id } });
  } catch (error: unknown) {
    console.error("DELETE /api/weekly-reviews/[id] error:", error);
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
