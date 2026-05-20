import "dotenv/config";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "../app/api/tags/route";

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
  console.log("🏃 Running Tags API Route Smoke Tests...");

  // 1. Backup all existing database records to prevent losing user data
  console.log("💾 Backing up database records...");
  const originalWorkLogTags = await prisma.workLogTag.findMany();
  const originalWorkLogs = await prisma.workLog.findMany();
  const originalTags = await prisma.tag.findMany();
  const originalWeeklyReviews = await prisma.weeklyReview.findMany();
  const originalCvBullets = await prisma.cvBullet.findMany();

  try {
    // 2. Clear all tables in strict dependency order
    console.log("🗑️ Temporarily clearing database for clean-state testing...");
    await prisma.workLogTag.deleteMany();
    await prisma.workLog.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.weeklyReview.deleteMany();
    await prisma.cvBullet.deleteMany();

    // TEST 1: List with empty database
    await runTest("GET: List tags with empty database", async () => {
      const res = await GET();
      const data = await res.json();

      if (res.status !== 200) {
        return { success: false, message: `Expected status 200, got ${res.status}` };
      }

      if (!Array.isArray(data.data) || data.data.length !== 0) {
        return { success: false, message: `Expected empty array, got: ${JSON.stringify(data)}` };
      }

      return { success: true, message: "Returned empty list successfully." };
    });

    let reactTagId = "";

    // TEST 2.1: Create valid tech tag
    await runTest("POST: Create valid tech tag", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: "React", category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}. Body: ${JSON.stringify(body)}` };
      }

      if (!body.data?.id || body.data.name !== "React" || body.data.category !== "tech") {
        return { success: false, message: `Invalid response body structure: ${JSON.stringify(body)}` };
      }

      reactTagId = body.data.id;
      return { success: true, message: `Created tech tag React with ID ${reactTagId}` };
    });

    // TEST 2.2: Create valid tool tag
    await runTest("POST: Create valid tool tag", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: "Git", category: "tool" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}` };
      }

      if (body.data.name !== "Git" || body.data.category !== "tool") {
        return { success: false, message: `Invalid response: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Created tool tag Git successfully." };
    });

    // TEST 2.3: Create valid skill tag
    await runTest("POST: Create valid skill tag", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: "REST API Design", category: "skill" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}` };
      }

      if (body.data.name !== "REST API Design" || body.data.category !== "skill") {
        return { success: false, message: `Invalid response: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Created skill tag REST API Design successfully." };
    });

    // TEST 2.4: Create valid domain tag
    await runTest("POST: Create valid domain tag", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: "DevOps", category: "domain" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}` };
      }

      if (body.data.name !== "DevOps" || body.data.category !== "domain") {
        return { success: false, message: `Invalid response: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Created domain tag DevOps successfully." };
    });

    // TEST 3.1: Duplicate tag creation (exact match)
    await runTest("POST: Duplicate tag creation (exact match)", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: "React", category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 200) {
        return { success: false, message: `Expected status 200 for reuse, got ${res.status}` };
      }

      if (body.data.id !== reactTagId) {
        return { success: false, message: `Expected reused ID ${reactTagId}, got ${body.data?.id}` };
      }

      // Check DB count to make sure no new row was created
      const dbCount = await prisma.tag.count({
        where: { name: "React", category: "tech" },
      });
      if (dbCount !== 1) {
        return { success: false, message: `Expected 1 React tag in DB, found ${dbCount}` };
      }

      return { success: true, message: "Reused existing tag React successfully." };
    });

    // TEST 3.2: Duplicate tag creation (case-insensitive match)
    await runTest("POST: Duplicate tag creation (case-insensitive match)", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: "react", category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 200) {
        return { success: false, message: `Expected status 200 for reuse, got ${res.status}` };
      }

      if (body.data.id !== reactTagId) {
        return { success: false, message: `Expected reused ID ${reactTagId}, got ${body.data?.id}` };
      }

      // Verify DB still only contains the original capitalized React tag
      const exactReact = await prisma.tag.findMany({
        where: { name: "react", category: "tech" },
      });
      if (exactReact.length > 0) {
        return { success: false, message: `Database should not contain a lowercase 'react' tag.` };
      }

      return { success: true, message: "Reused existing capitalized tag React successfully." };
    });

    // TEST 4.1: Missing name
    await runTest("POST: Missing tag name", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 400) {
        return { success: false, message: `Expected status 400, got ${res.status}` };
      }

      if (body.error?.code !== "VALIDATION_ERROR") {
        return { success: false, message: `Expected error code VALIDATION_ERROR, got: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Rejected missing name with validation error." };
    });

    // TEST 4.2: Missing category
    await runTest("POST: Missing tag category", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: "Vue" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 400) {
        return { success: false, message: `Expected status 400, got ${res.status}` };
      }

      if (body.error?.code !== "VALIDATION_ERROR") {
        return { success: false, message: `Expected error code VALIDATION_ERROR, got: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Rejected missing category with validation error." };
    });

    // TEST 4.3: Invalid category
    await runTest("POST: Invalid tag category", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: "Vue", category: "invalid" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 400) {
        return { success: false, message: `Expected status 400, got ${res.status}` };
      }

      if (body.error?.code !== "VALIDATION_ERROR") {
        return { success: false, message: `Expected error code VALIDATION_ERROR, got: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Rejected invalid category with validation error." };
    });

    // TEST 4.4: Very long tag name
    await runTest("POST: Very long tag name (>50 chars)", async () => {
      const veryLongName = "a".repeat(51);
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: veryLongName, category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 400) {
        return { success: false, message: `Expected status 400, got ${res.status}` };
      }

      if (body.error?.code !== "VALIDATION_ERROR") {
        return { success: false, message: `Expected error code VALIDATION_ERROR, got: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Rejected very long tag name with validation error." };
    });

    // TEST 4.5: Whitespace-only tag name
    await runTest("POST: Whitespace-only tag name", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: "     ", category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 400) {
        return { success: false, message: `Expected status 400, got ${res.status}` };
      }

      if (body.error?.code !== "VALIDATION_ERROR") {
        return { success: false, message: `Expected error code VALIDATION_ERROR, got: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Rejected whitespace-only tag name with validation error." };
    });

    // TEST 4.6: Malformed JSON body
    await runTest("POST: Malformed JSON body", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: "malformed-json{",
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 400) {
        return { success: false, message: `Expected status 400, got ${res.status}` };
      }

      if (body.error?.code !== "BAD_REQUEST") {
        return { success: false, message: `Expected error code BAD_REQUEST, got: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Rejected malformed JSON body with BAD_REQUEST error." };
    });

    // TEST 5: GET list with populated database
    await runTest("GET: List tags with populated database", async () => {
      const res = await GET();
      const body = await res.json();

      if (res.status !== 200) {
        return { success: false, message: `Expected status 200, got ${res.status}` };
      }

      if (!Array.isArray(body.data) || body.data.length !== 4) {
        return { success: false, message: `Expected 4 tags, got: ${JSON.stringify(body)}` };
      }

      // Verify category and name sorting
      const first = body.data[0];
      const last = body.data[3];

      if (first.category !== "domain" || last.category !== "tool") {
        return { success: false, message: `Sorting mismatch: First category was ${first.category}, last category was ${last.category}` };
      }

      return { success: true, message: "Returned sorted tag list successfully." };
    });

  } finally {
    // 3. Restore all original database records
    console.log("♻️ Restoring original database records...");
    await prisma.workLogTag.deleteMany();
    await prisma.workLog.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.weeklyReview.deleteMany();
    await prisma.cvBullet.deleteMany();

    // Re-insert tags
    for (const tag of originalTags) {
      await prisma.tag.create({ data: tag });
    }
    // Re-insert work logs
    for (const log of originalWorkLogs) {
      await prisma.workLog.create({ data: log });
    }
    // Re-insert join records
    for (const wlt of originalWorkLogTags) {
      await prisma.workLogTag.create({ data: wlt });
    }
    // Re-insert weekly reviews
    for (const review of originalWeeklyReviews) {
      await prisma.weeklyReview.create({ data: review });
    }
    // Re-insert cv bullets
    for (const bullet of originalCvBullets) {
      await prisma.cvBullet.create({ data: bullet });
    }

    console.log("✅ Database restore complete.");
  }

  console.log("\n🎉 All Tags API Route Smoke Tests Passed Successfully!\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
