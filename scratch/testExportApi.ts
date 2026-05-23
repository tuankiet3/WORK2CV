import "dotenv/config";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/prisma";
import { POST as exportMarkdown } from "../src/app/api/export/markdown/route";

async function runTest(
  name: string,
  testFn: () => Promise<{ success: boolean; message: string }>
) {
  try {
    const result = await testFn();
    if (result.success) {
      console.log(`✅ [PASS] ${name}: ${result.message}`);
    } else {
      console.error(`❌ [FAIL] ${name}: ${result.message}`);
      process.exit(1);
    }
  } catch (error: unknown) {
    console.error(`💥 [CRASH] ${name} threw an error:`, error);
    process.exit(1);
  }
}

async function main() {
  console.log("🏃 Running Markdown Export API Route Smoke Tests...");

  // Setup temporary test records
  console.log("ℹ️ Preparing database state for export tests...");
  
  // 1. Create a work log with some fields empty, some present
  const testLog = await prisma.workLog.create({
    data: {
      userId: "00000000-0000-0000-0000-000000000000",
      date: new Date("2026-05-23"),
      title: "Test Log for Markdown Export",
      taskType: "feature",
      impactLevel: "implemented",
      description: "This is a descriptive summary of the work done.",
      problem: "Ran into a configuration bug.",
      solution: "Updated the database URL string.",
      // learning, links are intentionally left empty/unset to test omitting
      links: [],
    },
  });

  // 2. Create a weekly review
  const testReview = await prisma.weeklyReview.create({
    data: {
      userId: "00000000-0000-0000-0000-000000000000",
      weekStart: new Date("2026-05-18"),
      weekEnd: new Date("2026-05-24"),
      shipped: "Shipped the export engine.",
      blockers: "", // empty blockers
      learned: "Learned markdown formatting standards.",
      collaboration: "Collaborated with team on reviews.",
      nextFocus: "Wrap up the final MVP deliverables.",
    },
  });

  // 3. Create a CV Bullet accomplishment
  const testBullet = await prisma.cvBullet.create({
    data: {
      userId: "00000000-0000-0000-0000-000000000000",
      sourceLogIds: [testLog.id],
      content: "Developed the core markdown export engine using Next.js route handlers.",
      tone: "concise_cv",
    },
  });

  const testLogId = testLog.id;
  const testReviewId = testReview.id;
  const testBulletId = testBullet.id;

  const malformedUuid = "not-a-uuid-format";
  const unknownUuid = "99999999-9999-9999-9999-999999999999";

  // --- TEST CASES ---

  // Test 1: Export Log Success (Selected IDs)
  await runTest("POST /api/export/markdown: Logs export with selected IDs", async () => {
    const body = {
      type: "logs",
      ids: [testLogId],
    };
    const req = new NextRequest("http://localhost/api/export/markdown", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await exportMarkdown(req);
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    const md = data.data?.markdown;
    if (!md || !md.includes("Test Log for Markdown Export")) {
      return { success: false, message: `Markdown output incorrect: ${md}` };
    }

    // Verify empty optional fields are omitted (learning and links)
    if (md.includes("Key Learnings") || md.includes("Links & PRs")) {
      return { success: false, message: `Expected omitted optional fields to not appear in markdown. Got: ${md}` };
    }

    return { success: true, message: "Logs exported correctly and empty optional fields omitted." };
  });

  // Test 2: Export Weekly Review Success (Selected ID)
  await runTest("POST /api/export/markdown: Weekly Review export", async () => {
    const body = {
      type: "weekly_review",
      ids: [testReviewId],
    };
    const req = new NextRequest("http://localhost/api/export/markdown", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await exportMarkdown(req);
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    const md = data.data?.markdown;
    if (!md || !md.includes("Shipped the export engine.")) {
      return { success: false, message: `Markdown output incorrect: ${md}` };
    }

    // Check that blockers (which is empty string) is omitted cleanly
    if (md.includes("Blockers & Challenges")) {
      return { success: false, message: `Expected empty blockers section to be omitted. Got: ${md}` };
    }

    return { success: true, message: "Weekly review exported and empty blockers omitted." };
  });

  // Test 3: Export CV Bullets Success (Selected ID)
  await runTest("POST /api/export/markdown: CV Bullets export", async () => {
    const body = {
      type: "cv_bullets",
      ids: [testBulletId],
    };
    const req = new NextRequest("http://localhost/api/export/markdown", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await exportMarkdown(req);
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    const md = data.data?.markdown;
    if (!md || !md.includes("Developed the core markdown export engine")) {
      return { success: false, message: `Markdown output incorrect: ${md}` };
    }

    return { success: true, message: "CV Bullet exported correctly." };
  });

  // Test 4: Export Full Summary (All records)
  await runTest("POST /api/export/markdown: Full Summary export", async () => {
    const body = {
      type: "full_summary",
    };
    const req = new NextRequest("http://localhost/api/export/markdown", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await exportMarkdown(req);
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    const md = data.data?.markdown;
    if (!md || !md.includes("Internship Summary Report") || !md.includes("Progress Overview")) {
      return { success: false, message: `Markdown output incorrect: ${md}` };
    }

    return { success: true, message: "Full internship summary generated successfully." };
  });

  // Test 5: Validation - Invalid type
  await runTest("POST /api/export/markdown: Validation - Invalid export type", async () => {
    const body = {
      type: "invalid_type",
    };
    const req = new NextRequest("http://localhost/api/export/markdown", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await exportMarkdown(req);
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Rejected invalid export type." };
  });

  // Test 6: Validation - Malformed ID
  await runTest("POST /api/export/markdown: Validation - Malformed ID format", async () => {
    const body = {
      type: "logs",
      ids: [malformedUuid],
    };
    const req = new NextRequest("http://localhost/api/export/markdown", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await exportMarkdown(req);
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Rejected malformed UUID." };
  });

  // Test 7: Validation - Unknown ID
  await runTest("POST /api/export/markdown: Validation - Unknown Log ID", async () => {
    const body = {
      type: "logs",
      ids: [unknownUuid],
    };
    const req = new NextRequest("http://localhost/api/export/markdown", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await exportMarkdown(req);
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Rejected unknown Log ID." };
  });

  // Test 8: Export with duplicate Log IDs (should deduplicate and succeed)
  await runTest("POST /api/export/markdown: Deduplicates duplicate Log IDs and succeeds", async () => {
    const body = {
      type: "logs",
      ids: [testLogId, testLogId],
    };
    const req = new NextRequest("http://localhost/api/export/markdown", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await exportMarkdown(req);
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    const md = data.data?.markdown;
    if (!md || !md.includes("Test Log for Markdown Export")) {
      return { success: false, message: `Markdown output incorrect: ${md}` };
    }

    return { success: true, message: "Successfully handled duplicate Log IDs in request." };
  });

  // Cleanup temporary test records
  console.log("🧹 Cleaning up test database records...");
  await Promise.all([
    prisma.workLog.delete({ where: { id: testLogId } }),
    prisma.weeklyReview.delete({ where: { id: testReviewId } }),
    prisma.cvBullet.delete({ where: { id: testBulletId } }),
  ]);

  console.log("\n🎉 ALL MARKDOWN EXPORT API TESTS PASSED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
