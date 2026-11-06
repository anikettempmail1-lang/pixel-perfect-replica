/**
 * TalentIQ domain types.
 * Database types mirror the Prisma schema exactly (dates serialized as ISO strings).
 * Matching types at the bottom are frontend-only evaluation records.
 */

// ---------- Enums ----------
export type ResumeStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type EducationLevel =
  | "SECONDARY"
  | "HIGHER_SECONDARY"
  | "DIPLOMA"
  | "ASSOCIATE"
  | "UNDERGRADUATE"
  | "POSTGRADUATE"
  | "DOCTORATE"
  | "OTHER";

export type GradeType = "PERCENTAGE" | "CGPA";

export type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export type JobExtractionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type SkillGroupType = "ANY" | "ALL" | "PREFERRED";

// ---------- Models ----------
export interface User {
  id: string;
  clerkId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // bytes
  status: ResumeStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedById: string;
  /** Candidate id when processing produced a candidate; null otherwise. */
  candidateId: string | null;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string | null;
  startDate: string;
  endDate: string | null; // null = current role
  candidateId: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  technologies: string[];
  projectUrl: string | null;
  candidateId: string;
}

export interface Education {
  id: string;
  educationLevel: EducationLevel;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  gradeType: GradeType | null;
  grade: number | null;
  candidateId: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedIn: string | null;
  summary: string | null;
  skills: string[];
  normalizedSkills: string[];
  createdAt: string;
  updatedAt: string;
  resumeId: string;
  uploadedById: string;
  experience: Experience[];
  projects: Project[];
  education: Education[];
}

export interface SkillRequirement {
  id: string;
  name: string;
  normalizedName: string;
  groupId: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  requirementType: SkillGroupType;
  jobId: string;
  skills: SkillRequirement[];
}

export interface AcceptedDegree {
  id: string;
  degreeName: string;
  normalizedDegreeName: string;
  acceptedFieldOfStudy: string[];
  normalizedAcceptedFieldOfStudy: string[];
  isFieldOfStudyMandatory: boolean;
  educationRequirementId: string;
}

export interface EducationRequirement {
  id: string;
  minEducationLevel: EducationLevel | null;
  relatedDegreesAllowed: boolean;
  isMandatory: boolean;
  relatedDegreeFieldsOfStudy: string[];
  normalizedRelatedDegreeFieldsOfStudy: string[];
  jobId: string;
  acceptedDegrees: AcceptedDegree[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  minExperience: number | null;
  maxExperience: number | null;
  location: string | null;
  jobResponsibility: string[];
  status: JobStatus;
  extractionStatus: JobExtractionStatus;
  extractionError: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  skillGroups: SkillGroup[];
  educationRequirement: EducationRequirement | null;
}

// ---------- Frontend-only matching types ----------
export type EvaluationStatus = "PENDING" | "SHORTLISTED" | "REJECTED" | "NEEDS_REVIEW";

export interface SkillMatch {
  skill: string;
  groupCategory: string;
  requirementType: SkillGroupType;
  /** Where the skill was observed in the resume. */
  foundIn: Array<"skills" | "experience" | "projects">;
}

export interface MissingSkillGroup {
  groupId: string;
  category: string;
  requirementType: Exclude<SkillGroupType, "PREFERRED">;
  missingSkills: string[];
}

export interface ResumeEvidence {
  source: "experience" | "project" | "education" | "summary";
  label: string;
  excerpt: string;
}

export interface EducationAssessment {
  meetsMinimumLevel: boolean | null;
  matchedDegree: string | null;
  fieldOfStudyMatch: boolean | null;
  note: string;
}

export interface MatchResult {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  roleAlignmentScore: number;
  educationScore: number;
  locationScore: number;
  status: EvaluationStatus;
  evaluatedAt: string;
  matchingSkills: SkillMatch[];
  missingRequiredSkills: MissingSkillGroup[];
  preferredSkillsFound: string[];
  preferredSkillsNotFound: string[];
  relevantExperience: Array<{ experienceId: string; position: string; company: string; months: number }>;
  educationAssessment: EducationAssessment;
  resumeEvidence: ResumeEvidence[];
  reviewFlags: string[];
  notes: string;
}
