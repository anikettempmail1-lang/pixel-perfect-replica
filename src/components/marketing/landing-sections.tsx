import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  FileSearch,
  Layers,
  ListChecks,
  Lightbulb,
  ScanText,
  ShieldCheck,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/primitives";
import { ProductPreview } from "./product-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-card transition-colors hover:text-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            Resume intelligence for recruiting teams
            <ArrowRight className="size-3" />
          </a>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance-pretty sm:text-6xl">
            Hire smarter. <span className="text-primary">Discover the right talent.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground text-balance-pretty sm:text-lg">
            TalentIQ turns stacks of resumes into structured, searchable candidate profiles — then evaluates
            them against your job requirements with transparent, evidence-backed insights.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/sign-in">
                Get Started <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </div>
        <div className="mt-16">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}

const PROBLEMS = [
  {
    problem: "Hours lost reading resumes one by one",
    solution: "Upload dozens of PDFs at once and get structured profiles with skills, roles, projects, and education.",
  },
  {
    problem: "Great past applicants get forgotten",
    solution: "Every parsed resume joins a reusable candidate pool you can evaluate against any future job.",
  },
  {
    problem: "Vague job descriptions, inconsistent screening",
    solution: "Extract clear skill groups and education rules from a job description, then review and edit them.",
  },
  {
    problem: "Scores with no explanation",
    solution: "See matched skills, gaps, and the exact resume lines behind each score — you make the call.",
  },
];

export function ProblemSolution() {
  return (
    <section className="border-y bg-card">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">The problem</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Screening shouldn't be guesswork.</h2>
          <p className="mt-3 text-muted-foreground">
            Recruiters juggle inboxes, spreadsheets, and gut feel. TalentIQ gives that work structure without taking
            the decision away from you.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {PROBLEMS.map((p) => (
            <div key={p.problem} className="rounded-xl border bg-background p-5">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                {p.problem}
              </p>
              <p className="mt-3 flex items-start gap-2 text-sm font-medium">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {p.solution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Users, title: "Candidate Pool", text: "One searchable home for every candidate, filterable by skills, location, and experience." },
  { icon: ScanText, title: "Resume Parsing", text: "Batch-upload PDFs and extract contact details, experience timelines, projects, and education." },
  { icon: ListChecks, title: "Job Requirement Extraction", text: "Turn a job description into skill groups — all required, any one, or preferred — plus education rules." },
  { icon: BrainCircuit, title: "Candidate Evaluation", text: "Score candidates across skills, experience, role alignment, education, and location." },
  { icon: Lightbulb, title: "Explainable Hiring Insights", text: "Every score links back to resume evidence, missing requirements, and areas to verify." },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Everything between “resume received” and “shortlist ready.”</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={
                i === 0
                  ? "group rounded-xl border bg-ink p-6 text-ink-foreground shadow-elevated lg:row-span-2"
                  : "group rounded-xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
              }
            >
              <div className={i === 0 ? "grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground" : "grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"}>
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className={i === 0 ? "mt-2 text-sm text-ink-foreground/70" : "mt-2 text-sm text-muted-foreground"}>{f.text}</p>
              {i === 0 && (
                <div className="mt-8 space-y-2">
                  {["React · TypeScript · Next.js", "Python · SQL · PyTorch", "Kubernetes · Terraform · AWS"].map((s) => (
                    <div key={s} className="rounded-lg border border-ink-foreground/10 bg-ink-foreground/5 px-3 py-2 text-xs text-ink-foreground/80">
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: Upload, title: "Upload resumes", text: "Drop in multiple PDFs. Each file is parsed into a structured candidate profile." },
  { icon: FileSearch, title: "Create a job", text: "Paste a job description and extract skill groups, experience, and education requirements." },
  { icon: Layers, title: "Review requirements", text: "Edit what was extracted so the evaluation reflects what you actually need." },
  { icon: BrainCircuit, title: "Evaluate & decide", text: "Compare ranked candidates with evidence, then shortlist, reject, or flag for review." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Four steps from inbox to shortlist.</h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <s.icon className="size-5 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-6 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const WHY = [
  { title: "Explainable by design", text: "Scores are a starting point with visible reasoning — never a hiring verdict." },
  { title: "Gaps aren't treated as facts", text: "If a skill isn't in the resume, TalentIQ flags it to verify rather than assuming it's missing." },
  { title: "Structured, not flattened", text: "Skill groups and accepted degrees keep their nuance, so “any one of” stays different from “all of”." },
  { title: "Recruiter in control", text: "Edit extracted requirements, add notes, and decide who moves forward." },
];

export function WhyTalentIQ() {
  return (
    <section id="why" className="scroll-mt-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-sm font-medium text-primary">Why TalentIQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built to support judgment, not replace it.</h2>
          <p className="mt-3 text-muted-foreground">
            Hiring is a human decision. TalentIQ organises the information so you can make it faster and more consistently.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm shadow-card">
            <ShieldCheck className="size-4 text-success" />
            Candidates never need an account
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {WHY.map((w) => (
            <div key={w.title} className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold">{w.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-ink px-6 py-14 text-center text-ink-foreground sm:px-12">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-80" />
        <h2 className="relative text-3xl font-semibold tracking-tight">Start building your candidate pool today.</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-ink-foreground/70">
          Upload your first batch of resumes and see structured profiles in minutes.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link to="/sign-in">
              Get Started <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted-foreground">Recruitment intelligence for modern hiring teams.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how-it-works" className="hover:text-foreground">How It Works</a>
          <a href="#why" className="hover:text-foreground">Why TalentIQ</a>
          <Link to="/sign-in" className="hover:text-foreground">Sign In</Link>
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">© 2026 TalentIQ. All rights reserved.</p>
      </div>
    </footer>
  );
}
