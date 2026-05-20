export const TASK_TYPES = [
  "onboarding",
  "feature",
  "bugfix",
  "testing",
  "refactor",
  "code_review",
  "documentation",
  "meeting",
  "research",
  "support",
] as const;

export const IMPACT_LEVELS = [
  "learned",
  "assisted",
  "implemented",
  "reviewed",
  "fixed",
  "improved",
] as const;

export const TAG_CATEGORIES = [
  "tech",
  "domain",
  "skill",
  "tool",
] as const;

export const CV_TONES = [
  "concise_cv",
  "detailed_cv",
  "internship_report",
] as const;

export const EXPORT_TYPES = [
  "logs",
  "weekly_review",
  "cv_bullets",
  "full_summary",
] as const;

export type TaskType = typeof TASK_TYPES[number];
export type ImpactLevel = typeof IMPACT_LEVELS[number];
export type TagCategory = typeof TAG_CATEGORIES[number];
export type CvTone = typeof CV_TONES[number];
export type ExportType = typeof EXPORT_TYPES[number];

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  onboarding: "Onboarding",
  feature: "Feature Development",
  bugfix: "Bug Fixing",
  testing: "Testing & QA",
  refactor: "Refactoring",
  code_review: "Code Review",
  documentation: "Documentation",
  meeting: "Meeting & Sync",
  research: "Research & Spike",
  support: "Support & Operations",
};

export const IMPACT_LEVEL_LABELS: Record<ImpactLevel, string> = {
  learned: "Learned",
  assisted: "Assisted / Collaborated",
  implemented: "Implemented / Authored",
  reviewed: "Reviewed / Audited",
  fixed: "Fixed / Resolved",
  improved: "Improved / Optimized",
};

export const TAG_CATEGORY_LABELS: Record<TagCategory, string> = {
  tech: "Technology / Framework",
  domain: "Business Domain",
  skill: "Soft / Hard Skill",
  tool: "Tool / Service",
};

export const CV_TONE_LABELS: Record<CvTone, string> = {
  concise_cv: "Concise CV Bullet",
  detailed_cv: "Detailed CV Bullet",
  internship_report: "Internship Report Section",
};

export const EXPORT_TYPE_LABELS: Record<ExportType, string> = {
  logs: "Work Logs",
  weekly_review: "Weekly Reviews",
  cv_bullets: "CV Bullets",
  full_summary: "Full Summary (All Data)",
};
