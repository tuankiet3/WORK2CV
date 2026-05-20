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

// Strict Date Validation Schema (YYYY-MM-DD)
// Accepts a YYYY-MM-DD string, parses to Date in UTC, and validates calendar math correctness.
export const strictDateSchema = z.preprocess((val) => {
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }
  return val;
}, z
  .string({ message: "Date is required" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (must be YYYY-MM-DD)" })
  .transform((val, ctx) => {
    const [yearStr, monthStr, dayStr] = val.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid calendar date",
      });
      return z.NEVER;
    }
    return date;
  }));

// 1. Tag Schema
export const createTagSchema = z.object({
  name: z
    .string({ message: "Tag name is required" })
    .trim()
    .min(1, "Tag name must not be empty")
    .max(50, "Tag name must be 50 characters or less"),
  category: z.enum(TAG_CATEGORIES, {
    message: "Invalid tag category",
  }),
});

// 2. WorkLog Schemas
export const createWorkLogSchema = z.object({
  date: strictDateSchema,
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

// 3. WeeklyReview Schema
export const weeklyReviewSchema = z
  .object({
    weekStart: strictDateSchema,
    weekEnd: strictDateSchema,
    shipped: z.string().trim().optional().nullable(),
    blockers: z.string().trim().optional().nullable(),
    learned: z.string().trim().optional().nullable(),
    collaboration: z.string().trim().optional().nullable(),
    nextFocus: z.string().trim().optional().nullable(),
  })
  .refine((data) => {
    // If either date is invalid, they will not be valid Date objects.
    // Safe check: make sure they are both valid dates.
    if (!(data.weekStart instanceof Date) || !(data.weekEnd instanceof Date)) {
      return false;
    }
    return data.weekStart <= data.weekEnd;
  }, {
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
  weekStart: strictDateSchema.optional(),
  weekEnd: strictDateSchema.optional(),
  tagIds: z.array(z.string().uuid("Invalid tag ID format")).optional(),
});
