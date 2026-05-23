export interface Tag {
  id: string;
  name: string;
  category: "tech" | "domain" | "skill" | "tool" | string;
}

export interface WorkLog {
  id: string;
  date: string;
  title: string;
  description: string | null;
  taskType: string;
  impactLevel: string;
  problem?: string | null;
  solution?: string | null;
  learning?: string | null;
  links: string[];
  tags: Tag[];
}

export interface CvProjectEntry {
  title: string;
  techStack: string[];
  links: string[];
  bullets: string[];
}

export interface CvGenerationResult {
  project: string;
  workExperience: string;
  skillsEvidence: string;
  internshipReport: string;
  projectEntry?: CvProjectEntry;
}

// Deterministic action verbs for each impact level
const VERB_MAP: Record<string, { project: string; work: string; skill: string; report: string }> = {
  implemented: {
    project: "Implemented",
    work: "Designed and developed",
    skill: "building",
    report: "implementing",
  },
  improved: {
    project: "Optimized",
    work: "Refactored and enhanced",
    skill: "optimizing",
    report: "improving and refining",
  },
  fixed: {
    project: "Resolved",
    work: "Troubleshooted and fixed",
    skill: "debugging",
    report: "fixing and resolving",
  },
  reviewed: {
    project: "Audited",
    work: "Reviewed and audited",
    skill: "evaluating",
    report: "analyzing and reviewing",
  },
  assisted: {
    project: "Supported",
    work: "Collaborated on the development of",
    skill: "assisting with",
    report: "supporting the team with",
  },
  learned: {
    project: "Researched",
    work: "Investigated and experimented with",
    skill: "exploring",
    report: "researching and learning about",
  },
};

// Helper to clean common leading action verbs from titles
function cleanLogTitle(title: string): string {
  let clean = title.trim();
  if (!clean) return "";

  const verbsToStrip = [
    "implementing", "implemented", "implement",
    "building", "built", "build",
    "developing", "developed", "develop",
    "designing", "designed", "design",
    "optimizing", "optimized", "optimize",
    "refactoring", "refactored", "refactor",
    "debugging", "debugged", "debug",
    "fixing", "fixed", "fix",
    "testing", "tested", "test",
    "integrating", "integrated", "integrate",
    "creating", "created", "create",
    "documenting", "documented", "document",
    "researching", "researched", "research",
  ];

  const words = clean.split(/\s+/);
  if (words.length > 0) {
    const firstWord = words[0].toLowerCase();
    if (verbsToStrip.includes(firstWord) && words.length > 1) {
      clean = words.slice(1).join(" ");
    }
  }

  // Handle case where cleanup emptied or ruined the title
  if (clean.length < 3) {
    clean = title.trim();
  }

  // Lowercase the first character for integration into templates if it's not an acronym
  if (clean.length > 0) {
    const isAcronym = clean.length > 1 && clean.charAt(0) === clean.charAt(0).toUpperCase() && clean.charAt(1) === clean.charAt(1).toUpperCase();
    if (!isAcronym) {
      clean = clean.charAt(0).toLowerCase() + clean.slice(1);
    }
  }

  // Limit length of a single title to prevent bloated bullets
  if (clean.length > 80) {
    clean = clean.slice(0, 77) + "...";
  }

  return clean;
}

// Combines multiple log titles cleanly
function getCombinedTitles(logs: WorkLog[]): string {
  if (logs.length === 0) return "";
  if (logs.length === 1) return cleanLogTitle(logs[0].title);
  if (logs.length === 2) {
    return `${cleanLogTitle(logs[0].title)} and ${cleanLogTitle(logs[1].title)}`;
  }
  
  // Truncate to first two combined, plus a generic phrase to prevent endless list
  return `${cleanLogTitle(logs[0].title)}, ${cleanLogTitle(logs[1].title)}, and related system modules`;
}

export function generateCvBullets(logs: WorkLog[]): CvGenerationResult {
  if (!logs || logs.length === 0) {
    return {
      project: "",
      workExperience: "",
      skillsEvidence: "",
      internshipReport: "",
    };
  }

  // 1. Sort logs by impact priority to find the primary log
  const IMPACT_PRIORITY: Record<string, number> = {
    improved: 6,
    implemented: 5,
    fixed: 4,
    reviewed: 3,
    assisted: 2,
    learned: 1,
  };

  const sortedLogs = [...logs].sort((a, b) => {
    const prioA = IMPACT_PRIORITY[a.impactLevel] || 0;
    const prioB = IMPACT_PRIORITY[b.impactLevel] || 0;
    return prioB - prioA;
  });

  const primaryLog = sortedLogs[0];
  const primaryImpact = primaryLog.impactLevel.toLowerCase();
  
  // Get template verbs (fallback to implemented if unknown)
  const verbs = VERB_MAP[primaryImpact] || VERB_MAP.implemented;

  // 2. Extract tech tags (category: tech or tool)
  const techTags = Array.from(
    new Set(
      logs
        .flatMap((log) => log.tags || [])
        .filter((tag) => tag.category === "tech" || tag.category === "tool")
        .map((tag) => tag.name)
    )
  );

  // Determine if backend context is supported
  const isBackend = logs.some((log) => {
    const text = `${log.title} ${log.description || ""} ${log.problem || ""} ${log.solution || ""}`.toLowerCase();
    const hasBackendTags = log.tags?.some((t) =>
      ["c#", ".net", "sql", "postgres", "prisma", "supabase", "database", "api", "jwt", "auth", "rest", "backend"].includes(
        t.name.toLowerCase()
      )
    );
    const backendKeywords = [
      "api", "auth", "database", "integration", "performance", "deployment", "backend",
      "c#", ".net", "sql", "postgres", "prisma", "supabase", "jwt", "rest", "security", "migration"
    ];
    return hasBackendTags || backendKeywords.some((kw) => text.includes(kw));
  });

  // Format the tech stack text
  let techText = "";
  if (techTags.length > 0) {
    if (techTags.length === 1) {
      techText = ` using ${techTags[0]}`;
    } else if (techTags.length === 2) {
      techText = ` using ${techTags[0]} and ${techTags[1]}`;
    } else {
      techText = ` using ${techTags.slice(0, 2).join(", ")}, and ${techTags[2]}`;
    }
  } else {
    // Fallback for missing tech tags
    techText = isBackend ? " using backend engineering best practices" : " using standard application technologies";
  }

  const cleanTitles = getCombinedTitles(logs);

  // Check if this is a soft-wording case (e.g. only learned or assisted logs)
  const isSoftWording = sortedLogs.every((l) => ["learned", "assisted"].includes(l.impactLevel));

  // Determine the outcome text (derived from solution or default based on task/impact)
  let outcomeText = "";
  const logsWithSolution = logs.filter((l) => l.solution && l.solution.trim().length > 5);
  if (logsWithSolution.length > 0) {
    const solutionPhrase = cleanLogTitle(logsWithSolution[0].solution || "");
    outcomeText = `, resulting in ${solutionPhrase}`;
  } else {
    // Default outcome based on impact/task type
    if (primaryLog.impactLevel === "improved") {
      outcomeText = isBackend
        ? ", optimizing service response latency and resource consumption"
        : ", improving user flow efficiency and visual rendering speeds";
    } else if (primaryLog.impactLevel === "fixed") {
      outcomeText = ", resolving runtime bugs to maintain high platform stability";
    } else if (primaryLog.impactLevel === "reviewed") {
      outcomeText = ", ensuring strict codebase quality standards and zero regression";
    } else if (primaryLog.taskType === "testing") {
      outcomeText = ", establishing test coverage to guarantee reliable feature deployments";
    } else if (primaryLog.taskType === "documentation") {
      outcomeText = ", enhancing team alignment and developer onboarding documentation";
    } else {
      outcomeText = isBackend
        ? ", supporting robust data integrity and API consumption"
        : ", delivering responsive interfaces and features";
    }
  }

  // --- 1. Project Bullet (`project`) ---
  let projectBullet = "";
  if (isSoftWording) {
    projectBullet = `Contributed to ${cleanTitles}${techText}${outcomeText}.`;
  } else {
    projectBullet = `${verbs.project} ${cleanTitles}${techText}${outcomeText}.`;
  }

  // --- 2. Work Experience Bullet (`work_experience`) ---
  let workExperienceBullet = "";
  const collaborationText = logs.some(
    (l) => l.taskType === "meeting" || l.impactLevel === "assisted" || l.taskType === "code_review"
  )
    ? "collaborating with cross-functional engineering teams to ensure architectural standards"
    : "contributing to sprint goals and verifying production deployment readiness";

  if (isSoftWording) {
    workExperienceBullet = `Collaborated on the development and validation of ${cleanTitles}${techText}, ${collaborationText}.`;
  } else {
    const workVerb = primaryLog.impactLevel === "improved" ? "Optimized" : "Developed";
    workExperienceBullet = `${workVerb} and integrated ${cleanTitles}${techText}, ${collaborationText}.`;
  }

  // --- 3. Skills Evidence Bullet (`skills_evidence`) ---
  const keySkill = techTags.length > 0 ? techTags.slice(0, 2).join("/") : (isBackend ? "Backend Systems" : "Frontend Development");
  const skillAction = isSoftWording ? "collaborating on" : verbs.skill;
  const skillsEvidenceBullet = `Demonstrated proficiency in ${keySkill} by ${skillAction} ${cleanTitles}, proving hands-on engineering capabilities.`;

  // --- 4. Internship Report Style (`internship_report`) ---
  // Combine learning notes if present
  const learnings = logs
    .map((l) => l.learning?.trim())
    .filter((l): l is string => !!l && l.length > 0);

  const learningSummary = learnings.length > 0
    ? ` This work provided valuable experience in ${learnings[0].charAt(0).toLowerCase() + learnings[0].slice(1)}.`
    : ` This task strengthened my familiarity with ${isBackend ? "backend services" : "frontend interfaces"} and enterprise code integration workflows.`;

  let internshipReportBullet = "";
  if (isSoftWording) {
    internshipReportBullet = `Assisted the team in researching and developing ${cleanTitles}${techText}.${learningSummary}`;
  } else {
    internshipReportBullet = `Successfully executed the implementation of ${cleanTitles}${techText}${outcomeText}.${learningSummary}`;
  }

  // --- 5. Optional Project Entry Draft ---
  // A project entry is drafted if we have:
  // - at least one tech/tool tag
  // - at least one link in the logs
  // - at least one log
  const allLinks = Array.from(new Set(logs.flatMap((l) => l.links || []).filter((link) => link.trim() !== "")));
  const domainTags = logs.flatMap((l) => l.tags || []).filter((t) => t.category === "domain").map((t) => t.name);
  
  let projectEntry: CvProjectEntry | undefined = undefined;
  if (techTags.length > 0 && allLinks.length > 0) {
    // Project title can be the first domain tag, or fallback to log title or clean titles
    const rawProjTitle = domainTags.length > 0 
      ? domainTags[0] 
      : (primaryLog.title.length < 40 ? primaryLog.title : "Internship Project Feature");
      
    // Capitalize project title
    const projectTitle = rawProjTitle.charAt(0).toUpperCase() + rawProjTitle.slice(1);

    projectEntry = {
      title: projectTitle,
      techStack: techTags,
      links: allLinks,
      bullets: [
        projectBullet,
        workExperienceBullet
      ]
    };
  }

  return {
    project: projectBullet,
    workExperience: workExperienceBullet,
    skillsEvidence: skillsEvidenceBullet,
    internshipReport: internshipReportBullet,
    ...(projectEntry ? { projectEntry } : {})
  };
}

export function scoreWorkLog(log: {
  title: string;
  description: string | null;
  taskType: string;
  impactLevel: string;
  problem?: string | null;
  solution?: string | null;
  links?: string[];
  tags?: Array<{ tag: { name: string; category: string } } | { name: string; category: string }>;
}): number {
  let score = 0;

  // 1. Score by impact level
  const impactScores: Record<string, number> = {
    improved: 30,
    implemented: 25,
    fixed: 20,
    reviewed: 15,
    assisted: 10,
    learned: 5,
  };
  score += impactScores[log.impactLevel.toLowerCase()] || 0;

  // 2. Add points for problem and solution fields
  if (log.problem && log.problem.trim().length > 0) score += 10;
  if (log.solution && log.solution.trim().length > 0) score += 15;

  // 3. Add points for links
  if (log.links && log.links.length > 0) {
    score += Math.min(15, log.links.length * 5); // 5 points per link, max 15
  }

  // 4. Add points for tech tags (category: tech or tool)
  let techTagsCount = 0;
  if (log.tags) {
    techTagsCount = log.tags.filter((t) => {
      const tagObj = "tag" in t ? t.tag : t;
      return tagObj.category === "tech" || tagObj.category === "tool";
    }).length;
  }
  score += Math.min(15, techTagsCount * 5); // 5 points per tech tag, max 15

  // 5. Add extra weight for logs involving backend APIs, authentication, JWT/OAuth, databases,
  // integrations, deployment, testing, debugging, performance, or collaboration
  const text = `${log.title} ${log.description || ""} ${log.problem || ""} ${log.solution || ""}`.toLowerCase();

  const backendKeywords = [
    "api", "rest", "graphql", "endpoint", "controller", "http",
    "auth", "login", "jwt", "oauth", "security", "token", "session", "sign",
    "database", "db", "sql", "postgres", "mysql", "prisma", "supabase", "query", "index", "migration",
    "integration", "integrate", "third-party", "stripe", "webhook",
    "deploy", "docker", "ci/cd", "github actions", "vercel", "hosting",
    "test", "jest", "playwright", "qa", "assert",
    "debug", "fix", "resolve", "bug", "crash", "error",
    "performance", "optimize", "latency", "speed", "scale", "cache", "redis",
    "collaborate", "review", "team", "pair", "sync", "meeting",
    "c#", ".net", "asp.net"
  ];

  let keywordMatches = 0;
  for (const kw of backendKeywords) {
    if (text.includes(kw)) {
      keywordMatches++;
    }
  }

  if (log.tags) {
    log.tags.forEach((t) => {
      const tagObj = "tag" in t ? t.tag : t;
      const tagName = tagObj.name.toLowerCase();
      if (backendKeywords.some(kw => tagName.includes(kw) || kw.includes(tagName))) {
        keywordMatches += 2;
      }
    });
  }

  score += Math.min(25, keywordMatches * 3);

  return score;
}
