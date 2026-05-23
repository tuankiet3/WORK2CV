import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Neither DIRECT_URL nor DATABASE_URL is defined in the environment.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (process.env.ALLOW_DESTRUCTIVE_CLEANUP !== "true") {
    console.error("⚠️  SAFETY GUARD: Cleanup execution stopped.");
    console.error("This script resets user data (WorkLog, WorkLogTag, WeeklyReview, CvBullet).");
    console.error("To proceed, run the script with ALLOW_DESTRUCTIVE_CLEANUP=true.");
    console.error("Example: ALLOW_DESTRUCTIVE_CLEANUP=true npx tsx prisma/cleanup.ts");
    process.exit(1);
  }

  console.log("🧹 Starting database cleanup...");

  // Before row counts
  const beforeCounts = {
    workLogTag: await prisma.workLogTag.count(),
    cvBullet: await prisma.cvBullet.count(),
    weeklyReview: await prisma.weeklyReview.count(),
    workLog: await prisma.workLog.count(),
    tag: await prisma.tag.count(),
  };
  console.log("📊 Row counts BEFORE cleanup:", beforeCounts);

  // Destructive delete operations
  console.log("🗑️ Deleting WorkLogTag records...");
  await prisma.workLogTag.deleteMany();

  console.log("🗑️ Deleting CvBullet records...");
  await prisma.cvBullet.deleteMany();

  console.log("🗑️ Deleting WeeklyReview records...");
  await prisma.weeklyReview.deleteMany();

  console.log("🗑️ Deleting WorkLog records...");
  await prisma.workLog.deleteMany();

  // After row counts
  const afterCounts = {
    workLogTag: await prisma.workLogTag.count(),
    cvBullet: await prisma.cvBullet.count(),
    weeklyReview: await prisma.weeklyReview.count(),
    workLog: await prisma.workLog.count(),
    tag: await prisma.tag.count(), // Preserved
  };
  console.log("📊 Row counts AFTER cleanup:", afterCounts);

  console.log("✅ Database cleanup completed successfully! Reference tags were preserved.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Cleanup failed with error:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
