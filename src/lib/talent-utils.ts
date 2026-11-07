import type { EducationLevel, Experience, GradeType, ResumeStatus, JobStatus, SkillGroupType } from "./types";

/** Fixed reference date for mock data so server and browser render identically. */
export const MOCK_NOW = new Date("2026-11-06T10:00:00.000Z");

const SKILL_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  reactjs: "react",
  "react.js": "react",
  "node.js": "nodejs",
  node: "nodejs",
  "next.js": "nextjs",
  postgres: "postgresql",
  k8s: "kubernetes",
  gcp: "google cloud",
  "amazon web services": "aws",
  "tailwind css": "tailwind",
  tailwindcss: "tailwind",
  "scikit-learn": "scikit learn",
  sklearn: "scikit learn",
};

export function normalizeSkill(value: string): string {
  const base = value.trim().toLowerCase().replace(/\s+/g, " ");
  return SKILL_ALIASES[base] ?? base;
}

export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#\s]/g, "")
    .replace(/\s+/g, " ");
}

function monthIndex(date: Date) {
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

export function experienceMonths(exp: Pick<Experience, "startDate" | "endDate">, now = MOCK_NOW) {
  const start = monthIndex(new Date(exp.startDate));
  const end = monthIndex(exp.endDate ? new Date(exp.endDate) : now);
  return Math.max(0, end - start + 1);
}

/**
 * Total experience derived from Experience records.
 * Overlapping roles are merged so concurrent jobs are not double-counted.
 */
export function totalExperienceMonths(
  experience: Array<Pick<Experience, "startDate" | "endDate">>,
  now = MOCK_NOW,
): number {
  const ranges: Array<[number, number]> = experience
    .map((e): [number, number] => [
      monthIndex(new Date(e.startDate)),
      monthIndex(e.endDate ? new Date(e.endDate) : now),
    ])
    .filter(([s, e]) => e >= s)
    .sort((a, b) => a[0] - b[0]);

  let total = 0;
  let current: [number, number] | null = null;
  for (const [s, e] of ranges) {
    if (!current) {
      current = [s, e];
    } else if (s <= current[1] + 1) {
      current[1] = Math.max(current[1], e);
    } else {
      total += current[1] - current[0] + 1;
      current = [s, e];
    }
  }
  if (current) total += current[1] - current[0] + 1;
  return total;
}

export function formatExperience(months: number | null | undefined): string {
  if (months == null) return "—";
  if (months <= 0) return "No experience listed";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo${rem === 1 ? "" : "s"}`;
  if (rem === 0) return `${years} yr${years === 1 ? "" : "s"}`;
  return `${years} yr${years === 1 ? "" : "s"} ${rem} mo${rem === 1 ? "" : "s"}`;
}

export function formatExperienceRange(min: number | null, max: number | null) {
  if (min == null && max == null) return "Any experience";
  if (min != null && max != null) return `${min}–${max} yrs`;
  if (min != null) return `${min}+ yrs`;
  return `Up to ${max} yrs`;
}

export const EDUCATION_LEVELS: EducationLevel[] = [
  "SECONDARY",
  "HIGHER_SECONDARY",
  "DIPLOMA",
  "ASSOCIATE",
  "UNDERGRADUATE",
  "POSTGRADUATE",
  "DOCTORATE",
  "OTHER",
];

export const EDUCATION_LEVEL_LABEL: Record<EducationLevel, string> = {
  SECONDARY: "Secondary",
  HIGHER_SECONDARY: "Higher secondary",
  DIPLOMA: "Diploma",
  ASSOCIATE: "Associate",
  UNDERGRADUATE: "Undergraduate",
  POSTGRADUATE: "Postgraduate",
  DOCTORATE: "Doctorate",
  OTHER: "Other",
};

/** Rank for comparison. OTHER is unranked (0). */
export const EDUCATION_LEVEL_RANK: Record<EducationLevel, number> = {
  SECONDARY: 1,
  HIGHER_SECONDARY: 2,
  DIPLOMA: 3,
  ASSOCIATE: 4,
  UNDERGRADUATE: 5,
  POSTGRADUATE: 6,
  DOCTORATE: 7,
  OTHER: 0,
};

export function formatGrade(gradeType: GradeType | null, grade: number | null) {
  if (gradeType == null || grade == null) return null;
  return gradeType === "CGPA" ? `${grade.toFixed(2)} CGPA` : `${grade}%`;
}

export const RESUME_STATUS_LABEL: Record<ResumeStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

export const SKILL_GROUP_TYPE_INFO: Record<SkillGroupType, { label: string; description: string }> = {
  ALL: { label: "All required", description: "Every skill in this group is required." },
  ANY: { label: "Any one required", description: "At least one skill in this group is required." },
  PREFERRED: { label: "Preferred", description: "Nice to have — not mandatory." },
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatMonthYear(iso: string | null) {
  if (!iso) return "Present";
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatRelative(iso: string, now = MOCK_NOW) {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

let idCounter = 0;
export function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}`;
}
