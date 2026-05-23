import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { createTagSchema, createValidationErrorResponse } from "@/validation";
import { createClient } from "@/lib/supabase/server";

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

    const tags = await prisma.tag.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    return Response.json({ data: tags });
  } catch (error: unknown) {
    console.error("GET /api/tags error:", error);
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

    const result = createTagSchema.safeParse(body);
    if (!result.success) {
      return Response.json(createValidationErrorResponse(result.error), {
        status: 400,
      });
    }

    const { name, category } = result.data;

    // Check case-insensitive duplicate within the same category for this user
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        category,
        userId: user.id,
      },
    });

    if (existingTag) {
      // Return the existing tag to prevent duplicate category/name pairs (reusing existing)
      return Response.json({ data: existingTag }, { status: 200 });
    }

    // Create the new tag with race-condition safety
    try {
      const newTag = await prisma.tag.create({
        data: {
          name,
          category,
          userId: user.id,
        },
      });

      return Response.json({ data: newTag }, { status: 201 });
    } catch (createError: unknown) {
      // Catch duplicate key race conditions (Prisma error code P2002)
      if (
        createError instanceof Prisma.PrismaClientKnownRequestError &&
        createError.code === "P2002"
      ) {
        const raceExistingTag = await prisma.tag.findFirst({
          where: {
            name: {
              equals: name,
              mode: "insensitive",
            },
            category,
            userId: user.id,
          },
        });
        if (raceExistingTag) {
          return Response.json({ data: raceExistingTag }, { status: 200 });
        }
      }
      throw createError; // Re-throw other database or system errors
    }
  } catch (error: unknown) {
    console.error("POST /api/tags error:", error);
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

