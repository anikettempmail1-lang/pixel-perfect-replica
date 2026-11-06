/**
 * Mock job-requirement extractor. Replace `extractJobRequirements` with your API call;
 * it must resolve with the same nested shape (skill groups → skills, accepted degrees).
 */
import type { EducationLevel, SkillGroupType } from "./types";

export interface ExtractedSkillGroup {
  category: string;
  requirementType: SkillGroupType;
  skills: string[];
}

export interface ExtractedDegree {
  degreeName: string;
  acceptedFieldOfStudy: string[];
  isFieldOfStudyMandatory: boolean;
}

export interface ExtractedRequirements {
  minExperience: number | null;
  maxExperience: number | null;
  location: string | null;
  jobResponsibility: string[];
  skillGroups: ExtractedSkillGroup[];
  education: {
    minEducationLevel: EducationLevel | null;
    isMandatory: boolean;
    relatedDegreesAllowed: boolean;
    relatedDegreeFieldsOfStudy: string[];
    acceptedDegrees: ExtractedDegree[];
  } | null;
}

const CATALOG: Array<{ category: string; skills: string[] }> = [
  { category: "Frontend", skills: ["React", "TypeScript", "JavaScript", "Next.js", "Vue", "Angular", "Tailwind CSS", "CSS", "HTML"] },
  { category: "Backend", skills: ["Node.js", "Go", "Java", "Python", "Django", "Spring Boot", "GraphQL", "REST", "gRPC"] },
  { category: "Data", skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQL", "Kafka", "Spark", "Airflow"] },
  { category: "Cloud & DevOps", skills: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD"] },
  { category: "Machine learning", skills: ["PyTorch", "TensorFlow", "scikit-learn", "NLP", "Transformers", "Pandas"] },
  { category: "Testing", skills: ["Jest", "Playwright", "Cypress", "Testing Library"] },
  { category: "Design", skills: ["Figma", "Prototyping", "User Research", "Design Systems", "Accessibility"] },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function hasSkill(text: string, skill: string) {
  return new RegExp(`(^|[^a-z0-9])${escape(skill.toLowerCase())}([^a-z0-9]|$)`).test(text);
}

export async function extractJobRequirements(input: { title: string; description: string; location: string }): Promise<ExtractedRequirements> {
  await new Promise((r) => setTimeout(r, 2200));
  const text = input.description.toLowerCase();

  if (text.length < 60) throw new Error("The description is too short to extract structured requirements. Add more detail and try again.");

  // Sentences around "nice to have / preferred / bonus" mark preferred skills.
  const prefIdx = text.search(/nice to have|preferred|bonus|plus:/);
  const prefText = prefIdx >= 0 ? text.slice(prefIdx) : "";
  const reqText = prefIdx >= 0 ? text.slice(0, prefIdx) : text;

  const skillGroups: ExtractedSkillGroup[] = [];
  const preferred: string[] = [];
  for (const cat of CATALOG) {
    const req = cat.skills.filter((s) => hasSkill(reqText, s));
    const pref = cat.skills.filter((s) => !req.includes(s) && hasSkill(prefText, s));
    preferred.push(...pref);
    if (req.length) {
      skillGroups.push({ category: cat.category, requirementType: req.length <= 2 ? "ALL" : "ANY", skills: req });
    }
  }
  if (preferred.length) skillGroups.push({ category: "Nice to have", requirementType: "PREFERRED", skills: preferred });

  const range = text.match(/(\d+)\s*(?:-|–|to)\s*(\d+)\s*\+?\s*years?/);
  const plus = text.match(/(\d+)\s*\+?\s*years?/);
  const minExperience = range ? Number(range[1]) : plus ? Number(plus[1]) : null;
  const maxExperience = range ? Number(range[2]) : null;

  const lines = input.description
    .split(/\n|(?<=\.)\s+/)
    .map((l) => l.replace(/^[\s•\-*\d.)]+/, "").trim())
    .filter((l) => l.length > 20 && l.length < 180);
  const verbs = /^(build|design|own|lead|develop|maintain|collaborate|partner|mentor|drive|ship|work|improve|create|implement|operate|participate|help|define|write)/i;
  let jobResponsibility = lines.filter((l) => verbs.test(l)).slice(0, 6);
  if (jobResponsibility.length === 0) jobResponsibility = lines.slice(0, 3);

  let education: ExtractedRequirements["education"] = null;
  const mentionsMasters = /master|m\.tech|m\.sc|postgraduate|m\.s\b/.test(text);
  const mentionsBachelors = /bachelor|b\.tech|b\.e\.|b\.sc|degree|graduate/.test(text);
  if (mentionsMasters || mentionsBachelors) {
    education = {
      minEducationLevel: mentionsMasters && !mentionsBachelors ? "POSTGRADUATE" : "UNDERGRADUATE",
      isMandatory: /required|must/.test(text),
      relatedDegreesAllowed: /related field|equivalent/.test(text),
      relatedDegreeFieldsOfStudy: /related field|equivalent/.test(text) ? ["Information Technology", "Electronics"] : [],
      acceptedDegrees: [
        { degreeName: mentionsMasters && !mentionsBachelors ? "M.Tech" : "B.Tech", acceptedFieldOfStudy: ["Computer Science"], isFieldOfStudyMandatory: false },
      ],
    };
  }

  return {
    minExperience,
    maxExperience,
    location: input.location || null,
    jobResponsibility,
    skillGroups,
    education,
  };
}

export const SAMPLE_JOB_DESCRIPTION = `We are hiring a Senior Frontend Engineer to build the next generation of our analytics product.

What you'll do:
- Build accessible, high-performance interfaces with React and TypeScript.
- Partner with designers to evolve our design system.
- Own testing strategy using Jest and Playwright.
- Mentor engineers and lead technical design reviews.

What we're looking for:
- 5-8 years of frontend experience.
- Strong React, TypeScript and Next.js skills.
- Bachelor's degree in Computer Science or a related field.

Nice to have: GraphQL, Figma, Accessibility audits.`;
