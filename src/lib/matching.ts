/**
 * Illustrative, deterministic mock evaluation.
 * Replace with your backend evaluation; the MatchResult shape is the UI contract.
 * Absence of a skill in the resume is reported as "not found", never as proof it is lacking.
 */
import type {
  Candidate,
  EducationAssessment,
  Job,
  MatchResult,
  MissingSkillGroup,
  ResumeEvidence,
  SkillGroup,
  SkillMatch,
} from "./types";
import {
  EDUCATION_LEVEL_LABEL,
  EDUCATION_LEVEL_RANK,
  MOCK_NOW,
  experienceMonths,
  normalizeSkill,
  normalizeText,
  totalExperienceMonths,
} from "./talent-utils";

type FoundIn = SkillMatch["foundIn"][number];

function skillSources(candidate: Candidate) {
  const fromSkills = new Set(candidate.normalizedSkills.map(normalizeSkill));
  const fromProjects = new Set(
    candidate.projects.flatMap((p) => p.technologies.map(normalizeSkill)),
  );
  const experienceText = candidate.experience
    .map((e) => `${e.position} ${e.description ?? ""}`.toLowerCase())
    .join(" \n ");
  return { fromSkills, fromProjects, experienceText };
}

export function findSkill(
  candidate: Candidate,
  normalizedName: string,
  sources = skillSources(candidate),
): FoundIn[] {
  const n = normalizeSkill(normalizedName);
  const found: FoundIn[] = [];
  if (sources.fromSkills.has(n)) found.push("skills");
  if (sources.fromProjects.has(n)) found.push("projects");
  if (n.length > 2 && sources.experienceText.includes(n)) found.push("experience");
  return found;
}

export interface GroupResult {
  group: SkillGroup;
  found: string[];
  missing: string[];
  /** 0..1 – how well this group is satisfied under its requirement type. */
  satisfaction: number;
  satisfied: boolean;
}

/** Applies ANY / ALL / PREFERRED semantics to a single skill group. */
export function evaluateSkillGroup(candidate: Candidate, group: SkillGroup): GroupResult {
  const sources = skillSources(candidate);
  const found: string[] = [];
  const missing: string[] = [];
  for (const s of group.skills) {
    if (findSkill(candidate, s.normalizedName, sources).length > 0) found.push(s.name);
    else missing.push(s.name);
  }
  const total = group.skills.length || 1;
  if (group.requirementType === "ALL") {
    return { group, found, missing, satisfaction: found.length / total, satisfied: missing.length === 0 };
  }
  if (group.requirementType === "ANY") {
    const ok = found.length > 0;
    return { group, found, missing: ok ? [] : missing, satisfaction: ok ? 1 : 0, satisfied: ok };
  }
  // PREFERRED never blocks; satisfaction is a bonus signal.
  return { group, found, missing, satisfaction: found.length / total, satisfied: true };
}

const STOPWORDS = new Set(["senior", "junior", "lead", "staff", "principal", "engineer", "ii", "iii", "i", "the", "and", "of", "–", "-", "sr", "jr"]);

function titleTokens(title: string) {
  return normalizeText(title)
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function scoreLocation(job: Job, candidate: Candidate): { score: number; flag?: string | undefined } {
  if (!job.location || /remote/i.test(job.location)) return { score: 100 };
  if (!candidate.location) return { score: 50, flag: "Candidate location not found in resume." };
  if (/remote/i.test(candidate.location)) return { score: 60, flag: "Candidate lists Remote — confirm relocation or on-site availability." };
  const jobParts = job.location.split(",").map((p) => p.trim().toLowerCase());
  const candParts = candidate.location.split(",").map((p) => p.trim().toLowerCase());
  if (jobParts[0] === candParts[0]) return { score: 100 };
  if (jobParts.at(-1) === candParts.at(-1)) return { score: 70 };
  return { score: 40, flag: "Different location — relocation may need discussion." };
}

function assessEducation(job: Job, candidate: Candidate): { score: number; assessment: EducationAssessment; flag?: string | undefined } {
  const req = job.educationRequirement;
  if (!req) {
    return {
      score: 100,
      assessment: { meetsMinimumLevel: null, matchedDegree: null, fieldOfStudyMatch: null, note: "No education requirement for this job." },
    };
  }
  if (candidate.education.length === 0) {
    return {
      score: 50,
      assessment: { meetsMinimumLevel: null, matchedDegree: null, fieldOfStudyMatch: null, note: "No education details found in resume." },
      flag: "Education not found in resume — verify manually.",
    };
  }
  const best = [...candidate.education].sort(
    (a, b) => EDUCATION_LEVEL_RANK[b.educationLevel] - EDUCATION_LEVEL_RANK[a.educationLevel],
  )[0]!;
  const meetsMin = req.minEducationLevel
    ? EDUCATION_LEVEL_RANK[best.educationLevel] >= EDUCATION_LEVEL_RANK[req.minEducationLevel]
    : true;

  let matchedDegree: string | null = null;
  let fieldMatch: boolean | null = null;
  for (const edu of candidate.education) {
    const deg = normalizeText(edu.degree ?? "");
    const field = normalizeText(edu.fieldOfStudy ?? "");
    for (const ad of req.acceptedDegrees) {
      if (deg && (deg.includes(ad.normalizedDegreeName) || ad.normalizedDegreeName.includes(deg))) {
        const fieldOk =
          ad.normalizedAcceptedFieldOfStudy.length === 0 ||
          ad.normalizedAcceptedFieldOfStudy.some((f) => field.includes(f) || f.includes(field));
        if (fieldOk || !ad.isFieldOfStudyMandatory) {
          matchedDegree = ad.degreeName;
          fieldMatch = ad.normalizedAcceptedFieldOfStudy.length === 0 ? null : fieldOk;
          break;
        }
      }
    }
    if (!matchedDegree && req.relatedDegreesAllowed && field) {
      if (req.normalizedRelatedDegreeFieldsOfStudy.some((f) => field.includes(f) || f.includes(field))) {
        matchedDegree = `${edu.degree ?? "Degree"} (related field)`;
        fieldMatch = true;
      }
    }
    if (matchedDegree) break;
  }

  let score = (meetsMin ? 55 : 20) + (matchedDegree ? 45 : req.acceptedDegrees.length === 0 ? 45 : 10);
  score = Math.min(100, score);
  const levelLabel = req.minEducationLevel ? EDUCATION_LEVEL_LABEL[req.minEducationLevel].toLowerCase() : "any";
  const note = matchedDegree
    ? `Holds ${matchedDegree}; ${meetsMin ? "meets" : "below"} the ${levelLabel} minimum.`
    : `Highest level ${EDUCATION_LEVEL_LABEL[best.educationLevel].toLowerCase()}; no listed accepted degree matched.`;
  return {
    score,
    assessment: { meetsMinimumLevel: meetsMin, matchedDegree, fieldOfStudyMatch: fieldMatch, note },
    flag: !matchedDegree && req.isMandatory ? "Mandatory education requirement not clearly met — review degree details." : undefined,
  };
}

export function evaluateCandidate(candidate: Candidate, job: Job, now = MOCK_NOW): MatchResult {
  const groups = job.skillGroups.map((g) => evaluateSkillGroup(candidate, g));
  const required = groups.filter((g) => g.group.requirementType !== "PREFERRED");
  const preferred = groups.filter((g) => g.group.requirementType === "PREFERRED");

  const reqAvg = required.length ? required.reduce((s, g) => s + g.satisfaction, 0) / required.length : 1;
  const prefAvg = preferred.length ? preferred.reduce((s, g) => s + g.satisfaction, 0) / preferred.length : 0;
  const skillsScore = Math.round(preferred.length ? reqAvg * 85 + prefAvg * 15 : reqAvg * 100);

  // Experience
  const totalMonths = totalExperienceMonths(candidate.experience, now);
  const years = totalMonths / 12;
  let experienceScore = 100;
  if (job.minExperience != null && years < job.minExperience) {
    experienceScore = Math.round((years / Math.max(job.minExperience, 0.5)) * 85);
  } else if (job.maxExperience != null && years > job.maxExperience + 3) {
    experienceScore = 85;
  }

  // Role alignment: share of experience months in roles that share title keywords.
  const tokens = titleTokens(job.title);
  const relevant = candidate.experience
    .filter((e) => {
      const pos = normalizeText(`${e.position} ${e.description ?? ""}`);
      return tokens.some((t) => pos.includes(t));
    })
    .map((e) => ({ experienceId: e.id, position: e.position, company: e.company, months: experienceMonths(e, now) }));
  const relevantMonths = relevant.reduce((s, r) => s + r.months, 0);
  const roleAlignmentScore = totalMonths
    ? Math.round(35 + 65 * Math.min(1, relevantMonths / totalMonths))
    : 30;

  const edu = assessEducation(job, candidate);
  const loc = scoreLocation(job, candidate);

  const overallScore = Math.round(
    skillsScore * 0.4 + experienceScore * 0.2 + roleAlignmentScore * 0.2 + edu.score * 0.1 + loc.score * 0.1,
  );

  const sources = skillSources(candidate);
  const matchingSkills: SkillMatch[] = groups.flatMap((g) =>
    g.found.map((name) => ({
      skill: name,
      groupCategory: g.group.category,
      requirementType: g.group.requirementType,
      foundIn: findSkill(candidate, name, sources),
    })),
  );

  const missingRequiredSkills: MissingSkillGroup[] = required
    .filter((g) => !g.satisfied)
    .map((g) => ({
      groupId: g.group.id,
      category: g.group.category,
      requirementType: g.group.requirementType as "ANY" | "ALL",
      missingSkills: g.missing,
    }));

  const evidence: ResumeEvidence[] = [];
  for (const e of candidate.experience) {
    const text = e.description ?? "";
    const hit = matchingSkills.find((m) => text.toLowerCase().includes(m.skill.toLowerCase()));
    if (hit && text) evidence.push({ source: "experience", label: `${e.position} · ${e.company}`, excerpt: text });
  }
  for (const p of candidate.projects) {
    const techs = p.technologies.filter((t) => matchingSkills.some((m) => normalizeSkill(m.skill) === normalizeSkill(t)));
    if (techs.length) evidence.push({ source: "project", label: p.title, excerpt: `${p.description ?? ""} (Uses ${techs.join(", ")})`.trim() });
  }
  if (edu.assessment.matchedDegree) {
    evidence.push({ source: "education", label: "Education", excerpt: edu.assessment.note });
  }

  const reviewFlags: string[] = [];
  for (const m of missingRequiredSkills) {
    reviewFlags.push(
      `${m.missingSkills.join(", ")} not found in resume (${m.category}). The candidate may still have ${m.missingSkills.length > 1 ? "these skills" : "this skill"} — confirm in screening.`,
    );
  }
  if (job.minExperience != null && years < job.minExperience) {
    reviewFlags.push(`Derived experience (${years.toFixed(1)} yrs) is below the ${job.minExperience} yr minimum.`);
  }
  if (edu.flag) reviewFlags.push(edu.flag);
  if (loc.flag) reviewFlags.push(loc.flag);
  if (!candidate.email) reviewFlags.push("No email address found in resume.");

  return {
    id: `${job.id}__${candidate.id}`,
    candidateId: candidate.id,
    jobId: job.id,
    overallScore,
    skillsScore,
    experienceScore,
    roleAlignmentScore,
    educationScore: edu.score,
    locationScore: loc.score,
    status: "PENDING",
    evaluatedAt: now.toISOString(),
    matchingSkills,
    missingRequiredSkills,
    preferredSkillsFound: preferred.flatMap((g) => g.found),
    preferredSkillsNotFound: preferred.flatMap((g) => g.missing),
    relevantExperience: relevant,
    educationAssessment: edu.assessment,
    resumeEvidence: evidence.slice(0, 5),
    reviewFlags,
    notes: "",
  };
}

export type MatchTier = "strong" | "potential" | "low";

export function matchTier(score: number): MatchTier {
  if (score >= 75) return "strong";
  if (score >= 55) return "potential";
  return "low";
}

export const MATCH_TIER_LABEL: Record<MatchTier, string> = {
  strong: "Strong match",
  potential: "Potential match",
  low: "Low match",
};
