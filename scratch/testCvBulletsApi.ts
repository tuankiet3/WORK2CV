import "dotenv/config";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/prisma";
import { GET as listBullets, POST as saveBullet } from "../src/app/api/cv-bullets/route";
import { POST as generateBullets } from "../src/app/api/cv-bullets/generate/route";
import { PATCH as editBullet, DELETE as deleteBullet } from "../src/app/api/cv-bullets/[id]/route";

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
  console.log("🏃 Running CV Bullets API Route Smoke Tests...");

  // 0. Ensure we have at least one work log in the database.
  // If none exists, create a temporary one.
  const logs = await prisma.workLog.findMany();
  let createdTempLog = false;
  let testLogId = "";

  if (logs.length === 0) {
    console.log("ℹ️ Database empty. Creating a temporary work log for testing...");
    const tempLog = await prisma.workLog.create({
      data: {
        date: new Date(),
        title: "Temporary test work log for API verify",
        taskType: "feature",
        impactLevel: "implemented",
        description: "Initial draft description",
      },
    });
    testLogId = tempLog.id;
    createdTempLog = true;
  } else {
    testLogId = logs[0].id;
  }

  const malformedUuid = "not-a-uuid";
  const unknownUuid = "88888888-8888-8888-8888-888888888888"; // valid format but not in DB

  let savedBulletId = "";

  // 1. Generate: Success (with one log ID)
  await runTest("POST /api/cv-bullets/generate: Success with one log ID", async () => {
    const body = {
      logIds: [testLogId],
    };
    const req = new NextRequest("http://localhost/api/cv-bullets/generate", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await generateBullets(req);
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    if (!data.data || !Array.isArray(data.data.variants)) {
      return { success: false, message: `Expected variants array, got: ${JSON.stringify(data)}` };
    }

    // Verify all 4 sections are returned with labels
    const sections = data.data.variants.map((v: { targetSection: string }) => v.targetSection);
    const expected = ["project", "work_experience", "skills_evidence", "internship_report"];
    const matches = expected.every((s) => sections.includes(s));
    if (!matches) {
      return { success: false, message: `Missing target sections. Got: ${sections.join(", ")}` };
    }

    // Verify each variant has content and label
    for (const v of data.data.variants) {
      if (!v.content || !v.label) {
        return { success: false, message: `Variant missing content or label: ${JSON.stringify(v)}` };
      }
    }

    return { success: true, message: `Generated ${data.data.variants.length} variants.` };
  });

  // 2. Generate: Filtered targetSection
  await runTest("POST /api/cv-bullets/generate: Filtered by targetSection", async () => {
    const body = {
      logIds: [testLogId],
      targetSection: "project",
    };
    const req = new NextRequest("http://localhost/api/cv-bullets/generate", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await generateBullets(req);
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}` };
    }

    if (data.data.variants.length !== 1 || data.data.variants[0].targetSection !== "project") {
      return { success: false, message: `Expected exactly 1 project variant, got: ${JSON.stringify(data.data.variants)}` };
    }

    return { success: true, message: "Correctly filtered by targetSection." };
  });

  // 3. Generate: Validation errors (malformed IDs, unknown IDs, invalid enums)
  await runTest("POST /api/cv-bullets/generate: Validation - malformed ID", async () => {
    const body = {
      logIds: [malformedUuid],
    };
    const req = new NextRequest("http://localhost/api/cv-bullets/generate", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await generateBullets(req);
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Successfully rejected malformed log ID." };
  });

  await runTest("POST /api/cv-bullets/generate: Validation - unknown ID", async () => {
    const body = {
      logIds: [unknownUuid],
    };
    const req = new NextRequest("http://localhost/api/cv-bullets/generate", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await generateBullets(req);
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Successfully rejected unknown log ID." };
  });

  await runTest("POST /api/cv-bullets/generate: Validation - invalid targetSection", async () => {
    const body = {
      logIds: [testLogId],
      targetSection: "invalid_section",
    };
    const req = new NextRequest("http://localhost/api/cv-bullets/generate", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await generateBullets(req);
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Successfully rejected invalid targetSection." };
  });

  await runTest("POST /api/cv-bullets/generate: Validation - empty logIds", async () => {
    const body = {
      logIds: [],
    };
    const req = new NextRequest("http://localhost/api/cv-bullets/generate", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await generateBullets(req);
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Successfully rejected empty logIds." };
  });

  // 4. Save CV Bullet: Success
  await runTest("POST /api/cv-bullets: Success save", async () => {
    const body = {
      sourceLogIds: [testLogId],
      content: "Implemented custom metrics using SQL Server.",
      tone: "concise_cv",
    };
    const req = new NextRequest("http://localhost/api/cv-bullets", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await saveBullet(req);
    const data = await res.json();

    if (res.status !== 201) {
      return { success: false, message: `Expected status 201, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    if (!data.data || !data.data.id) {
      return { success: false, message: `Missing ID in response: ${JSON.stringify(data)}` };
    }

    savedBulletId = data.data.id;
    return { success: true, message: `Saved bullet with ID ${savedBulletId}` };
  });

  // 5. Save CV Bullet: Unknown log ID
  await runTest("POST /api/cv-bullets: Validation - unknown log ID", async () => {
    const body = {
      sourceLogIds: [unknownUuid],
      content: "Implemented custom metrics.",
      tone: "concise_cv",
    };
    const req = new NextRequest("http://localhost/api/cv-bullets", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await saveBullet(req);
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Successfully rejected saving bullet with unknown log ID." };
  });

  // 6. GET /api/cv-bullets: List saved bullets
  await runTest("GET /api/cv-bullets: List saved bullets", async () => {
    const res = await listBullets();
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}` };
    }

    const found = data.data.find((b: { id: string }) => b.id === savedBulletId);
    if (!found) {
      return { success: false, message: `Saved bullet ID ${savedBulletId} not found in the list.` };
    }

    return { success: true, message: `Found saved bullet in list of ${data.data.length} bullets.` };
  });

  // 7. PATCH /api/cv-bullets/[id]: Success update
  await runTest("PATCH /api/cv-bullets/[id]: Success update content", async () => {
    const body = {
      content: "Updated CV bullet content text.",
    };
    const req = new NextRequest(`http://localhost/api/cv-bullets/${savedBulletId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const res = await editBullet(req, {
      params: Promise.resolve({ id: savedBulletId }),
    });
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    if (data.data.content !== "Updated CV bullet content text.") {
      return { success: false, message: `Content was not updated. Got: ${JSON.stringify(data.data)}` };
    }

    return { success: true, message: "Successfully updated bullet content." };
  });

  // 8. PATCH /api/cv-bullets/[id]: Validation errors
  await runTest("PATCH /api/cv-bullets/[id]: Validation - malformed ID", async () => {
    const body = { content: "New text." };
    const req = new NextRequest(`http://localhost/api/cv-bullets/${malformedUuid}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const res = await editBullet(req, {
      params: Promise.resolve({ id: malformedUuid }),
    });
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Rejected malformed ID." };
  });

  await runTest("PATCH /api/cv-bullets/[id]: Validation - unknown ID", async () => {
    const body = { content: "New text." };
    const req = new NextRequest(`http://localhost/api/cv-bullets/${unknownUuid}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const res = await editBullet(req, {
      params: Promise.resolve({ id: unknownUuid }),
    });
    const data = await res.json();

    if (res.status !== 404 || data.error?.code !== "NOT_FOUND") {
      return { success: false, message: `Expected 404 NOT_FOUND, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Rejected unknown ID with 404 NOT_FOUND." };
  });

  await runTest("PATCH /api/cv-bullets/[id]: Validation - empty content", async () => {
    const body = { content: "  " };
    const req = new NextRequest(`http://localhost/api/cv-bullets/${savedBulletId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const res = await editBullet(req, {
      params: Promise.resolve({ id: savedBulletId }),
    });
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Rejected empty content update." };
  });

  // 9. DELETE /api/cv-bullets/[id]: Success delete
  await runTest("DELETE /api/cv-bullets/[id]: Success delete", async () => {
    const req = new NextRequest(`http://localhost/api/cv-bullets/${savedBulletId}`, {
      method: "DELETE",
    });
    const res = await deleteBullet(req, {
      params: Promise.resolve({ id: savedBulletId }),
    });
    const data = await res.json();

    if (res.status !== 200) {
      return { success: false, message: `Expected status 200, got ${res.status}. Body: ${JSON.stringify(data)}` };
    }

    // Verify it is gone from the database
    const checkBullet = await prisma.cvBullet.findUnique({
      where: { id: savedBulletId },
    });

    if (checkBullet) {
      return { success: false, message: "Bullet was not actually deleted from DB." };
    }

    return { success: true, message: "Successfully deleted saved bullet." };
  });

  // 10. DELETE /api/cv-bullets/[id]: Validation errors
  await runTest("DELETE /api/cv-bullets/[id]: Validation - malformed ID", async () => {
    const req = new NextRequest(`http://localhost/api/cv-bullets/${malformedUuid}`, {
      method: "DELETE",
    });
    const res = await deleteBullet(req, {
      params: Promise.resolve({ id: malformedUuid }),
    });
    const data = await res.json();

    if (res.status !== 400 || data.error?.code !== "VALIDATION_ERROR") {
      return { success: false, message: `Expected 400 VALIDATION_ERROR, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Rejected malformed delete ID." };
  });

  await runTest("DELETE /api/cv-bullets/[id]: Validation - unknown ID", async () => {
    const req = new NextRequest(`http://localhost/api/cv-bullets/${unknownUuid}`, {
      method: "DELETE",
    });
    const res = await deleteBullet(req, {
      params: Promise.resolve({ id: unknownUuid }),
    });
    const data = await res.json();

    if (res.status !== 404 || data.error?.code !== "NOT_FOUND") {
      return { success: false, message: `Expected 404 NOT_FOUND, got: ${res.status} ${JSON.stringify(data)}` };
    }

    return { success: true, message: "Rejected unknown delete ID with 404 NOT_FOUND." };
  });

  // Cleanup temporary log if created
  if (createdTempLog) {
    await prisma.workLog.delete({
      where: { id: testLogId },
    });
    console.log("🧹 Cleaned up temporary work log.");
  }

  console.log("\n🎉 ALL CV BULLETS API TESTS PASSED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
