import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createValidationErrorResponse } from "@/validation";
import { z } from "zod";

// Zod schema for route param validation
const paramSchema = z.object({
  id: z.string().uuid({ message: "Invalid CV bullet ID format" }),
});

// Zod schema for updating a CV bullet
const updateCvBulletSchema = z.object({
  content: z
    .string({ message: "Content is required" })
    .trim()
    .min(1, { message: "Content must not be empty" }),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const paramResult = paramSchema.safeParse(resolvedParams);
    if (!paramResult.success) {
      return Response.json(createValidationErrorResponse(paramResult.error), {
        status: 400,
      });
    }

    const { id } = paramResult.data;

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

    const bodyResult = updateCvBulletSchema.safeParse(body);
    if (!bodyResult.success) {
      return Response.json(createValidationErrorResponse(bodyResult.error), {
        status: 400,
      });
    }

    const { content } = bodyResult.data;

    // Check if CV bullet exists
    const existingBullet = await prisma.cvBullet.findUnique({
      where: { id },
    });

    if (!existingBullet) {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `CV Bullet with ID ${id} not found.`,
          },
        },
        { status: 404 }
      );
    }

    const updatedBullet = await prisma.cvBullet.update({
      where: { id },
      data: { content },
    });

    return Response.json({ data: updatedBullet });
  } catch (error: unknown) {
    console.error("PATCH /api/cv-bullets/[id] error:", error);
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
    const resolvedParams = await params;
    const paramResult = paramSchema.safeParse(resolvedParams);
    if (!paramResult.success) {
      return Response.json(createValidationErrorResponse(paramResult.error), {
        status: 400,
      });
    }

    const { id } = paramResult.data;

    // Check if CV bullet exists
    const existingBullet = await prisma.cvBullet.findUnique({
      where: { id },
    });

    if (!existingBullet) {
      return Response.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `CV Bullet with ID ${id} not found.`,
          },
        },
        { status: 404 }
      );
    }

    await prisma.cvBullet.delete({
      where: { id },
    });

    return Response.json({
      data: {
        id,
      },
    });
  } catch (error: unknown) {
    console.error("DELETE /api/cv-bullets/[id] error:", error);
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
