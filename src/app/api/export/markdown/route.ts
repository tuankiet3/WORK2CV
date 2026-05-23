import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createValidationErrorResponse } from "@/validation";
import { z } from "zod";
import {
  exportLogsToMarkdown,
  exportWeeklyReviewsToMarkdown,
  exportCvBulletsToMarkdown,
  exportFullSummaryToMarkdown,
} from "@/lib/exportFormatter";
import { createClient } from "@/lib/supabase/server";

const EXPORT_TYPES = ["logs", "weekly_review", "cv_bullets", "full_summary"] as const;

const exportRequestSchema = z.object({
  type: z.enum(EXPORT_TYPES, {
    message: "Invalid export type. Must be one of: logs, weekly_review, cv_bullets, full_summary",
  }),
  ids: z
    .array(z.string().uuid({ message: "Invalid ID format. Must be a valid UUID" }))
    .optional(),
});

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

    const result = exportRequestSchema.safeParse(body);
    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    const { type, ids: rawIds = [] } = result.data;
    const ids = Array.from(new Set(rawIds));

    let markdown = "";

    if (type === "logs") {
      let dbLogs;
      if (ids.length > 0) {
        dbLogs = await prisma.workLog.findMany({
          where: {
            id: { in: ids },
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

        if (dbLogs.length !== ids.length) {
          const foundIds = dbLogs.map((l) => l.id);
          const missingIds = ids.filter((id) => !foundIds.includes(id));
          return Response.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "Validation failed.",
                details: missingIds.map((id) => ({
                  field: "ids",
                  message: `WorkLog ID ${id} does not exist or does not belong to you.`,
                })),
              },
            },
            { status: 400 }
          );
        }
      } else {
        dbLogs = await prisma.workLog.findMany({
          where: {
            userId: user.id,
          },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: { date: "desc" },
        });
      }

      // Format work logs matching logFormatter input structure
      const formattedLogs = dbLogs.map((log) => ({
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

      markdown = exportLogsToMarkdown(formattedLogs);
    } else if (type === "weekly_review") {
      let dbReviews;
      if (ids.length > 0) {
        dbReviews = await prisma.weeklyReview.findMany({
          where: {
            id: { in: ids },
            userId: user.id,
          },
        });

        if (dbReviews.length !== ids.length) {
          const foundIds = dbReviews.map((r) => r.id);
          const missingIds = ids.filter((id) => !foundIds.includes(id));
          return Response.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "Validation failed.",
                details: missingIds.map((id) => ({
                  field: "ids",
                  message: `WeeklyReview ID ${id} does not exist or does not belong to you.`,
                })),
              },
            },
            { status: 400 }
          );
        }
      } else {
        dbReviews = await prisma.weeklyReview.findMany({
          where: {
            userId: user.id,
          },
          orderBy: { weekStart: "desc" },
        });
      }

      const formattedReviews = dbReviews.map((review) => ({
        id: review.id,
        weekStart: review.weekStart.toISOString().split("T")[0],
        weekEnd: review.weekEnd.toISOString().split("T")[0],
        shipped: review.shipped,
        blockers: review.blockers,
        learned: review.learned,
        collaboration: review.collaboration,
        nextFocus: review.nextFocus,
        createdAt: review.createdAt.toISOString(),
      }));

      markdown = exportWeeklyReviewsToMarkdown(formattedReviews);
    } else if (type === "cv_bullets") {
      let dbBullets;
      if (ids.length > 0) {
        dbBullets = await prisma.cvBullet.findMany({
          where: {
            id: { in: ids },
            userId: user.id,
          },
        });

        if (dbBullets.length !== ids.length) {
          const foundIds = dbBullets.map((b) => b.id);
          const missingIds = ids.filter((id) => !foundIds.includes(id));
          return Response.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "Validation failed.",
                details: missingIds.map((id) => ({
                  field: "ids",
                  message: `CvBullet ID ${id} does not exist or does not belong to you.`,
                })),
              },
            },
            { status: 400 }
          );
        }
      } else {
        dbBullets = await prisma.cvBullet.findMany({
          where: {
            userId: user.id,
          },
          orderBy: { createdAt: "desc" },
        });
      }

      const formattedBullets = dbBullets.map((bullet) => ({
        id: bullet.id,
        content: bullet.content,
        tone: bullet.tone,
        createdAt: bullet.createdAt.toISOString(),
        sourceLogIds: bullet.sourceLogIds,
      }));

      markdown = exportCvBulletsToMarkdown(formattedBullets);
    } else if (type === "full_summary") {
      const [dbLogs, dbReviews, dbBullets] = await Promise.all([
        prisma.workLog.findMany({
          where: {
            userId: user.id,
          },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: { date: "desc" },
        }),
        prisma.weeklyReview.findMany({
          where: {
            userId: user.id,
          },
          orderBy: { weekStart: "desc" },
        }),
        prisma.cvBullet.findMany({
          where: {
            userId: user.id,
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const formattedLogs = dbLogs.map((log) => ({
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

      const formattedReviews = dbReviews.map((review) => ({
        id: review.id,
        weekStart: review.weekStart.toISOString().split("T")[0],
        weekEnd: review.weekEnd.toISOString().split("T")[0],
        shipped: review.shipped,
        blockers: review.blockers,
        learned: review.learned,
        collaboration: review.collaboration,
        nextFocus: review.nextFocus,
        createdAt: review.createdAt.toISOString(),
      }));

      const formattedBullets = dbBullets.map((bullet) => ({
        id: bullet.id,
        content: bullet.content,
        tone: bullet.tone,
        createdAt: bullet.createdAt.toISOString(),
        sourceLogIds: bullet.sourceLogIds,
      }));

      markdown = exportFullSummaryToMarkdown(formattedLogs, formattedReviews, formattedBullets);
    }

    return Response.json({
      data: {
        markdown,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/export/markdown error:", error);
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
