import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
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

    // Dependency-safe order deletion
    await prisma.$transaction(async (tx) => {
      // 1. Delete user's CV bullets
      await tx.cvBullet.deleteMany({
        where: { userId: user.id },
      });

      // 2. Delete user's weekly reviews
      await tx.weeklyReview.deleteMany({
        where: { userId: user.id },
      });

      // 3. Delete user's work logs (Prisma cascades deletion of WorkLogTag rows automatically)
      await tx.workLog.deleteMany({
        where: { userId: user.id },
      });

      // 4. Delete user's tags
      await tx.tag.deleteMany({
        where: { userId: user.id },
      });
    });

    return Response.json({
      data: {
        success: true,
        message: "All account logs and data have been wiped successfully.",
      },
    });
  } catch (error: unknown) {
    console.error("DELETE /api/account/wipe error:", error);
    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred while wiping data.",
        },
      },
      { status: 500 }
    );
  }
}
