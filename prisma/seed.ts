import { PrismaClient, Tag, WorkLog } from "../src/generated/prisma/client";
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
  console.log("🌱 Starting seed database run...");

  // 1. Clean existing records in dependency order
  console.log("🗑️ Cleaning up existing data...");
  await prisma.workLogTag.deleteMany();
  await prisma.workLog.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.weeklyReview.deleteMany();
  await prisma.cvBullet.deleteMany();

  // 2. Define Tag data
  console.log("🏷️ Seeding Tag entities...");
  const tagData = [
    // Tech
    { name: "Next.js", category: "tech" },
    { name: "React", category: "tech" },
    { name: "TypeScript", category: "tech" },
    { name: "PostgreSQL", category: "tech" },
    { name: "Prisma", category: "tech" },
    // Tools
    { name: "Docker", category: "tool" },
    { name: "Git", category: "tool" },
    { name: "Vercel", category: "tool" },
    { name: "ESLint", category: "tool" },
    // Skills
    { name: "Database Design", category: "skill" },
    { name: "State Management", category: "skill" },
    { name: "REST API Design", category: "skill" },
    { name: "Debugging", category: "skill" },
    // Domains
    { name: "DevOps", category: "domain" },
    { name: "Frontend Development", category: "domain" },
    { name: "Backend Development", category: "domain" },
  ];

  const tags: Record<string, Tag> = {};
  for (const data of tagData) {
    const created = await prisma.tag.create({
      data: {
        name: data.name,
        category: data.category,
      },
    });
    tags[data.name] = created;
  }
  console.log(`✅ Created ${Object.keys(tags).length} tags.`);

  // 3. Define WorkLog data (8 entries, 6 task types)
  console.log("📝 Seeding WorkLog entities...");
  const logsData = [
    {
      date: new Date("2026-05-11"),
      title: "Internship Onboarding & Environment Setup",
      description: "Completed team onboarding sessions, cloned main codebase repository, and configured local development workspace with Node.js, Docker, and IDE extensions.",
      taskType: "onboarding",
      impactLevel: "learned",
      learning: "Familiarized with the project architecture, branching conventions, and coding style guidelines.",
      links: [],
      tagNames: ["Git", "Frontend Development"],
    },
    {
      date: new Date("2026-05-12"),
      title: "Researching State Management Library Options",
      description: "Evaluated Zustand vs. Redux Toolkit for caching client-side search preferences and UI states. Created benchmark tables showing bundle sizes and API complexity.",
      taskType: "research",
      impactLevel: "learned",
      learning: "Discovered that Zustand is much more lightweight and fits the local-first caching paradigm of the app.",
      links: [],
      tagNames: ["React", "State Management", "Frontend Development"],
    },
    {
      date: new Date("2026-05-13"),
      title: "Scaffold Zustand State Store for Workspace Settings",
      description: "Implemented a custom Zustand slice store to manage client theme, sidebar expansion toggle, and persistence across page reloads.",
      taskType: "feature",
      impactLevel: "implemented",
      problem: "",
      solution: "Implemented Zustand persist middleware to store keys in localStorage automatically.",
      links: ["https://github.com/tuankiet3/WORK2CV/pull/3"],
      tagNames: ["React", "State Management", "Frontend Development"],
    },
    {
      date: new Date("2026-05-14"),
      title: "Refactor API Route Error Handling Middlewares",
      description: "Unified error responses across API route handlers by creating a central parsing middleware to handle Zod validation exceptions.",
      taskType: "refactor",
      impactLevel: "improved",
      problem: "Different endpoints returned validation issues in inconsistent structures, confusing the client parsing layer.",
      solution: "Implemented a central utility that parses ZodErrors into standardized format { error: { message, details } }.",
      links: [],
      tagNames: ["TypeScript", "REST API Design", "Backend Development"],
    },
    {
      date: new Date("2026-05-15"),
      title: "Fix Mobile Sidebar Drawer View Overlay Bug",
      description: "Resolved a layout issue where the mobile navigation drawer backdrop overlay did not properly dismiss on tapping background elements.",
      taskType: "bugfix",
      impactLevel: "fixed",
      problem: "The touch click event listener on the drawer overlay failed to update state, keeping the backdrop active.",
      solution: "Replaced target click events with native React state controls and added event.stopPropagation().",
      links: [],
      tagNames: ["React", "Frontend Development", "Debugging"],
    },
    {
      date: new Date("2026-05-18"),
      title: "Write Unit Tests for Zod Validation Helper Schemas",
      description: "Added comprehensive Vitest coverage for all shared form validation patterns including work log data and date range rules.",
      taskType: "testing",
      impactLevel: "implemented",
      learning: "Writing tests helped identify border cases in date inputs handling.",
      links: [],
      tagNames: ["TypeScript", "Debugging"],
    },
    {
      date: new Date("2026-05-19"),
      title: "Initialize Prisma Client Configurations with Supabase Adapter",
      description: "Configured PostgreSQL connector schemas and initialized the Prisma client to run with native pg poolers for production serverless deployments.",
      taskType: "feature",
      impactLevel: "implemented",
      links: ["https://github.com/tuankiet3/WORK2CV/pull/7"],
      tagNames: ["PostgreSQL", "Prisma", "Database Design", "Backend Development"],
    },
    {
      date: new Date("2026-05-20"),
      title: "Optimize Docker Multi-Stage Build Configurations",
      description: "Reconfigured the Dockerfile multi-stage steps to leverage cached node packages layers, reducing CI pipeline image size by 45%.",
      taskType: "refactor",
      impactLevel: "improved",
      problem: "Each build downloaded dependencies from scratch, making deployment pipelines slow.",
      solution: "Utilized lightweight alpine runtimes and optimized order of COPY instructions to cache packages.",
      links: [],
      tagNames: ["Docker", "DevOps"],
    },
  ];

  const logs: Record<string, WorkLog> = {};
  for (const item of logsData) {
    const created = await prisma.workLog.create({
      data: {
        date: item.date,
        title: item.title,
        description: item.description,
        taskType: item.taskType,
        impactLevel: item.impactLevel,
        problem: item.problem || null,
        solution: item.solution || null,
        learning: item.learning || null,
        links: item.links,
      },
    });
    logs[item.title] = created;

    // Attach tags
    for (const tagName of item.tagNames) {
      const tag = tags[tagName];
      if (tag) {
        await prisma.workLogTag.create({
          data: {
            workLogId: created.id,
            tagId: tag.id,
          },
        });
      }
    }
  }
  console.log(`✅ Created ${Object.keys(logs).length} work logs and attached category tags.`);

  // 4. WeeklyReview Seeding
  console.log("📅 Seeding WeeklyReview entities...");
  const weekly = await prisma.weeklyReview.create({
    data: {
      weekStart: new Date("2026-05-11"),
      weekEnd: new Date("2026-05-17"),
      shipped: "Completed the project scaffolding, configured environment setups, initialized global settings slice state management using Zustand, and refactored backend error handling middleware.",
      blockers: "Faced a minor layout issue on mobile drawer overlays which was resolved by fixing click propagation logic.",
      learned: "Learned advanced TypeScript type inference, Zustand persistence middlewares, and standard REST API error structures.",
      collaboration: "Aligned with mentor on feature priorities and code style standards during the weekly team sync.",
      nextFocus: "Plan to set up the database schemas using Prisma and Supabase and write automated testing specs.",
    },
  });
  console.log(`✅ Created weekly review starting ${weekly.weekStart.toISOString().split("T")[0]}.`);

  // 5. CvBullet Seeding
  console.log("💼 Seeding CvBullet entities...");
  const bullets = [
    {
      sourceLogIds: [logs["Scaffold Zustand State Store for Workspace Settings"].id],
      content: "Designed and scaffolded a local-first internship dashboard using Next.js App Router and Zustand, establishing a persistent state architecture for layout states and settings.",
      tone: "concise_cv",
    },
    {
      sourceLogIds: [logs["Refactor API Route Error Handling Middlewares"].id],
      content: "Engineered a centralized error-handling middleware for Next.js route handlers that normalizes Zod validation failures into standard JSON API formats, increasing frontend reliability.",
      tone: "detailed_cv",
    },
  ];

  for (const bullet of bullets) {
    await prisma.cvBullet.create({
      data: bullet,
    });
  }
  console.log(`✅ Seeded ${bullets.length} saved CV bullets.`);
  console.log("🌱 Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed with error:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
