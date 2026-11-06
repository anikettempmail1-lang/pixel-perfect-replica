import { z } from "zod";
import type { EducationLevel, Job, JobStatus } from "@/lib/types";
import type { ExtractedRequirements } from "@/lib/job-extraction";
import { EDUCATION_LEVELS, MOCK_NOW, makeId, normalizeSkill, normalizeText } from "@/lib/talent-utils";
import { MOCK_USER } from "@/lib/mock-data";

const levelEnum = z.enum(EDUCATION_LEVELS as [EducationLevel, ...EducationLevel[]]);

export const jobFormSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
    description: z.string().trim().min(60, "Add at least 60 characters so requirements can be extracted").max(8000),
    location: z.string().trim().max(120),
    minExperience: z.number({ invalid_type_error: "Enter a number" }).min(0).max(50).nullable(),
    maxExperience: z.number({ invalid_type_error: "Enter a number" }).min(0).max(50).nullable(),
    jobResponsibility: z.array(z.object({ value: z.string().trim().min(1, "Responsibility can't be empty").max(300) })),
    skillGroups: z.array(
      z.object({
        id: z.string(),
        category: z.string().trim().min(1, "Category is required").max(60),
        requirementType: z.enum(["ANY", "ALL", "PREFERRED"]),
        skills: z
          .array(z.object({ id: z.string(), name: z.string().trim().min(1, "Skill name required").max(60) }))
          .min(1, "Add at least one skill"),
      }),
    ),
    education: z.object({
      enabled: z.boolean(),
      minEducationLevel: levelEnum.nullable(),
      isMandatory: z.boolean(),
      relatedDegreesAllowed: z.boolean(),
      relatedDegreeFieldsOfStudy: z.array(z.string()),
      acceptedDegrees: z.array(
        z.object({
          id: z.string(),
          degreeName: z.string().trim().min(1, "Degree name is required").max(80),
          acceptedFieldOfStudy: z.array(z.string()),
          isFieldOfStudyMandatory: z.boolean(),
        }),
      ),
    }),
  })
  .refine((v) => v.minExperience == null || v.maxExperience == null || v.minExperience <= v.maxExperience, {
    message: "Maximum must be greater than or equal to minimum",
    path: ["maxExperience"],
  })
  .refine((v) => !v.education.enabled || !v.education.acceptedDegrees.some((d) => d.isFieldOfStudyMandatory && d.acceptedFieldOfStudy.length === 0), {
    message: "Degrees with a mandatory field of study need at least one accepted field",
    path: ["education", "acceptedDegrees"],
  });

export type JobFormValues = z.infer<typeof jobFormSchema>;

export const emptyJobForm: JobFormValues = {
  title: "",
  description: "",
  location: "",
  minExperience: null,
  maxExperience: null,
  jobResponsibility: [],
  skillGroups: [],
  education: {
    enabled: false,
    minEducationLevel: null,
    isMandatory: false,
    relatedDegreesAllowed: false,
    relatedDegreeFieldsOfStudy: [],
    acceptedDegrees: [],
  },
};

export const newLocalId = (p: string) => makeId(p);

export function jobToForm(job: Job): JobFormValues {
  const er = job.educationRequirement;
  return {
    title: job.title,
    description: job.description,
    location: job.location ?? "",
    minExperience: job.minExperience,
    maxExperience: job.maxExperience,
    jobResponsibility: job.jobResponsibility.map((value) => ({ value })),
    skillGroups: job.skillGroups.map((g) => ({
      id: g.id,
      category: g.category,
      requirementType: g.requirementType,
      skills: g.skills.map((s) => ({ id: s.id, name: s.name })),
    })),
    education: er
      ? {
          enabled: true,
          minEducationLevel: er.minEducationLevel,
          isMandatory: er.isMandatory,
          relatedDegreesAllowed: er.relatedDegreesAllowed,
          relatedDegreeFieldsOfStudy: er.relatedDegreeFieldsOfStudy,
          acceptedDegrees: er.acceptedDegrees.map((d) => ({
            id: d.id,
            degreeName: d.degreeName,
            acceptedFieldOfStudy: d.acceptedFieldOfStudy,
            isFieldOfStudyMandatory: d.isFieldOfStudyMandatory,
          })),
        }
      : emptyJobForm.education,
  };
}

export function applyExtraction(values: JobFormValues, ex: ExtractedRequirements): JobFormValues {
  return {
    ...values,
    location: ex.location ?? values.location,
    minExperience: ex.minExperience,
    maxExperience: ex.maxExperience,
    jobResponsibility: ex.jobResponsibility.map((value) => ({ value })),
    skillGroups: ex.skillGroups.map((g) => ({
      id: newLocalId("sg"),
      category: g.category,
      requirementType: g.requirementType,
      skills: g.skills.map((name) => ({ id: newLocalId("sk"), name })),
    })),
    education: ex.education
      ? {
          enabled: true,
          ...ex.education,
          acceptedDegrees: ex.education.acceptedDegrees.map((d) => ({ id: newLocalId("deg"), ...d })),
        }
      : emptyJobForm.education,
  };
}

/** Additional rules that only apply when activating a job. Returns human-readable problems. */
export function activationProblems(v: JobFormValues): string[] {
  const problems: string[] = [];
  if (v.skillGroups.length === 0) problems.push("Add at least one skill group.");
  if (!v.skillGroups.some((g) => g.requirementType !== "PREFERRED")) problems.push("At least one group must be required (ALL or ANY).");
  if (v.jobResponsibility.length === 0) problems.push("Add at least one responsibility.");
  return problems;
}

/** Converts form values into the nested Job shape (preserves SkillGroup → SkillRequirement and AcceptedDegree objects). */
export function formToJob(v: JobFormValues, status: JobStatus, existing?: Job): Job {
  const jobId = existing?.id ?? makeId("job");
  const now = new Date(Math.max(Date.now(), MOCK_NOW.getTime())).toISOString();
  const reqId = existing?.educationRequirement?.id ?? `${jobId}_edureq`;
  return {
    id: jobId,
    title: v.title.trim(),
    description: v.description.trim(),
    minExperience: v.minExperience,
    maxExperience: v.maxExperience,
    location: v.location.trim() || null,
    jobResponsibility: v.jobResponsibility.map((r) => r.value.trim()).filter(Boolean),
    status,
    extractionStatus: v.skillGroups.length || existing?.extractionStatus === "COMPLETED" ? "COMPLETED" : existing?.extractionStatus ?? "PENDING",
    extractionError: null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdById: existing?.createdById ?? MOCK_USER.id,
    skillGroups: v.skillGroups.map((g) => ({
      id: g.id,
      category: g.category.trim(),
      requirementType: g.requirementType,
      jobId,
      skills: g.skills.map((s) => ({ id: s.id, name: s.name.trim(), normalizedName: normalizeSkill(s.name), groupId: g.id })),
    })),
    educationRequirement: v.education.enabled
      ? {
          id: reqId,
          minEducationLevel: v.education.minEducationLevel,
          relatedDegreesAllowed: v.education.relatedDegreesAllowed,
          isMandatory: v.education.isMandatory,
          relatedDegreeFieldsOfStudy: v.education.relatedDegreeFieldsOfStudy,
          normalizedRelatedDegreeFieldsOfStudy: v.education.relatedDegreeFieldsOfStudy.map(normalizeText),
          jobId,
          acceptedDegrees: v.education.acceptedDegrees.map((d) => ({
            id: d.id,
            degreeName: d.degreeName.trim(),
            normalizedDegreeName: normalizeText(d.degreeName),
            acceptedFieldOfStudy: d.acceptedFieldOfStudy,
            normalizedAcceptedFieldOfStudy: d.acceptedFieldOfStudy.map(normalizeText),
            isFieldOfStudyMandatory: d.isFieldOfStudyMandatory,
            educationRequirementId: reqId,
          })),
        }
      : null,
  };
}
