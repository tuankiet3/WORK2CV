import { generateCvBullets, WorkLog } from "../src/lib/cvGenerator";

function runTestScenario(name: string, logs: WorkLog[]) {
  console.log(`=== Test Scenario: ${name} ===`);
  const result = generateCvBullets(logs);
  console.log(`[Project]: ${result.project}`);
  console.log(`[Work Exp]: ${result.workExperience}`);
  console.log(`[Skills Ev]: ${result.skillsEvidence}`);
  console.log(`[Report]: ${result.internshipReport}`);
  if (result.projectEntry) {
    console.log(`[Project Entry Draft]:`);
    console.log(`  Title: ${result.projectEntry.title}`);
    console.log(`  Tech Stack: ${result.projectEntry.techStack.join(", ")}`);
    console.log(`  Links: ${result.projectEntry.links.join(", ")}`);
    console.log(`  Bullets:`);
    result.projectEntry.bullets.forEach(b => console.log(`    - ${b}`));
  } else {
    console.log(`[Project Entry Draft]: None`);
  }
  console.log("=========================================\n");
  return result;
}

// 1. Test Empty selected logs
const emptyLogs: WorkLog[] = [];
const emptyRes = runTestScenario("Empty selected logs", emptyLogs);
if (emptyRes.project !== "" || emptyRes.workExperience !== "" || emptyRes.skillsEvidence !== "" || emptyRes.internshipReport !== "") {
  console.error("FAIL: Empty logs did not return empty strings");
  process.exit(1);
}

// 2. Test One log with backend-heavy data and tech tags
const backendLog: WorkLog = {
  id: "log-1",
  date: "2026-05-23",
  title: "Implement secure JWT login endpoints",
  description: "Designed RESTful login and logout routes using ASP.NET Core and JWT.",
  taskType: "feature",
  impactLevel: "implemented",
  problem: "users had session vulnerabilities",
  solution: "verify signatures using HS256",
  learning: "how key signing works in JWT",
  links: ["https://github.com/tuankiet3/WORK2CV/pull/12"],
  tags: [
    { id: "t1", name: "C#", category: "tech" },
    { id: "t2", name: "ASP.NET Core", category: "tech" },
    { id: "t3", name: "JWT", category: "tech" },
    { id: "t4", name: "Authentication", category: "domain" }
  ]
};
const backendRes = runTestScenario("Single Backend-Heavy Log", [backendLog]);
if (!backendRes.project.includes("JWT") || !backendRes.project.includes("Implemented")) {
  console.error("FAIL: Single backend log output incorrect");
  process.exit(1);
}
if (!backendRes.projectEntry) {
  console.error("FAIL: Expected project entry draft when tags and links are provided");
  process.exit(1);
}

// 3. Test Multiple logs
const anotherLog: WorkLog = {
  id: "log-2",
  date: "2026-05-24",
  title: "Optimize database query performance",
  description: "Added indexes and refactored Prisma queries.",
  taskType: "refactor",
  impactLevel: "improved",
  problem: "slow dashboard load times of 5s",
  solution: "added index on date and taskType",
  learning: "indexing strategies in PostgreSQL",
  links: [],
  tags: [
    { id: "t1", name: "PostgreSQL", category: "tech" },
    { id: "t5", name: "Prisma", category: "tech" }
  ]
};
const multipleRes = runTestScenario("Multiple Logs Combined", [backendLog, anotherLog]);
if (!multipleRes.project.includes("Optimize database query performance") && !multipleRes.project.includes("optimize database query performance")) {
  // It should select the primary verb (Optimized from improved log, or combine titles)
  if (!multipleRes.project.includes("optimized") && !multipleRes.project.includes("Optimized")) {
    console.error("FAIL: Multiple logs did not prioritize impact level verb or titles");
    process.exit(1);
  }
}

// 4. Test Missing Tech Tags Fallback
const noTagsLog: WorkLog = {
  id: "log-3",
  date: "2026-05-25",
  title: "Refactor API endpoints structure",
  description: "Cleaning routes.",
  taskType: "refactor",
  impactLevel: "improved",
  links: [],
  tags: []
};
const noTagsRes = runTestScenario("No Tech Tags Fallback", [noTagsLog]);
if (!noTagsRes.project.includes("using backend engineering best practices")) {
  console.error("FAIL: No tags fallback should mention backend practices if isBackend is true");
  process.exit(1);
}

// 5. Test Unclear Impact (Learned / Assisted)
const unclearLog: WorkLog = {
  id: "log-4",
  date: "2026-05-26",
  title: "Research OAuth flow",
  description: "Read documentation on OAuth.",
  taskType: "research",
  impactLevel: "learned",
  learning: "OAuth authentication flows",
  links: [],
  tags: [{ id: "t6", name: "OAuth", category: "tech" }]
};
const unclearRes = runTestScenario("Unclear Impact (Softer Wording)", [unclearLog]);
if (!unclearRes.project.startsWith("Contributed to")) {
  console.error("FAIL: Softer wording expected for learned impact");
  process.exit(1);
}

// 6. Test Frontend-only logs
const frontendLog: WorkLog = {
  id: "log-5",
  date: "2026-05-27",
  title: "Build weekly review form UI",
  description: "Created forms using React and Tailwind CSS.",
  taskType: "feature",
  impactLevel: "implemented",
  links: [],
  tags: [
    { id: "t7", name: "React", category: "tech" },
    { id: "t8", name: "Tailwind CSS", category: "tech" }
  ]
};
const frontendRes = runTestScenario("Frontend-Only Log (Honest Wording)", [frontendLog]);
if (frontendRes.project.includes("backend") || frontendRes.project.includes("API")) {
  console.error("FAIL: Frontend log output should not invent backend terms");
  process.exit(1);
}

// 7. Test Very Long Title Truncation
const longTitleLog: WorkLog = {
  id: "log-6",
  date: "2026-05-28",
  title: "Design and implement the weekly review page selection behavior and log aggregation engine with complex state filters and layout polish",
  description: "Long work",
  taskType: "feature",
  impactLevel: "implemented",
  links: [],
  tags: []
};
const longTitleRes = runTestScenario("Very Long Title Truncation", [longTitleLog]);
if (!longTitleRes.project.includes("...")) {
  console.error("FAIL: Very long title was not truncated with ellipses");
  process.exit(1);
}

console.log("ALL TEST CASES PASSED SUCCESSFULLY!");
