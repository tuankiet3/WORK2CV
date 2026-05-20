import "dotenv/config";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "../app/api/logs/route";
import { GET as getById, PATCH, DELETE } from "../app/api/logs/[id]/route";

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
  console.log("🏃 Running Logs API Route Smoke Tests...");

  // 0. Fetch existing tags to use in relation tests
  const tags = await prisma.tag.findMany();
  if (tags.length === 0) {
    console.error("❌ No tags found in database. Run seed first: ALLOW_DESTRUCTIVE_SEED=true npx prisma db seed");
    process.exit(1);
  }

  const validTagId1 = tags[0].id;
  const validTagId2 = tags[1].id;
  const invalidTagId = "12345678-1234-1234-1234-1234567890ab"; // Valid UUID but not in database

  let createdLogId = "";

  // 1. POST: Successful creation
  await runTest("POST: Success create", async () => {
    const body = {
      date: "2026-05-20",
      title: "Implemented dashboard API tests",
      description: "Tested status codes and validations.",
      taskType: "testing",
      impactLevel: "implemented",
      links: ["https://github.com/tuankiet3/WORK2CV/pull/1"],
      tagIds: [validTagId1, validTagId2],
    };

    const req = new NextRequest("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    const data = await res.json();

    if (res.status !== 201) {
      return { success: false, message: `Expected status 201, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    if (!data.data || !data.data.id) {
      return { success: false, message: `Response missing data or ID. Got: ${JSON.stringify(data)}` };
    }

    createdLogId = data.data.id;

    if (data.data.tags.length !== 2) {
      return { success: false, message: `Expected 2 tags, got ${data.data.tags.length}.` };
    }

    return { success: true, message: `Created log ID ${createdLogId}` };
  });

  // 2. GET: List success
  await runTest("GET: List logs", async () => {
    const req = new NextRequest("http://localhost/api/logs");
    const res = await GET(req);
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}` };
    }

    if (!Array.isArray(data.data)) {
      return { success: false, message: `Expected array of logs, got: ${typeof data.data}` };
    }

    const found = data.data.find((log: { id: string }) => log.id === createdLogId);
    if (!found) {
      return { success: false, message: `Created log ID ${createdLogId} not found in listing.` };
    }

    return { success: true, message: `Found ${data.data.length} logs in list.` };
  });

  // 3. GET with filter
  await runTest("GET: Filter logs by taskType", async () => {
    const req = new NextRequest("http://localhost/api/logs?taskType=testing");
    const res = await GET(req);
    const data = await res.json();

    const nonTesting = data.data.filter((l: { taskType: string }) => l.taskType !== "testing");
    if (nonTesting.length > 0) {
      return { success: false, message: `Filter by taskType=testing returned non-testing logs.` };
    }

    return { success: true, message: `Filtered list returned ${data.data.length} testing logs.` };
  });

  // 4. GET: Detail success
  await runTest("GET /[id]: Success detail", async () => {
    const res = await getById(new Request(`http://localhost/api/logs/${createdLogId}`), {
      params: Promise.resolve({ id: createdLogId }),
    });
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    if (data.data.id !== createdLogId) {
      return { success: false, message: `Expected log ID ${createdLogId}, got ${data.data.id}` };
    }

    return { success: true, message: `Successfully fetched details for ID ${createdLogId}` };
  });

  // 5. PATCH: Partial updates and tag relation updates
  await runTest("PATCH /[id]: Update fields and tags", async () => {
    const updateBody = {
      title: "Updated Dashboard API Tests Title",
      tagIds: [validTagId2], // Remove validTagId1, keep only validTagId2
    };

    const res = await PATCH(
      new Request(`http://localhost/api/logs/${createdLogId}`, {
        method: "PATCH",
        body: JSON.stringify(updateBody),
      }),
      {
        params: Promise.resolve({ id: createdLogId }),
      }
    );
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    if (data.data.title !== "Updated Dashboard API Tests Title") {
      return { success: false, message: `Title not updated. Got: ${data.data.title}` };
    }

    if (data.data.tags.length !== 1 || data.data.tags[0].id !== validTagId2) {
      return { success: false, message: `Tags not correctly updated. Got: ${JSON.stringify(data.data.tags)}` };
    }

    return { success: true, message: `Updated log successfully.` };
  });

  // 6. POST: Missing required field
  await runTest("POST: Missing title (validation error)", async () => {
    const body = {
      date: "2026-05-20",
      taskType: "testing",
      impactLevel: "implemented",
    };

    const req = new NextRequest("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected VALIDATION_ERROR code, got: ${data.error.code}` };
    }

    return { success: true, message: `Validation error returned: ${JSON.stringify(data.error.details)}` };
  });

  // 7. POST: Invalid enum
  await runTest("POST: Invalid taskType enum (validation error)", async () => {
    const body = {
      date: "2026-05-20",
      title: "Test invalid enum",
      taskType: "super_feature", // invalid
      impactLevel: "implemented",
    };

    const req = new NextRequest("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    return { success: true, message: `Validation error returned for invalid enum.` };
  });

  // 8. POST: Invalid calendar date (strict calendar math checks)
  await runTest("POST: Invalid calendar date (strict date check)", async () => {
    const body = {
      date: "2026-02-31", // invalid
      title: "Test invalid date",
      taskType: "testing",
      impactLevel: "implemented",
    };

    const req = new NextRequest("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    return { success: true, message: `Validation error returned for invalid calendar date.` };
  });

  // 9. POST: Invalid tag ID (does not exist in db)
  await runTest("POST: Invalid tag ID check", async () => {
    const body = {
      date: "2026-05-20",
      title: "Test invalid tag IDs",
      taskType: "testing",
      impactLevel: "implemented",
      tagIds: [invalidTagId],
    };

    const req = new NextRequest("http://localhost/api/logs", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Validation error returned for non-existent tag ID: ${JSON.stringify(data.error.details)}` };
  });

  // 10. GET /[id]: Malformed ID
  await runTest("GET /[id]: Malformed ID (UUID format check)", async () => {
    const res = await getById(new Request("http://localhost/api/logs/not-a-uuid"), {
      params: Promise.resolve({ id: "not-a-uuid" }),
    });
    await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    return { success: true, message: `Validation error returned for malformed ID.` };
  });

  // 11. GET /[id]: Unknown ID
  await runTest("GET /[id]: Unknown ID (valid UUID but not in DB)", async () => {
    const unknownId = "c27b0b23-2895-46fb-9769-cf2b083c27cd";
    const res = await getById(new Request(`http://localhost/api/logs/${unknownId}`), {
      params: Promise.resolve({ id: unknownId }),
    });
    const data = await res.json();

    if (res.status !== 404) {
      return { success: false, message: `Expected status 404, got ${res.status}` };
    }

    if (data.error.code !== "NOT_FOUND") {
      return { success: false, message: `Expected error code NOT_FOUND, got: ${data.error.code}` };
    }

    return { success: true, message: `Not found returned successfully.` };
  });

  // 12. PATCH /[id]: Unknown ID
  await runTest("PATCH /[id]: Unknown ID", async () => {
    const unknownId = "c27b0b23-2895-46fb-9769-cf2b083c27cd";
    const res = await PATCH(
      new Request(`http://localhost/api/logs/${unknownId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: "Doesn't matter" }),
      }),
      {
        params: Promise.resolve({ id: unknownId }),
      }
    );
    await res.json();

    if (res.status !== 404) {
      return { success: false, message: `Expected status 404, got ${res.status}` };
    }

    return { success: true, message: `Not found returned successfully.` };
  });

  // 13. DELETE /[id]: Unknown ID
  await runTest("DELETE /[id]: Unknown ID", async () => {
    const unknownId = "c27b0b23-2895-46fb-9769-cf2b083c27cd";
    const res = await DELETE(new Request(`http://localhost/api/logs/${unknownId}`), {
      params: Promise.resolve({ id: unknownId }),
    });
    await res.json();

    if (res.status !== 404) {
      return { success: false, message: `Expected status 404, got ${res.status}` };
    }

    return { success: true, message: `Not found returned successfully.` };
  });

  // 13.1 GET: Filter logs by problemSolutionOnly
  await runTest("GET: Filter logs by problemSolutionOnly", async () => {
    const req = new NextRequest("http://localhost/api/logs?problemSolutionOnly=true");
    const res = await GET(req);
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}` };
    }

    const invalid = data.data.filter((l: { problem?: string; solution?: string }) => !l.problem || !l.solution);
    if (invalid.length > 0) {
      return { success: false, message: `Returned logs without problem/solution: ${JSON.stringify(invalid)}` };
    }

    return { success: true, message: `Filtered problemSolutionOnly successfully.` };
  });

  // 13.2 GET: Invalid from date format (abc)
  await runTest("GET: Invalid from date (from=abc)", async () => {
    const req = new NextRequest("http://localhost/api/logs?from=abc");
    const res = await GET(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected VALIDATION_ERROR, got: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Returned 400 with VALIDATION_ERROR.` };
  });

  // 13.3 GET: Invalid from calendar date (2026-13-01)
  await runTest("GET: Invalid from calendar date (from=2026-13-01)", async () => {
    const req = new NextRequest("http://localhost/api/logs?from=2026-13-01");
    const res = await GET(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected VALIDATION_ERROR, got: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Returned 400 with VALIDATION_ERROR.` };
  });

  // 13.4 GET: Invalid to calendar date (2026-02-31)
  await runTest("GET: Invalid to calendar date (to=2026-02-31)", async () => {
    const req = new NextRequest("http://localhost/api/logs?to=2026-02-31");
    const res = await GET(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected VALIDATION_ERROR, got: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Returned 400 with VALIDATION_ERROR.` };
  });

  // 13.5 GET: Empty from/to date (from=)
  await runTest("GET: Empty from/to dates (from=)", async () => {
    const req = new NextRequest("http://localhost/api/logs?from=");
    const res = await GET(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected VALIDATION_ERROR, got: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Returned 400 with VALIDATION_ERROR.` };
  });

  // 13.6 GET: Valid range succeeds
  await runTest("GET: Valid range succeeds (from=2026-05-01&to=2026-05-31)", async () => {
    const req = new NextRequest("http://localhost/api/logs?from=2026-05-01&to=2026-05-31");
    const res = await GET(req);

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}` };
    }

    return { success: true, message: `Returned 200 successfully.` };
  });

  // 13.7 POST: Malformed JSON
  await runTest("POST: Malformed JSON", async () => {
    const req = new NextRequest("http://localhost/api/logs", {
      method: "POST",
      body: "not-valid-json{",
    });

    const res = await POST(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error?.code !== "BAD_REQUEST") {
      return { success: false, message: `Expected BAD_REQUEST, got: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Returned 400 with BAD_REQUEST.` };
  });

  // 13.8 PATCH: Malformed JSON
  await runTest("PATCH: Malformed JSON", async () => {
    const res = await PATCH(
      new Request(`http://localhost/api/logs/${createdLogId}`, {
        method: "PATCH",
        body: "not-valid-json{",
      }),
      {
        params: Promise.resolve({ id: createdLogId }),
      }
    );
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error?.code !== "BAD_REQUEST") {
      return { success: false, message: `Expected BAD_REQUEST, got: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Returned 400 with BAD_REQUEST.` };
  });

  // 13.9 GET: Invalid taskType query parameter
  await runTest("GET: Invalid taskType query parameter (taskType=not_real)", async () => {
    const req = new NextRequest("http://localhost/api/logs?taskType=not_real");
    const res = await GET(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected VALIDATION_ERROR, got: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Returned 400 with VALIDATION_ERROR.` };
  });

  // 13.10 GET: Invalid impactLevel query parameter
  await runTest("GET: Invalid impactLevel query parameter (impactLevel=not_real)", async () => {
    const req = new NextRequest("http://localhost/api/logs?impactLevel=not_real");
    const res = await GET(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected VALIDATION_ERROR, got: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Returned 400 with VALIDATION_ERROR.` };
  });

  // 13.11 GET: Invalid tagId query parameter
  await runTest("GET: Invalid tagId query parameter (tagId=not-a-uuid)", async () => {
    const req = new NextRequest("http://localhost/api/logs?tagId=not-a-uuid");
    const res = await GET(req);
    const data = await res.json();

    if (res.status !== 400) {
      return { success: false, message: `Expected status 400, got ${res.status}` };
    }

    if (data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected VALIDATION_ERROR, got: ${JSON.stringify(data)}` };
    }

    return { success: true, message: `Returned 400 with VALIDATION_ERROR.` };
  });

  // 14. DELETE /[id]: Successful delete and relation cascade check
  await runTest("DELETE /[id]: Successful delete and join table cascade check", async () => {
    const res = await DELETE(new Request(`http://localhost/api/logs/${createdLogId}`), {
      params: Promise.resolve({ id: createdLogId }),
    });
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    // Verify deleted from DB
    const deletedLog = await prisma.workLog.findUnique({
      where: { id: createdLogId },
    });
    if (deletedLog) {
      return { success: false, message: `WorkLog still exists in DB.` };
    }

    // Verify relations deleted (cascade check)
    const joinRows = await prisma.workLogTag.findMany({
      where: { workLogId: createdLogId },
    });
    if (joinRows.length > 0) {
      return { success: false, message: `WorkLogTag rows still exist in DB for deleted work log.` };
    }

    return { success: true, message: `Log and associated relations cascade deleted successfully.` };
  });

  console.log("\n🎉 All Logs API Route Smoke Tests Passed Successfully!\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
