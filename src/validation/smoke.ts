import {
  createTagSchema,
  createWorkLogSchema,
  weeklyReviewSchema,
  cvBulletGenerateSchema,
  exportRequestSchema,
  formatZodError,
} from "./index";

import { z } from "zod";

function runTest(name: string, schema: z.ZodTypeAny, payload: unknown, shouldPass: boolean) {
  const result = schema.safeParse(payload);
  if (result.success && shouldPass) {
    console.log(`✅ [PASS] ${name}`);
  } else if (!result.success && !shouldPass) {
    const errors = formatZodError(result.error);
    console.log(`✅ [FAIL EXPECTED] ${name}:`, JSON.stringify(errors));
  } else {
    console.error(`❌ [ERROR] ${name}: Got success=${result.success}, expected success=${shouldPass}`);
    if (!result.success) {
      console.error("Errors detail:", formatZodError(result.error));
    }
    process.exit(1);
  }
}


console.log("🏃 Running Validation Schema Smoke Tests...\n");

// 1. WorkLog Tests
runTest(
  "WorkLog: Valid payload",
  createWorkLogSchema,
  {
    date: "2026-05-20",
    title: "Configure Zod Validation Schemas",
    description: "Added create and update schemas.",
    taskType: "feature",
    impactLevel: "implemented",
    links: ["https://example.com/pr/10"],
    tagIds: ["c27b0b23-2895-46fb-9769-cf2b083c27cc"],
  },
  true
);

runTest(
  "WorkLog: Missing title error",
  createWorkLogSchema,
  {
    date: "2026-05-20",
    taskType: "feature",
    impactLevel: "implemented",
  },
  false
);

runTest(
  "WorkLog: Missing date error",
  createWorkLogSchema,
  {
    title: "Hello World",
    taskType: "feature",
    impactLevel: "implemented",
  },
  false
);

runTest(
  "WorkLog: Invalid date (2026-02-31)",
  createWorkLogSchema,
  {
    date: "2026-02-31",
    title: "Testing invalid calendar date",
    taskType: "testing",
    impactLevel: "implemented",
  },
  false
);

runTest(
  "WorkLog: Invalid date (2026-13-01)",
  createWorkLogSchema,
  {
    date: "2026-13-01",
    title: "Testing invalid calendar date",
    taskType: "testing",
    impactLevel: "implemented",
  },
  false
);

runTest(
  "WorkLog: Invalid date (abc)",
  createWorkLogSchema,
  {
    date: "abc",
    title: "Testing invalid calendar date",
    taskType: "testing",
    impactLevel: "implemented",
  },
  false
);

runTest(
  "WorkLog: Invalid date (empty string)",
  createWorkLogSchema,
  {
    date: "",
    title: "Testing invalid calendar date",
    taskType: "testing",
    impactLevel: "implemented",
  },
  false
);

runTest(
  "WorkLog: Invalid task type error",
  createWorkLogSchema,
  {
    date: "2026-05-20",
    title: "Invalid task type test",
    taskType: "invalid_type",
    impactLevel: "implemented",
  },
  false
);

runTest(
  "WorkLog: Invalid impact level error",
  createWorkLogSchema,
  {
    date: "2026-05-20",
    title: "Invalid impact level test",
    taskType: "feature",
    impactLevel: "god_mode",
  },
  false
);

runTest(
  "WorkLog: Invalid link URL",
  createWorkLogSchema,
  {
    date: "2026-05-20",
    title: "Invalid URL test",
    taskType: "feature",
    impactLevel: "implemented",
    links: ["not-a-url"],
  },
  false
);

// 2. Tag Tests
runTest(
  "Tag: Valid payload",
  createTagSchema,
  {
    name: "React",
    category: "tech",
  },
  true
);

runTest(
  "Tag: Invalid tag category",
  createTagSchema,
  {
    name: "React",
    category: "programming_language",
  },
  false
);

// 3. WeeklyReview Tests
runTest(
  "WeeklyReview: Valid range",
  weeklyReviewSchema,
  {
    weekStart: "2026-05-11",
    weekEnd: "2026-05-17",
    shipped: "Scaffolded app.",
  },
  true
);

runTest(
  "WeeklyReview: Invalid date order (weekStart after weekEnd)",
  weeklyReviewSchema,
  {
    weekStart: "2026-05-18",
    weekEnd: "2026-05-17",
  },
  false
);

// 4. CV Bullet Generation Tests
runTest(
  "CV Bullet: Valid payload",
  cvBulletGenerateSchema,
  {
    sourceLogIds: ["c27b0b23-2895-46fb-9769-cf2b083c27cc"],
    tone: "concise_cv",
  },
  true
);

runTest(
  "CV Bullet: Empty selected log IDs",
  cvBulletGenerateSchema,
  {
    sourceLogIds: [],
    tone: "concise_cv",
  },
  false
);

// 5. Export Request Tests
runTest(
  "Export: Valid payload",
  exportRequestSchema,
  {
    type: "logs",
  },
  true
);

runTest(
  "Export: Invalid export type",
  exportRequestSchema,
  {
    type: "spreadsheet",
  },
  false
);

console.log("\n🎉 All Validation Smoke Tests Passed Successfully!");
