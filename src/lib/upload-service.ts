/**
 * Resume upload adapter — the ONLY place upload/processing behaviour lives.
 * Replace `mockResumeUploadAdapter` with your Supabase Storage + API implementation;
 * the upload queue UI only depends on the `ResumeUploadAdapter` interface.
 */
import type { Candidate, Resume } from "./types";
import { MOCK_USER } from "./mock-data";
import { makeId, normalizeSkill } from "./talent-utils";

export const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_FILES_PER_BATCH = 25;

export type QueueItemStatus = "WAITING" | "UPLOADING" | "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ProcessResult {
  resume: Resume;
  candidate: Candidate | null;
}

export interface ResumeUploadAdapter {
  /** Upload the raw file. Report progress 0–100. Resolve with the created Resume record. */
  upload(file: File, onProgress: (pct: number) => void): Promise<Resume>;
  /** Parse the uploaded resume. Resolve with the updated Resume and extracted Candidate (if any). */
  process(resume: Resume): Promise<ProcessResult>;
}

export function validateResumeFile(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files are supported.";
  if (file.size === 0) return "File is empty.";
  if (file.size > MAX_RESUME_SIZE) return "File exceeds the 10 MB limit.";
  return null;
}

export function fileKey(file: File) {
  return `${file.name.toLowerCase()}::${file.size}`;
}

// ---------------- mock implementation ----------------
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SKILL_POOL = [
  ["React", "TypeScript", "Next.js", "Tailwind CSS", "Jest"],
  ["Node.js", "PostgreSQL", "Redis", "Docker", "AWS"],
  ["Python", "SQL", "PyTorch", "Pandas", "Airflow"],
  ["Kubernetes", "Terraform", "AWS", "Prometheus", "Linux"],
  ["Figma", "User Research", "Prototyping", "Design Systems"],
];

function nameFromFile(fileName: string) {
  const base = fileName
    .replace(/\.pdf$/i, "")
    .replace(/(resume|cv|final|updated|\d{4})/gi, " ")
    .replace(/[_\-.]+/g, " ")
    .trim();
  const words = base.split(/\s+/).filter(Boolean).slice(0, 3);
  if (words.length === 0) return "Unnamed Candidate";
  return words.map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const mockResumeUploadAdapter: ResumeUploadAdapter = {
  async upload(file, onProgress) {
    const steps = 6 + (hash(file.name) % 5);
    for (let i = 1; i <= steps; i++) {
      await delay(120 + (hash(file.name + i) % 160));
      onProgress(Math.round((i / steps) * 100));
    }
    const now = new Date().toISOString();
    const id = makeId("res");
    return {
      id,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileSize: file.size,
      status: "PENDING",
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
      uploadedById: MOCK_USER.id,
      candidateId: null,
    };
  },
  async process(resume) {
    await delay(900 + (hash(resume.fileName) % 1400));
    const now = new Date().toISOString();
    const shouldFail = /scan|image|corrupt/i.test(resume.fileName) || hash(resume.fileName) % 7 === 0;
    if (shouldFail) {
      return {
        resume: { ...resume, status: "FAILED", errorMessage: "Couldn't extract text. The PDF may be scanned or password-protected.", updatedAt: now },
        candidate: null,
      };
    }
    const name = nameFromFile(resume.fileName);
    const skills = SKILL_POOL[hash(name) % SKILL_POOL.length]!;
    const candidateId = makeId("cand");
    const startYear = 2018 + (hash(name) % 5);
    const candidate: Candidate = {
      id: candidateId,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: null,
      location: ["Bengaluru, India", "Kolkata, India", "Pune, India", "Remote"][hash(name) % 4]!,
      linkedIn: null,
      summary: "Profile extracted from uploaded resume (mock extraction).",
      skills,
      normalizedSkills: skills.map(normalizeSkill),
      createdAt: now,
      updatedAt: now,
      resumeId: resume.id,
      uploadedById: resume.uploadedById,
      experience: [
        {
          id: `${candidateId}_exp1`,
          company: "Previous Employer",
          position: "Software Engineer",
          description: `Worked with ${skills.slice(0, 3).join(", ")}.`,
          startDate: `${startYear}-06-01T00:00:00.000Z`,
          endDate: null,
          candidateId,
        },
      ],
      projects: [],
      education: [],
    };
    return { resume: { ...resume, status: "COMPLETED", candidateId, updatedAt: now }, candidate };
  },
};
