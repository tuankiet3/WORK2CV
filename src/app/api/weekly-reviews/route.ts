import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { weeklyReviewSchema, createValidationErrorResponse } from "@/validation";
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

    const reviews = await prisma.weeklyReview.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        weekStart: "desc",
      },
    });

    const data = reviews.map(formatWeeklyReview);
    return Response.json({ data });
  } catch (error: unknown) {
    console.error("GET /api/weekly-reviews error:", error);
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

    const result = weeklyReviewSchema.safeParse(body);
    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    const { weekStart, weekEnd, shipped, blockers, learned, collaboration, nextFocus } = result.data;

    // Check if duplicate week range exists for this user
    const existing = await prisma.weeklyReview.findUnique({
      where: {
        weekStart_weekEnd_userId: {
          weekStart,
          weekEnd,
          userId: user.id,
        },
      },
    });

    if (existing) {
      // Overwrite/update existing record predictably
      const updated = await prisma.weeklyReview.update({
        where: { id: existing.id },
        data: {
          shipped: shipped || null,
          blockers: blockers || null,
          learned: learned || null,
          collaboration: collaboration || null,
          nextFocus: nextFocus || null,
        },
      });
      return Response.json({ data: formatWeeklyReview(updated) }, { status: 200 });
    }

    // Create a new record
    const newReview = await prisma.weeklyReview.create({
      data: {
        userId: user.id,
        weekStart,
        weekEnd,
        shipped: shipped || null,
        blockers: blockers || null,
        learned: learned || null,
        collaboration: collaboration || null,
        nextFocus: nextFocus || null,
      },
    });

    return Response.json({ data: formatWeeklyReview(newReview) }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/weekly-reviews error:", error);
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
