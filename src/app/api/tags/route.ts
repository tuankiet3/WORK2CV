import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTagSchema, createValidationErrorResponse } from "@/validation";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
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

    // Check case-insensitive duplicate within the same category
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        category,
      },
    });

    if (existingTag) {
      // Return the existing tag to prevent duplicate category/name pairs (reusing existing)
      return Response.json({ data: existingTag }, { status: 200 });
    }

    // Create the new tag
    const newTag = await prisma.tag.create({
      data: {
        name,
        category,
      },
    });

    return Response.json({ data: newTag }, { status: 201 });
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
