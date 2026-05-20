import { z } from "zod";
import {
  TASK_TYPES,
  IMPACT_LEVELS,
  TAG_CATEGORIES,
  CV_TONES,
  EXPORT_TYPES,
} from "../constants";

// Helper to format Zod errors consistently
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export function formatZodError(error: z.ZodError): ValidationErrorDetail[] {
  return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}


export function createValidationErrorResponse(error: z.ZodError) {
  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Validation failed.",
      details: formatZodError(error),
    },
  };
}

// 1. Tag Schema
export const createTagSchema = z.object({
  name: z
    .string({ message: "Tag name is required" })
    .trim()
    .min(1, "Tag name must not be empty"),
  category: z.enum(TAG_CATEGORIES, {
    message: "Invalid tag category",
  }),
});

export const createWorkLogSchema = z.object({
  date: z.coerce.date({
    message: "Invalid date format",
  }),
  title: z
    .string({ message: "Title is required" })
    .trim()
    .min(1, "Title must not be empty"),
  description: z.string().trim().optional().nullable(),
  taskType: z.enum(TASK_TYPES, {
    message: "Invalid task type",
  }),
  impactLevel: z.enum(IMPACT_LEVELS, {
    message: "Invalid impact level",
  }),
  problem: z.string().trim().optional().nullable(),
  solution: z.string().trim().optional().nullable(),
  learning: z.string().trim().optional().nullable(),
  links: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Link must not be empty")
        .url("Invalid URL format")
    )
    .optional()
    .default([]),
  tagIds: z.array(z.string().uuid("Invalid tag ID format")).optional().default([]),
});

export const updateWorkLogSchema = createWorkLogSchema.partial();

export const weeklyReviewSchema = z
  .object({
    weekStart: z.coerce.date({
      message: "Invalid week start date format",
    }),
    weekEnd: z.coerce.date({
      message: "Invalid week end date format",
    }),
    shipped: z.string().trim().optional().nullable(),
    blockers: z.string().trim().optional().nullable(),
    learned: z.string().trim().optional().nullable(),
    collaboration: z.string().trim().optional().nullable(),
    nextFocus: z.string().trim().optional().nullable(),
  })
  .refine((data) => data.weekStart <= data.weekEnd, {
    message: "Week start date must not be after week end date",
    path: ["weekStart"],
  });

// 4. CV Bullet Generation & Save Schemas
export const cvBulletGenerateSchema = z.object({
  sourceLogIds: z
    .array(z.string().uuid("Invalid log ID format"))
    .min(1, "At least one source log must be selected"),
  tone: z.enum(CV_TONES, {
    message: "Invalid CV tone",
  }),
});

export const createCvBulletSchema = z.object({
  sourceLogIds: z
    .array(z.string().uuid("Invalid log ID format"))
    .min(1, "At least one source log must be selected"),
  content: z
    .string({ message: "Content is required" })
    .trim()
    .min(1, "Content must not be empty"),
  tone: z.enum(CV_TONES, {
    message: "Invalid CV tone",
  }),
});

// 5. Export Request Schema
export const exportRequestSchema = z.object({
  type: z.enum(EXPORT_TYPES, {
    message: "Invalid export type",
  }),
  weekStart: z.coerce.date().optional(),
  weekEnd: z.coerce.date().optional(),
  tagIds: z.array(z.string().uuid("Invalid tag ID format")).optional(),
});
