import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  Download,
  ExternalLink,
  Eye,
  FileText,
  FolderGit2,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, InitialsAvatar, SectionCard } from "@/components/shared/primitives";
import { EvaluationStatusPill, ResumeStatusPill, ScoreRing } from "@/components/shared/status";
import { useTalentStore } from "@/lib/store";
import {
  EDUCATION_LEVEL_LABEL,
  experienceMonths,
  formatDate,
  formatExperience,
  formatFileSize,
  formatGrade,
  formatMonthYear,
  totalExperienceMonths,
} from "@/lib/talent-utils";
import type { Candidate, Resume } from "@/lib/types";
import { downloadResumeMock } from "./candidates-view";

export function CandidateProfile({ candidateId }: { candidateId: string }) {
  const candidate = useTalentStore((s) => s.candidates.find((c) => c.id === candidateId));
  const resume = useTalentStore((s) => s.resumes.find((r) => r.id === candidate?.resumeId));
  const jobs = useTalentStore((s) => s.jobs);
  const evaluations = useTalentStore((s) => s.evaluations);
  const [preview, setPreview] = useState(false);

  if (!candidate) {
    return (
      <EmptyState
        icon={UserX}
        title="Candidate not found"
        description="This profile may have been removed or the link is incorrect."
        action={
          <Button variant="outline" asChild>
            <Link to="/candidates"><ArrowLeft /> Back to candidates</Link>
          </Button>
        }
      />
    );
  }

  const total = totalExperienceMonths(candidate.experience);
  const sortedExp = [...candidate.experience].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const sortedEdu = [...candidate.education].sort((a, b) => (b.endYear ?? 0) - (a.endYear ?? 0));
  const candidateEvals = Object.values(evaluations)
    .map((ev) => ({ job: jobs.find((j) => j.id === ev.jobId), result: ev.results.find((r) => r.candidateId === candidate.id) }))
    .filter((x): x is { job: NonNullable<typeof x.job>; result: NonNullable<typeof x.result> } => !!x.job && !!x.result);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
        <Link to="/candidates"><ArrowLeft /> Candidates</Link>
      </Button>

      {/* header */}
      <div className="rounded-xl border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <InitialsAvatar name={candidate.name} className="size-14 text-lg" />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight break-words">{candidate.name}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {sortedExp[0] ? `${sortedExp[0].position} · ${sortedExp[0].company}` : "No current role listed"}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <ContactItem icon={Mail} value={candidate.email} href={candidate.email ? `mailto:${candidate.email}` : undefined} />
                <ContactItem icon={Phone} value={candidate.phone} />
                <ContactItem icon={MapPin} value={candidate.location} />
                <ContactItem icon={Linkedin} value={candidate.linkedIn} href={candidate.linkedIn ? `https://${candidate.linkedIn.replace(/^https?:\/\//, "")}` : undefined} />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {resume && (
              <>
                <Button variant="outline" onClick={() => setPreview(true)}><Eye /> Preview resume</Button>
                <Button onClick={() => downloadResumeMock(resume)}><Download /> Download</Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 sm:grid-cols-4">
          <Meta label="Total experience" value={formatExperience(total)} hint="Derived from roles" />
          <Meta label="Roles" value={String(candidate.experience.length)} />
          <Meta label="Projects" value={String(candidate.projects.length)} />
          <Meta label="Added" value={formatDate(candidate.createdAt)} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <SectionCard title="Summary">
            <p className="text-sm leading-relaxed text-foreground/80">
              {candidate.summary ?? <span className="text-muted-foreground">No summary found in resume.</span>}
            </p>
          </SectionCard>

          <SectionCard title="Work experience" description={`${formatExperience(total)} total, overlapping roles merged`}>
            {sortedExp.length === 0 ? (
              <p className="text-sm text-muted-foreground">No work experience found in resume.</p>
            ) : (
              <ol className="relative space-y-6 border-l pl-6">
                {sortedExp.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute top-1 -left-[29px] grid size-3 place-items-center rounded-full border-2 border-card bg-primary" />
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium">{e.position}</p>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Briefcase className="size-3.5" />{e.company}</p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {formatMonthYear(e.startDate)} – {formatMonthYear(e.endDate)} · {formatExperience(experienceMonths(e))}
                      </p>
                    </div>
                    {e.description && <p className="mt-2 text-sm leading-relaxed text-foreground/80">{e.description}</p>}
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>

          <SectionCard title="Projects">
            {candidate.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects found in resume.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {candidate.projects.map((p) => (
                  <div key={p.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex min-w-0 items-center gap-2 font-medium"><FolderGit2 className="size-4 shrink-0 text-muted-foreground" /><span className="truncate">{p.title}</span></p>
                      {p.projectUrl && (
                        <a href={`https://${p.projectUrl.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Open project">
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </div>
                    {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.technologies.map((t) => (
                        <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Education">
            {sortedEdu.length === 0 ? (
              <p className="text-sm text-muted-foreground">No education details found in resume.</p>
            ) : (
              <ul className="space-y-4">
                {sortedEdu.map((ed) => (
                  <li key={ed.id} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"><GraduationCap className="size-4 text-muted-foreground" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                        <p className="font-medium">{[ed.degree, ed.fieldOfStudy].filter(Boolean).join(" · ") || EDUCATION_LEVEL_LABEL[ed.educationLevel]}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">{ed.startYear ?? "—"} – {ed.endYear ?? "—"}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{ed.institution}</p>
                      <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md border px-1.5 py-0.5">{EDUCATION_LEVEL_LABEL[ed.educationLevel]}</span>
                        {formatGrade(ed.gradeType, ed.grade) && <span className="rounded-md bg-muted px-1.5 py-0.5">{formatGrade(ed.gradeType, ed.grade)}</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard title="Skills" description={`${candidate.skills.length} extracted`}>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((s) => (
                <span key={s} className="rounded-md border bg-card px-2 py-1 text-xs">{s}</span>
              ))}
            </div>
          </SectionCard>

          {resume && <ResumeCard resume={resume} onPreview={() => setPreview(true)} />}

          <SectionCard title="Evaluations" description="Scores belong to each job evaluation">
            {candidateEvals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not evaluated against any job yet.</p>
            ) : (
              <ul className="space-y-3">
                {candidateEvals.map(({ job, result }) => (
                  <li key={job.id}>
                    <Link to="/jobs/$id/matches" params={{ id: job.id }} className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-accent">
                      <ScoreRing value={result.overallScore} size={38} stroke={3.5} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{job.title}</p>
                        <EvaluationStatusPill status={result.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </aside>
      </div>

      {resume && <ResumePreviewDialog open={preview} onOpenChange={setPreview} resume={resume} candidate={candidate} />}
    </div>
  );
}

function ContactItem({ icon: Icon, value, href }: { icon: typeof Mail; value: string | null; href?: string | undefined }) {
  if (!value) return null;
  const content = (
    <span className="inline-flex min-w-0 items-center gap-1.5"><Icon className="size-3.5 shrink-0" /><span className="truncate">{value}</span></span>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer" className="min-w-0 hover:text-foreground">{content}</a> : content;
}

function Meta({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ResumeCard({ resume, onPreview }: { resume: Resume; onPreview: () => void }) {
  return (
    <SectionCard title="Original resume">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-destructive-soft"><FileText className="size-5 text-destructive" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={resume.fileName}>{resume.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(resume.fileSize)} · {formatDate(resume.createdAt)}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <ResumeStatusPill status={resume.status} />
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onPreview}><Eye /> Preview</Button>
          <Button variant="ghost" size="sm" onClick={() => downloadResumeMock(resume)}><Download /></Button>
        </div>
      </div>
    </SectionCard>
  );
}

function ResumePreviewDialog({ open, onOpenChange, resume, candidate }: { open: boolean; onOpenChange: (o: boolean) => void; resume: Resume; candidate: Candidate }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4 text-left">
          <DialogTitle className="truncate">{resume.fileName}</DialogTitle>
          <DialogDescription>Preview placeholder — embed the stored PDF from {"fileUrl"} when connected.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto bg-surface p-4 sm:p-8">
          <article className="mx-auto max-w-[640px] space-y-5 rounded-md border bg-card p-6 text-[13px] leading-relaxed shadow-elevated sm:p-10">
            <header className="border-b pb-4">
              <h2 className="text-xl font-semibold">{candidate.name}</h2>
              <p className="text-muted-foreground">{[candidate.email, candidate.phone, candidate.location].filter(Boolean).join(" · ")}</p>
            </header>
            {candidate.summary && <p>{candidate.summary}</p>}
            <section>
              <h3 className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Experience</h3>
              {candidate.experience.map((e) => (
                <div key={e.id} className="mb-3">
                  <p className="font-medium">{e.position}, {e.company} <span className="font-normal text-muted-foreground">({formatMonthYear(e.startDate)} – {formatMonthYear(e.endDate)})</span></p>
                  <p className="text-foreground/80">{e.description}</p>
                </div>
              ))}
            </section>
            <section>
              <h3 className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Education</h3>
              {candidate.education.map((ed) => (
                <p key={ed.id}>{[ed.degree, ed.fieldOfStudy].filter(Boolean).join(", ")} — {ed.institution} ({ed.endYear ?? "—"})</p>
              ))}
            </section>
            <section>
              <h3 className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Skills</h3>
              <p>{candidate.skills.join(" · ")}</p>
            </section>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}
