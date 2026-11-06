/**
 * Mock data shaped exactly like the database schema.
 * Swap this module for real queries when connecting the backend.
 */
import type {
  AcceptedDegree,
  Candidate,
  Education,
  EducationLevel,
  EducationRequirement,
  Experience,
  GradeType,
  Job,
  Project,
  Resume,
  SkillGroup,
  SkillGroupType,
  User,
} from "./types";
import { normalizeSkill, normalizeText } from "./talent-utils";

export const MOCK_USER: User = {
  id: "usr_01",
  clerkId: "user_2xK9mQ4recruiter",
  email: "aditi.rao@northwind.io",
  createdAt: "2026-03-02T09:00:00.000Z",
  updatedAt: "2026-10-28T09:00:00.000Z",
};

/** Display profile — would come from your auth provider, not the User table. */
export const MOCK_RECRUITER_PROFILE = {
  name: "Aditi Rao",
  title: "Senior Talent Partner",
  company: "Northwind Labs",
  email: MOCK_USER.email,
};

// ---------- builders ----------
function exp(cid: string, i: number, company: string, position: string, startDate: string, endDate: string | null, description: string): Experience {
  return { id: `${cid}_exp${i}`, company, position, description, startDate: `${startDate}-01T00:00:00.000Z`, endDate: endDate ? `${endDate}-01T00:00:00.000Z` : null, candidateId: cid };
}
function proj(cid: string, i: number, title: string, description: string, technologies: string[], projectUrl: string | null = null): Project {
  return { id: `${cid}_prj${i}`, title, description, technologies, projectUrl, candidateId: cid };
}
function edu(
  cid: string,
  i: number,
  educationLevel: EducationLevel,
  institution: string,
  degree: string | null,
  fieldOfStudy: string | null,
  startYear: number | null,
  endYear: number | null,
  gradeType: GradeType | null = null,
  grade: number | null = null,
): Education {
  return { id: `${cid}_edu${i}`, educationLevel, institution, degree, fieldOfStudy, startYear, endYear, gradeType, grade, candidateId: cid };
}

interface CandidateSeed {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedIn: string | null;
  summary: string | null;
  skills: string[];
  createdAt: string;
  experience: (cid: string) => Experience[];
  projects: (cid: string) => Project[];
  education: (cid: string) => Education[];
}

const seeds: CandidateSeed[] = [
  {
    id: "cand_01",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 98450 21134",
    location: "Bengaluru, India",
    linkedIn: "linkedin.com/in/priyasharma-dev",
    summary: "Frontend engineer focused on design systems and performance. Led the migration of a 40-screen product to React and TypeScript with a shared component library.",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Jest", "Storybook", "Figma"],
    createdAt: "2026-11-05T14:20:00.000Z",
    experience: (c) => [
      exp(c, 1, "Razorpay", "Senior Frontend Engineer", "2023-04", null, "Own the merchant dashboard design system in React and TypeScript. Cut bundle size 32% through route-level code splitting and introduced Storybook visual tests."),
      exp(c, 2, "Freshworks", "Frontend Engineer", "2020-07", "2023-03", "Built customer-facing analytics views with React, GraphQL and D3. Mentored two junior engineers."),
      exp(c, 3, "Infosys", "Associate Software Engineer", "2019-01", "2020-06", "Maintained internal tools built with Angular and Java."),
    ],
    projects: (c) => [
      proj(c, 1, "Orbit UI", "Open-source accessible component kit with 40+ components.", ["React", "TypeScript", "Storybook", "Tailwind CSS"], "github.com/priyasharma/orbit-ui"),
      proj(c, 2, "Latency Lens", "Browser extension that visualises Core Web Vitals per route.", ["TypeScript", "Chrome APIs"]),
    ],
    education: (c) => [
      edu(c, 1, "UNDERGRADUATE", "PES University", "B.Tech", "Computer Science", 2014, 2018, "CGPA", 8.7),
      edu(c, 2, "HIGHER_SECONDARY", "Delhi Public School, Bengaluru", null, "Science", 2012, 2014, "PERCENTAGE", 94),
    ],
  },
  {
    id: "cand_02",
    name: "Arjun Mehta",
    email: "arjun.mehta@outlook.com",
    phone: "+91 99201 44821",
    location: "Pune, India",
    linkedIn: "linkedin.com/in/arjunmehta",
    summary: "Backend engineer building high-throughput payment and ledger services in Node.js and Go.",
    skills: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Kafka", "Docker", "AWS", "Go"],
    createdAt: "2026-11-04T10:05:00.000Z",
    experience: (c) => [
      exp(c, 1, "PhonePe", "Senior Backend Engineer", "2022-02", null, "Design ledger services in Node.js and Go processing 4M transactions per day on PostgreSQL and Kafka."),
      exp(c, 2, "Persistent Systems", "Software Engineer", "2018-08", "2022-01", "Built REST APIs in Node.js with Redis caching; containerised services with Docker on AWS."),
    ],
    projects: (c) => [proj(c, 1, "Idempotency Kit", "Library for idempotent request handling in Express.", ["Node.js", "Redis", "TypeScript"], "github.com/arjunm/idem-kit")],
    education: (c) => [edu(c, 1, "UNDERGRADUATE", "College of Engineering, Pune", "B.E.", "Information Technology", 2014, 2018, "CGPA", 8.1)],
  },
  {
    id: "cand_03",
    name: "Sneha Iyer",
    email: "sneha.iyer@proton.me",
    phone: "+91 90031 77260",
    location: "Hyderabad, India",
    linkedIn: "linkedin.com/in/snehaiyer-ml",
    summary: "Data scientist with a background in statistics. Ships forecasting and recommendation models to production.",
    skills: ["Python", "SQL", "PyTorch", "scikit-learn", "Pandas", "Airflow", "Tableau", "Statistics"],
    createdAt: "2026-11-03T08:40:00.000Z",
    experience: (c) => [
      exp(c, 1, "Swiggy", "Data Scientist II", "2022-06", null, "Built demand forecasting models in Python and PyTorch; productionised pipelines with Airflow and SQL."),
      exp(c, 2, "Mu Sigma", "Decision Scientist", "2019-07", "2022-05", "Delivered churn and pricing analyses for retail clients using Python, Pandas and Tableau."),
    ],
    projects: (c) => [proj(c, 1, "Menu Recommender", "Session-based recommender using transformer embeddings.", ["Python", "PyTorch", "FastAPI"])],
    education: (c) => [
      edu(c, 1, "POSTGRADUATE", "Indian Statistical Institute", "M.Stat", "Statistics", 2017, 2019, "PERCENTAGE", 78),
      edu(c, 2, "UNDERGRADUATE", "St. Xavier's College, Kolkata", "B.Sc", "Mathematics", 2014, 2017, "PERCENTAGE", 81),
    ],
  },
  {
    id: "cand_04",
    name: "Rahul Banerjee",
    email: "rahul.banerjee@gmail.com",
    phone: "+91 98300 55219",
    location: "Kolkata, India",
    linkedIn: null,
    summary: "Full-stack developer comfortable across React and Node.js, recently focused on internal tooling.",
    skills: ["React", "JavaScript", "Node.js", "MongoDB", "Express", "CSS"],
    createdAt: "2026-11-02T16:12:00.000Z",
    experience: (c) => [
      exp(c, 1, "TCS", "Full Stack Developer", "2021-09", null, "Develop internal dashboards with React and Express backed by MongoDB."),
      exp(c, 2, "Webel Technology", "Junior Web Developer", "2020-01", "2021-08", "Built responsive marketing sites with JavaScript and CSS."),
    ],
    projects: (c) => [proj(c, 1, "Shift Planner", "Scheduling tool for hospital staff.", ["React", "Node.js", "MongoDB"])],
    education: (c) => [edu(c, 1, "UNDERGRADUATE", "Jadavpur University", "B.E.", "Electronics and Telecommunication", 2015, 2019, "CGPA", 7.6)],
  },
  {
    id: "cand_05",
    name: "Lena Fischer",
    email: "lena.fischer@posteo.de",
    phone: "+49 151 2304 8812",
    location: "Berlin, Germany",
    linkedIn: "linkedin.com/in/lenafischer",
    summary: "Product-minded frontend lead. Previously built editor tooling used by 2M creators.",
    skills: ["React", "TypeScript", "Next.js", "Accessibility", "Playwright", "Node.js", "Design Systems"],
    createdAt: "2026-10-31T11:00:00.000Z",
    experience: (c) => [
      exp(c, 1, "Contentful", "Staff Frontend Engineer", "2021-03", null, "Lead the editor frontend team; drove accessibility audits and Playwright end-to-end coverage for React and TypeScript apps."),
      exp(c, 2, "Zalando", "Frontend Engineer", "2017-05", "2021-02", "Built checkout experiences with React and Node.js server rendering."),
    ],
    projects: (c) => [],
    education: (c) => [edu(c, 1, "POSTGRADUATE", "TU Berlin", "M.Sc", "Computer Science", 2015, 2017)],
  },
  {
    id: "cand_06",
    name: "Karan Singh",
    email: "karan.devops@gmail.com",
    phone: "+91 98110 42290",
    location: "Gurugram, India",
    linkedIn: "linkedin.com/in/karansingh-sre",
    summary: "Site reliability engineer specialising in Kubernetes platforms and cost-efficient cloud infrastructure.",
    skills: ["Kubernetes", "Terraform", "AWS", "Docker", "Prometheus", "Python", "Linux", "CI/CD"],
    createdAt: "2026-10-29T13:30:00.000Z",
    experience: (c) => [
      exp(c, 1, "Zomato", "Site Reliability Engineer", "2021-11", null, "Operate 300-node Kubernetes clusters on AWS; codified infrastructure with Terraform and reduced spend 18%."),
      exp(c, 2, "Wipro", "Systems Engineer", "2018-06", "2021-10", "Automated Linux deployments with Python scripts and Jenkins CI/CD."),
    ],
    projects: (c) => [proj(c, 1, "kube-cost-report", "CLI that attributes cluster spend to teams.", ["Go", "Kubernetes", "Prometheus"])],
    education: (c) => [edu(c, 1, "UNDERGRADUATE", "Amity University", "B.Tech", "Computer Science", 2014, 2018, "CGPA", 7.9)],
  },
  {
    id: "cand_07",
    name: "Ananya Ghosh",
    email: "ananya.ghosh@yahoo.com",
    phone: null,
    location: "Remote",
    linkedIn: "linkedin.com/in/ananyaghosh",
    summary: "Product designer with front-end skills; designs and prototypes data-heavy B2B workflows.",
    skills: ["Figma", "Prototyping", "User Research", "Design Systems", "HTML", "CSS", "React"],
    createdAt: "2026-10-27T09:45:00.000Z",
    experience: (c) => [
      exp(c, 1, "Postman", "Senior Product Designer", "2022-01", null, "Design API workflow tooling; run user research and maintain the Figma design systems library."),
      exp(c, 2, "Zeta", "Product Designer", "2019-06", "2021-12", "Designed card-management flows and built React prototypes."),
    ],
    projects: (c) => [proj(c, 1, "Dense Tables Kit", "Figma kit for enterprise data tables.", ["Figma"])],
    education: (c) => [edu(c, 1, "UNDERGRADUATE", "National Institute of Design", "B.Des", "Interaction Design", 2015, 2019)],
  },
  {
    id: "cand_08",
    name: "Vikram Nair",
    email: "vikram.nair@gmail.com",
    phone: "+91 94470 11873",
    location: "Kochi, India",
    linkedIn: null,
    summary: null,
    skills: ["Java", "Spring Boot", "MySQL", "Microservices", "Kafka"],
    createdAt: "2026-10-24T15:10:00.000Z",
    experience: (c) => [
      exp(c, 1, "UST", "Software Engineer", "2022-08", null, "Build Spring Boot microservices for insurance claims processing."),
    ],
    projects: (c) => [],
    education: (c) => [edu(c, 1, "UNDERGRADUATE", "Cochin University of Science and Technology", "B.Tech", "Mechanical Engineering", 2018, 2022, "CGPA", 7.2)],
  },
  {
    id: "cand_09",
    name: "Meera Krishnan",
    email: "meera.k@icloud.com",
    phone: "+91 97890 33015",
    location: "Chennai, India",
    linkedIn: "linkedin.com/in/meerakrishnan",
    summary: "Machine learning engineer working on NLP and retrieval systems.",
    skills: ["Python", "PyTorch", "NLP", "Transformers", "SQL", "Docker", "FastAPI", "AWS"],
    createdAt: "2026-10-21T10:00:00.000Z",
    experience: (c) => [
      exp(c, 1, "Freshworks", "Machine Learning Engineer", "2023-01", null, "Ship retrieval-augmented support assistants using Python, Transformers and FastAPI on AWS."),
      exp(c, 2, "Zoho", "Data Analyst", "2021-06", "2022-12", "Built SQL reporting and early NLP classifiers in Python."),
    ],
    projects: (c) => [proj(c, 1, "Tamil NER", "Named entity recognition for Tamil news.", ["Python", "PyTorch", "Transformers"], "github.com/meerak/tamil-ner")],
    education: (c) => [edu(c, 1, "POSTGRADUATE", "IIT Madras", "M.Tech", "Data Science", 2019, 2021, "CGPA", 9.1)],
  },
  {
    id: "cand_10",
    name: "Daniel Okafor",
    email: "daniel.okafor@gmail.com",
    phone: "+44 7700 900412",
    location: "London, United Kingdom",
    linkedIn: "linkedin.com/in/danielokafor",
    summary: "Backend engineer with fintech experience in Python and Node.js services.",
    skills: ["Python", "Django", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL"],
    createdAt: "2026-10-18T12:25:00.000Z",
    experience: (c) => [
      exp(c, 1, "Monzo", "Backend Engineer", "2021-09", null, "Build PostgreSQL-backed services in Python and Node.js for card disputes."),
      exp(c, 2, "Sage", "Software Developer", "2019-02", "2021-08", "Maintained Django APIs and GraphQL gateway on AWS."),
    ],
    projects: (c) => [],
    education: (c) => [edu(c, 1, "UNDERGRADUATE", "University of Manchester", "B.Sc", "Computer Science", 2015, 2018)],
  },
  {
    id: "cand_11",
    name: "Ishita Chatterjee",
    email: "ishita.c@gmail.com",
    phone: "+91 98741 62210",
    location: "Kolkata, India",
    linkedIn: "linkedin.com/in/ishitachatterjee",
    summary: "Early-career frontend developer with strong fundamentals and open-source contributions.",
    skills: ["JavaScript", "React", "TypeScript", "HTML", "CSS", "Git"],
    createdAt: "2026-10-15T07:50:00.000Z",
    experience: (c) => [
      exp(c, 1, "Cognizant", "Programmer Analyst", "2024-07", null, "Build React and TypeScript screens for a banking portal."),
      exp(c, 2, "Hacktoberfest", "Open Source Contributor", "2023-10", "2024-06", "Contributed accessibility fixes to React component libraries."),
    ],
    projects: (c) => [proj(c, 1, "Portfolio CMS", "Markdown-driven portfolio generator.", ["React", "TypeScript"])],
    education: (c) => [edu(c, 1, "UNDERGRADUATE", "Heritage Institute of Technology", "B.Tech", "Computer Science", 2020, 2024, "CGPA", 8.9)],
  },
  {
    id: "cand_12",
    name: "Rohan Desai",
    email: "rohan.desai@gmail.com",
    phone: "+91 98201 77345",
    location: "Mumbai, India",
    linkedIn: "linkedin.com/in/rohandesai",
    summary: "Platform engineer bridging backend and DevOps; enjoys developer-experience work.",
    skills: ["Go", "Kubernetes", "Docker", "PostgreSQL", "Terraform", "GCP", "gRPC"],
    createdAt: "2026-10-10T09:15:00.000Z",
    experience: (c) => [
      exp(c, 1, "CRED", "Platform Engineer", "2022-04", null, "Built gRPC service templates in Go and Kubernetes deployment tooling on GCP."),
      exp(c, 2, "Morningstar", "Software Engineer", "2019-07", "2022-03", "Developed PostgreSQL data services and Terraform modules."),
    ],
    projects: (c) => [],
    education: (c) => [edu(c, 1, "UNDERGRADUATE", "VJTI Mumbai", "B.Tech", "Information Technology", 2015, 2019, "CGPA", 8.3)],
  },
];

function slugFile(name: string) {
  return `${name.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`;
}

export const MOCK_CANDIDATES: Candidate[] = seeds.map((s, i) => ({
  id: s.id,
  name: s.name,
  email: s.email,
  phone: s.phone,
  location: s.location,
  linkedIn: s.linkedIn,
  summary: s.summary,
  skills: s.skills,
  normalizedSkills: s.skills.map(normalizeSkill),
  createdAt: s.createdAt,
  updatedAt: s.createdAt,
  resumeId: `res_${String(i + 1).padStart(2, "0")}`,
  uploadedById: MOCK_USER.id,
  experience: s.experience(s.id),
  projects: s.projects(s.id),
  education: s.education(s.id),
}));

export const MOCK_RESUMES: Resume[] = [
  ...MOCK_CANDIDATES.map((c, i) => ({
    id: c.resumeId,
    fileName: slugFile(c.name),
    fileUrl: `https://storage.example.com/resumes/${c.resumeId}.pdf`,
    fileSize: 140_000 + ((i * 37_931) % 380_000),
    status: "COMPLETED" as const,
    errorMessage: null,
    createdAt: c.createdAt,
    updatedAt: c.createdAt,
    uploadedById: MOCK_USER.id,
    candidateId: c.id,
  })),
  {
    id: "res_13",
    fileName: "nikhil_verma_cv_2026.pdf",
    fileUrl: "https://storage.example.com/resumes/res_13.pdf",
    fileSize: 312_400,
    status: "PROCESSING",
    errorMessage: null,
    createdAt: "2026-11-06T09:42:00.000Z",
    updatedAt: "2026-11-06T09:43:00.000Z",
    uploadedById: MOCK_USER.id,
    candidateId: null,
  },
  {
    id: "res_14",
    fileName: "fatima_sheikh_resume.pdf",
    fileUrl: "https://storage.example.com/resumes/res_14.pdf",
    fileSize: 205_100,
    status: "PENDING",
    errorMessage: null,
    createdAt: "2026-11-06T09:44:00.000Z",
    updatedAt: "2026-11-06T09:44:00.000Z",
    uploadedById: MOCK_USER.id,
    candidateId: null,
  },
  {
    id: "res_15",
    fileName: "scanned_resume_final.pdf",
    fileUrl: "https://storage.example.com/resumes/res_15.pdf",
    fileSize: 2_840_000,
    status: "FAILED",
    errorMessage: "No selectable text found. The PDF appears to be a scanned image.",
    createdAt: "2026-11-01T12:00:00.000Z",
    updatedAt: "2026-11-01T12:01:00.000Z",
    uploadedById: MOCK_USER.id,
    candidateId: null,
  },
];

// ---------- jobs ----------
export function buildSkillGroup(jobId: string, idx: number, category: string, requirementType: SkillGroupType, skills: string[]): SkillGroup {
  const id = `${jobId}_sg${idx}`;
  return {
    id,
    category,
    requirementType,
    jobId,
    skills: skills.map((name, i) => ({ id: `${id}_s${i}`, name, normalizedName: normalizeSkill(name), groupId: id })),
  };
}

export function buildAcceptedDegree(reqId: string, idx: number, degreeName: string, fields: string[], isFieldOfStudyMandatory: boolean): AcceptedDegree {
  return {
    id: `${reqId}_deg${idx}`,
    degreeName,
    normalizedDegreeName: normalizeText(degreeName),
    acceptedFieldOfStudy: fields,
    normalizedAcceptedFieldOfStudy: fields.map(normalizeText),
    isFieldOfStudyMandatory,
    educationRequirementId: reqId,
  };
}

function eduReq(
  jobId: string,
  minEducationLevel: EducationLevel | null,
  isMandatory: boolean,
  relatedDegreesAllowed: boolean,
  relatedFields: string[],
  degrees: Array<[string, string[], boolean]>,
): EducationRequirement {
  const id = `${jobId}_edureq`;
  return {
    id,
    minEducationLevel,
    relatedDegreesAllowed,
    isMandatory,
    relatedDegreeFieldsOfStudy: relatedFields,
    normalizedRelatedDegreeFieldsOfStudy: relatedFields.map(normalizeText),
    jobId,
    acceptedDegrees: degrees.map(([n, f, m], i) => buildAcceptedDegree(id, i, n, f, m)),
  };
}

export const MOCK_JOBS: Job[] = [
  {
    id: "job_01",
    title: "Senior Frontend Engineer",
    description:
      "We're looking for a Senior Frontend Engineer to shape the core product experience of our recruiter workspace. You'll partner with design to evolve our component library, raise the bar on performance and accessibility, and mentor engineers across squads.\n\nYou have 4+ years building production React applications with TypeScript and a strong sense of craft.",
    minExperience: 4,
    maxExperience: 8,
    location: "Bengaluru, India",
    jobResponsibility: [
      "Build and maintain high-quality React and TypeScript features end to end.",
      "Evolve the shared design system with design partners.",
      "Own frontend performance budgets and accessibility standards.",
      "Mentor engineers through reviews and pairing.",
    ],
    status: "ACTIVE",
    extractionStatus: "COMPLETED",
    extractionError: null,
    createdAt: "2026-10-20T10:00:00.000Z",
    updatedAt: "2026-10-22T10:00:00.000Z",
    createdById: MOCK_USER.id,
    skillGroups: [
      buildSkillGroup("job_01", 1, "Core frontend", "ALL", ["React", "TypeScript"]),
      buildSkillGroup("job_01", 2, "Meta-framework", "ANY", ["Next.js", "Remix", "Vite"]),
      buildSkillGroup("job_01", 3, "Testing", "ANY", ["Jest", "Playwright", "Cypress"]),
      buildSkillGroup("job_01", 4, "Nice to have", "PREFERRED", ["GraphQL", "Storybook", "Accessibility"]),
    ],
    educationRequirement: eduReq("job_01", "UNDERGRADUATE", false, true, ["Information Technology", "Electronics"], [
      ["B.Tech", ["Computer Science", "Information Technology"], false],
      ["B.E.", ["Computer Science"], false],
      ["M.Sc", ["Computer Science"], true],
    ]),
  },
  {
    id: "job_02",
    title: "Backend Engineer – Payments",
    description:
      "Join the payments platform team to build reliable, auditable money-movement services. You'll design APIs, own data models in PostgreSQL, and work with event streaming at scale.",
    minExperience: 3,
    maxExperience: 7,
    location: "Pune, India",
    jobResponsibility: [
      "Design and operate payment and ledger services.",
      "Model financial data in PostgreSQL with strong consistency guarantees.",
      "Build event-driven integrations using Kafka.",
      "Participate in on-call and incident reviews.",
    ],
    status: "ACTIVE",
    extractionStatus: "COMPLETED",
    extractionError: null,
    createdAt: "2026-10-12T09:30:00.000Z",
    updatedAt: "2026-10-12T09:30:00.000Z",
    createdById: MOCK_USER.id,
    skillGroups: [
      buildSkillGroup("job_02", 1, "Languages", "ANY", ["Node.js", "Go", "Java"]),
      buildSkillGroup("job_02", 2, "Data", "ALL", ["PostgreSQL", "Redis"]),
      buildSkillGroup("job_02", 3, "Messaging", "ANY", ["Kafka", "RabbitMQ"]),
      buildSkillGroup("job_02", 4, "Infrastructure", "PREFERRED", ["Docker", "AWS", "Kubernetes"]),
    ],
    educationRequirement: eduReq("job_02", "UNDERGRADUATE", true, true, ["Electronics", "Mathematics"], [
      ["B.Tech", ["Computer Science", "Information Technology"], true],
      ["B.E.", ["Computer Science", "Information Technology"], true],
    ]),
  },
  {
    id: "job_03",
    title: "Data Scientist",
    description:
      "Help our marketplace teams make better decisions with forecasting, experimentation, and recommendation models. You'll own models from exploration to production.",
    minExperience: 2,
    maxExperience: 6,
    location: "Hyderabad, India",
    jobResponsibility: [
      "Build forecasting and recommendation models.",
      "Design and analyse A/B experiments.",
      "Productionise pipelines with data engineering partners.",
    ],
    status: "ACTIVE",
    extractionStatus: "COMPLETED",
    extractionError: null,
    createdAt: "2026-10-05T11:00:00.000Z",
    updatedAt: "2026-10-05T11:00:00.000Z",
    createdById: MOCK_USER.id,
    skillGroups: [
      buildSkillGroup("job_03", 1, "Core", "ALL", ["Python", "SQL"]),
      buildSkillGroup("job_03", 2, "ML frameworks", "ANY", ["PyTorch", "TensorFlow", "scikit-learn"]),
      buildSkillGroup("job_03", 3, "Tooling", "PREFERRED", ["Airflow", "Spark", "Tableau"]),
    ],
    educationRequirement: eduReq("job_03", "POSTGRADUATE", false, true, ["Mathematics", "Economics", "Computer Science"], [
      ["M.Stat", ["Statistics"], true],
      ["M.Tech", ["Data Science", "Computer Science"], false],
    ]),
  },
  {
    id: "job_04",
    title: "Product Designer",
    description: "Design intuitive workflows for complex recruiting data. You'll lead research, prototyping, and visual design across the product.",
    minExperience: 3,
    maxExperience: null,
    location: "Remote",
    jobResponsibility: ["Lead discovery and user research.", "Produce high-fidelity designs and prototypes.", "Contribute to the design system."],
    status: "DRAFT",
    extractionStatus: "COMPLETED",
    extractionError: null,
    createdAt: "2026-11-03T15:00:00.000Z",
    updatedAt: "2026-11-03T15:00:00.000Z",
    createdById: MOCK_USER.id,
    skillGroups: [
      buildSkillGroup("job_04", 1, "Design tools", "ALL", ["Figma"]),
      buildSkillGroup("job_04", 2, "Practice", "ANY", ["User Research", "Prototyping"]),
      buildSkillGroup("job_04", 3, "Bonus", "PREFERRED", ["HTML", "CSS", "React"]),
    ],
    educationRequirement: null,
  },
  {
    id: "job_05",
    title: "DevOps Engineer",
    description: "Run and scale our cloud platform with a focus on reliability, observability, and cost.",
    minExperience: 3,
    maxExperience: 6,
    location: "Gurugram, India",
    jobResponsibility: ["Operate Kubernetes clusters.", "Automate infrastructure with Terraform.", "Improve observability and incident response."],
    status: "CLOSED",
    extractionStatus: "COMPLETED",
    extractionError: null,
    createdAt: "2026-08-14T10:00:00.000Z",
    updatedAt: "2026-10-01T10:00:00.000Z",
    createdById: MOCK_USER.id,
    skillGroups: [
      buildSkillGroup("job_05", 1, "Platform", "ALL", ["Kubernetes", "Terraform"]),
      buildSkillGroup("job_05", 2, "Cloud", "ANY", ["AWS", "GCP", "Azure"]),
      buildSkillGroup("job_05", 3, "Observability", "PREFERRED", ["Prometheus", "Grafana"]),
    ],
    educationRequirement: eduReq("job_05", "UNDERGRADUATE", false, true, ["Electronics", "Information Technology"], [["B.Tech", ["Computer Science"], false]]),
  },
  {
    id: "job_06",
    title: "Machine Learning Engineer – NLP",
    description: "Build retrieval and language understanding systems that power candidate search.",
    minExperience: 2,
    maxExperience: 5,
    location: "Chennai, India",
    jobResponsibility: ["Train and evaluate NLP models.", "Build retrieval pipelines.", "Deploy models as low-latency services."],
    status: "DRAFT",
    extractionStatus: "FAILED",
    extractionError: "The description was too short to extract structured requirements. Add more detail and retry.",
    createdAt: "2026-11-05T17:30:00.000Z",
    updatedAt: "2026-11-05T17:31:00.000Z",
    createdById: MOCK_USER.id,
    skillGroups: [],
    educationRequirement: null,
  },
];
