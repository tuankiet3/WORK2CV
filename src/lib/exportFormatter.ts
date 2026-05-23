export interface Tag {
  id: string;
  name: string;
  category: string;
}

export interface WorkLog {
  id: string;
  date: string | Date;
  title: string;
  description: string | null;
  taskType: string;
  impactLevel: string;
  problem: string | null;
  solution: string | null;
  learning: string | null;
  links: string[];
  tags?: Array<{ tag: Tag } | Tag> | null;
}

export interface WeeklyReview {
  id: string;
  weekStart: string | Date;
  weekEnd: string | Date;
  shipped: string | null;
  blockers: string | null;
  learned: string | null;
  collaboration: string | null;
  nextFocus: string | null;
  createdAt: string | Date;
}

export interface CvBullet {
  id: string;
  content: string;
  tone: string;
  createdAt: string | Date;
  sourceLogIds: string[];
}

// Formats a Date/string to standard YYYY-MM-DD
function formatDate(dateVal: Date | string): string {
  if (typeof dateVal === "string") {
    return dateVal.split("T")[0];
  }
  return dateVal.toISOString().split("T")[0];
}

// Normalizes tags array to Tag[]
function normalizeTags(log: WorkLog): Tag[] {
  if (!log.tags) return [];
  return log.tags.map((t) => {
    if ("tag" in t) {
      return t.tag;
    }
    return t;
  });
}

// 1. Export Selected Work Logs to Markdown
export function exportLogsToMarkdown(logs: WorkLog[]): string {
  if (logs.length === 0) {
    return "# Work Logs\n\nNo work logs exported.";
  }

  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  let markdown = "# Work Logs Export\n\n";

  sortedLogs.forEach((log) => {
    const logDate = formatDate(log.date);
    markdown += `## ${log.title} (${logDate})\n`;
    markdown += `- **Task Type:** ${log.taskType.charAt(0).toUpperCase() + log.taskType.slice(1)}\n`;
    markdown += `- **Impact Level:** ${log.impactLevel.charAt(0).toUpperCase() + log.impactLevel.slice(1)}\n`;

    const logTags = normalizeTags(log);
    if (logTags.length > 0) {
      const tagString = logTags.map((t) => `${t.name} (${t.category})`).join(", ");
      markdown += `- **Tags:** ${tagString}\n`;
    }

    markdown += "\n";

    if (log.description && log.description.trim()) {
      markdown += `### Description\n${log.description.trim()}\n\n`;
    }

    if (log.problem && log.problem.trim()) {
      markdown += `### Problem / Obstacle\n${log.problem.trim()}\n\n`;
    }

    if (log.solution && log.solution.trim()) {
      markdown += `### Solution / Implementation\n${log.solution.trim()}\n\n`;
    }

    if (log.learning && log.learning.trim()) {
      markdown += `### Key Learnings\n${log.learning.trim()}\n\n`;
    }

    if (log.links && log.links.length > 0) {
      const validLinks = log.links.filter((link) => link && link.trim());
      if (validLinks.length > 0) {
        markdown += `### Links & PRs\n`;
        validLinks.forEach((link) => {
          markdown += `- [${link.trim()}](${link.trim()})\n`;
        });
        markdown += "\n";
      }
    }

    markdown += "---\n\n";
  });

  // Remove trailing horizontal rule
  if (markdown.endsWith("---\n\n")) {
    markdown = markdown.slice(0, -5) + "\n";
  }

  return markdown.trim();
}

// 2. Export Weekly Reviews to Markdown
export function exportWeeklyReviewsToMarkdown(reviews: WeeklyReview[]): string {
  if (reviews.length === 0) {
    return "# Weekly Reviews\n\nNo weekly reviews exported.";
  }

  // Sort by weekStart descending
  const sortedReviews = [...reviews].sort((a, b) => {
    return new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime();
  });

  let markdown = "# Weekly Reviews Export\n\n";

  sortedReviews.forEach((review) => {
    const startStr = formatDate(review.weekStart);
    const endStr = formatDate(review.weekEnd);
    markdown += `## Week Summary: ${startStr} to ${endStr}\n\n`;

    if (review.shipped && review.shipped.trim()) {
      markdown += `### What I Shipped\n${review.shipped.trim()}\n\n`;
    }

    if (review.blockers && review.blockers.trim()) {
      markdown += `### Blockers & Challenges\n${review.blockers.trim()}\n\n`;
    }

    if (review.learned && review.learned.trim()) {
      markdown += `### What I Learned\n${review.learned.trim()}\n\n`;
    }

    if (review.collaboration && review.collaboration.trim()) {
      markdown += `### Collaboration & Mentorship\n${review.collaboration.trim()}\n\n`;
    }

    if (review.nextFocus && review.nextFocus.trim()) {
      markdown += `### Next Week's Focus\n${review.nextFocus.trim()}\n\n`;
    }

    markdown += "---\n\n";
  });

  // Remove trailing horizontal rule
  if (markdown.endsWith("---\n\n")) {
    markdown = markdown.slice(0, -5) + "\n";
  }

  return markdown.trim();
}

// 3. Export CV Bullets to Markdown
export function exportCvBulletsToMarkdown(bullets: CvBullet[]): string {
  if (bullets.length === 0) {
    return "# CV Accomplishments\n\nNo saved accomplishments exported.";
  }

  // Sort by createdAt descending
  const sortedBullets = [...bullets].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  let markdown = "# Saved CV Accomplishments\n\n";

  const mapToneLabel = (t: string) => {
    if (t === "concise_cv") return "Concise CV Bullet";
    if (t === "detailed_cv") return "Detailed CV Bullet";
    if (t === "internship_report") return "Internship Report Section";
    return t;
  };

  sortedBullets.forEach((bullet) => {
    const createdDate = formatDate(bullet.createdAt);
    markdown += `- **[${mapToneLabel(bullet.tone)}]** (Saved on ${createdDate})\n  ${bullet.content.trim()}\n\n`;
  });

  return markdown.trim();
}

// 4. Export Full Internship Summary to Markdown
export function exportFullSummaryToMarkdown(
  logs: WorkLog[],
  reviews: WeeklyReview[],
  bullets: CvBullet[]
): string {
  let markdown = "# Internship Summary Report\n\n";

  // Metadata section
  markdown += `## Progress Overview\n`;
  markdown += `- **Total Daily Work Logs:** ${logs.length}\n`;
  markdown += `- **Total Weekly Reviews Submitted:** ${reviews.length}\n`;
  markdown += `- **Saved CV Accomplishments:** ${bullets.length}\n\n`;
  markdown += "---\n\n";

  // Weekly Reviews section
  markdown += `## Weekly Reflective Summaries\n\n`;
  if (reviews.length > 0) {
    // We can reuse our formatter but strip the main header
    const reviewsMd = exportWeeklyReviewsToMarkdown(reviews);
    markdown += reviewsMd.replace("# Weekly Reviews Export\n\n", "") + "\n\n";
  } else {
    markdown += "*No weekly reviews logged yet.*\n\n";
  }
  markdown += "---\n\n";

  // CV Accomplishments section
  markdown += `## Selected CV & Resume Bullets\n\n`;
  if (bullets.length > 0) {
    const bulletsMd = exportCvBulletsToMarkdown(bullets);
    markdown += bulletsMd.replace("# Saved CV Accomplishments\n\n", "") + "\n\n";
  } else {
    markdown += "*No CV bullets saved yet.*\n\n";
  }
  markdown += "---\n\n";

  // Complete Log History section
  markdown += `## Complete Work Log History\n\n`;
  if (logs.length > 0) {
    const logsMd = exportLogsToMarkdown(logs);
    markdown += logsMd.replace("# Work Logs Export\n\n", "") + "\n\n";
  } else {
    markdown += "*No work logs recorded yet.*\n\n";
  }

  return markdown.trim();
}
