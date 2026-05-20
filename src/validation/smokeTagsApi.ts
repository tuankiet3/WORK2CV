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
  console.log("🏃 Running Non-Destructive Tags API Route Smoke Tests...");

  const testSuffix = Date.now().toString();
  const techTagName = `React_Test_${testSuffix}`;
  const toolTagName = `Git_Test_${testSuffix}`;
  const skillTagName = `REST_Test_${testSuffix}`;
  const domainTagName = `DevOps_Test_${testSuffix}`;

  const createdTagIds: string[] = [];

  try {
    // TEST 1: GET list returned 200 and data array
    await runTest("GET: List tags", async () => {
      const res = await GET();
      const data = await res.json();

      if (res.status !== 200) {
        return { success: false, message: `Expected status 200, got ${res.status}` };
      }

      if (!Array.isArray(data.data)) {
        return { success: false, message: `Expected data to be an array, got: ${JSON.stringify(data)}` };
      }

      return { success: true, message: `Found ${data.data.length} tags.` };
    });

    let reactTagId = "";

    // TEST 2.1: POST creates valid tech tag
    await runTest("POST: Create valid tech tag", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: techTagName, category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}. Body: ${JSON.stringify(body)}` };
      }

      if (!body.data?.id || body.data.name !== techTagName || body.data.category !== "tech") {
        return { success: false, message: `Invalid response structure: ${JSON.stringify(body)}` };
      }

      reactTagId = body.data.id;
      createdTagIds.push(reactTagId);
      return { success: true, message: `Created tech tag with ID ${reactTagId}` };
    });

    // TEST 2.2: POST creates valid tool tag
    await runTest("POST: Create valid tool tag", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: toolTagName, category: "tool" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}` };
      }

      createdTagIds.push(body.data.id);
      return { success: true, message: "Created tool tag successfully." };
    });

    // TEST 2.3: POST creates valid skill tag
    await runTest("POST: Create valid skill tag", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: skillTagName, category: "skill" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}` };
      }

      createdTagIds.push(body.data.id);
      return { success: true, message: "Created skill tag successfully." };
    });

    // TEST 2.4: POST creates valid domain tag
    await runTest("POST: Create valid domain tag", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: domainTagName, category: "domain" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}` };
      }

      createdTagIds.push(body.data.id);
      return { success: true, message: "Created domain tag successfully." };
    });

    // TEST 2.5: POST trims tag names
    await runTest("POST: Trim tag names", async () => {
      const paddedName = `  Trimmed_Test_${testSuffix}  `;
      const expectedName = `Trimmed_Test_${testSuffix}`;
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: paddedName, category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}` };
      }

      if (body.data.name !== expectedName) {
        return { success: false, message: `Expected trimmed name "${expectedName}", got "${body.data.name}"` };
      }

      createdTagIds.push(body.data.id);
      return { success: true, message: `Successfully trimmed name to "${body.data.name}"` };
    });

    // TEST 3.1: Duplicate tag creation (exact same name/category reuses existing)
    await runTest("POST: Duplicate tag creation (exact match)", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: techTagName, category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 200) {
        return { success: false, message: `Expected status 200 for reuse, got ${res.status}` };
      }

      if (body.data.id !== reactTagId) {
        return { success: false, message: `Expected reused ID ${reactTagId}, got ${body.data?.id}` };
      }

      return { success: true, message: "Reused existing tag successfully." };
    });

    // TEST 3.2: Duplicate tag creation (case-insensitive casing reuses existing)
    await runTest("POST: Duplicate tag creation (case-insensitive match)", async () => {
      const lowercaseName = techTagName.toLowerCase();
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: lowercaseName, category: "tech" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 200) {
        return { success: false, message: `Expected status 200 for reuse, got ${res.status}` };
      }

      if (body.data.id !== reactTagId) {
        return { success: false, message: `Expected reused ID ${reactTagId}, got ${body.data?.id}` };
      }

      return { success: true, message: "Reused existing capitalized tag successfully." };
    });

    // TEST 3.3: Same name in a different category creates a separate tag
    await runTest("POST: Same name in different category", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: techTagName, category: "tool" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 201) {
        return { success: false, message: `Expected status 201, got ${res.status}. Body: ${JSON.stringify(body)}` };
      }

      if (body.data.id === reactTagId) {
        return { success: false, message: "Expected a separate tag ID, but got the same ID." };
      }

      createdTagIds.push(body.data.id);
      return { success: true, message: "Created separate tag for same name in different category." };
    });

    // TEST 4.1: Missing name rejects with 400 VALIDATION_ERROR
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

      return { success: true, message: "Rejected missing name correctly." };
    });

    // TEST 4.2: Missing category rejects with 400 VALIDATION_ERROR
    await runTest("POST: Missing tag category", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: `Vue_${testSuffix}` }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 400) {
        return { success: false, message: `Expected status 400, got ${res.status}` };
      }

      if (body.error?.code !== "VALIDATION_ERROR") {
        return { success: false, message: `Expected error code VALIDATION_ERROR, got: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Rejected missing category correctly." };
    });

    // TEST 4.3: Invalid category rejects with 400 VALIDATION_ERROR
    await runTest("POST: Invalid tag category", async () => {
      const req = new NextRequest("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: `Vue_${testSuffix}`, category: "invalid" }),
      });
      const res = await POST(req);
      const body = await res.json();

      if (res.status !== 400) {
        return { success: false, message: `Expected status 400, got ${res.status}` };
      }

      if (body.error?.code !== "VALIDATION_ERROR") {
        return { success: false, message: `Expected error code VALIDATION_ERROR, got: ${JSON.stringify(body)}` };
      }

      return { success: true, message: "Rejected invalid category correctly." };
    });

    // TEST 4.4: Whitespace-only tag name rejects with 400 VALIDATION_ERROR
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

      return { success: true, message: "Rejected whitespace-only tag name correctly." };
    });

    // TEST 4.5: Very long tag name rejects with 400 VALIDATION_ERROR
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

      return { success: true, message: "Rejected very long tag name correctly." };
    });

    // TEST 4.6: Malformed JSON body rejects with 400 BAD_REQUEST
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

      return { success: true, message: "Rejected malformed JSON body with BAD_REQUEST." };
    });

    // TEST 5: GET list includes created test tag
    await runTest("GET: List tags includes created test tag", async () => {
      const res = await GET();
      const body = await res.json();

      if (res.status !== 200) {
        return { success: false, message: `Expected status 200, got ${res.status}` };
      }

      const match = body.data.find((t: { id: string }) => t.id === reactTagId);
      if (!match) {
        return { success: false, message: "Created test tag not found in GET response." };
      }

      return { success: true, message: "Created test tag is present in tag list." };
    });

    // TEST 6: Concurrent POST race-condition test
    await runTest("POST: Concurrent duplicate create (race safety)", async () => {
      const raceTagName = `RaceTag_${testSuffix}`;

      // Trigger multiple requests concurrently to create the same tag
      const reqs = Array.from({ length: 5 }).map(() =>
        POST(
          new NextRequest("http://localhost/api/tags", {
            method: "POST",
            body: JSON.stringify({ name: raceTagName, category: "tech" }),
          })
        )
      );

      const responses = await Promise.all(reqs);
      const statuses = responses.map((r) => r.status);
      const bodies = await Promise.all(responses.map((r) => r.json()));

      // Count success / reuse codes. We expect no 500s.
      // One request should succeed with 201, others should succeed with 200 (reuse).
      const counts = statuses.reduce(
        (acc, status) => {
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

      console.log(`   -> Concurrent status distribution: ${JSON.stringify(counts)}`);

      if (statuses.includes(500)) {
        return { success: false, message: "One or more concurrent requests failed with 500 INTERNAL_ERROR" };
      }

      const succeededIds = bodies.map((b) => b.data?.id).filter(Boolean);
      const uniqueIds = Array.from(new Set(succeededIds));

      if (uniqueIds.length !== 1) {
        return { success: false, message: `Expected all responses to share exactly 1 tag ID, but got IDs: ${JSON.stringify(uniqueIds)}` };
      }

      // Track the race tag ID for cleanup
      createdTagIds.push(uniqueIds[0]);

      return { success: true, message: "Successfully handled concurrent duplicate creates safely." };
    });

  } finally {
    // Clean up only the tags created during this test
    console.log("♻️ Cleaning up test-created tags...");
    if (createdTagIds.length > 0) {
      await prisma.tag.deleteMany({
        where: {
          id: {
            in: createdTagIds,
          },
        },
      });
      console.log(`✅ Removed ${createdTagIds.length} test-created tags.`);
    }
  }

  console.log("\n🎉 All Non-Destructive Tags API Route Smoke Tests Passed Successfully!\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
