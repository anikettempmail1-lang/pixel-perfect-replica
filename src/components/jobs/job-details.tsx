import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Check,
  GraduationCap,
  MapPin,
  Pencil,
  Play,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, SectionCard, StatCard } from "@/components/shared/primitives";
import { JobStatusPill } from "@/components/shared/status";
import { useTalentStore } from "@/lib/store";
import { EDUCATION_LEVEL_LABEL, SKILL_GROUP_TYPE_INFO, formatDate, formatExperienceRange, formatRelative } from "@/lib/talent-utils";
import type { Job } from "@/lib/types";
import { JobConfirmDialogs, activateJob } from "./job-actions";
import { RequirementTypeBadge } from "./skill-groups-editor";

export function JobDetails({ jobId }: { jobId: string }) {
  const job = useTalentStore((s) => s.jobs.find((j) => j.id === jobId));
  const evaluation = useTalentStore((s) => s.evaluations[jobId]);
  const poolSize = useTalentStore((s) => s.candidates.length);
  const [confirm, setConfirm] = useState<null | "delete" | "close">(null);
  const navigate = useNavigate();

  if (!job) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Job not found"
        description="It may have been deleted."
        action={<Button variant="outline" asChild><Link to="/jobs"><ArrowLeft /> Back to jobs</Link></Button>}
      />
    );
  }

  const shortlisted = evaluation?.results.filter((r) => r.status === "SHORTLISTED").length ?? 0;
  const strong = evaluation?.results.filter((r) => r.overallScore >= 75).length ?? 0;
  const canEvaluate = job.extractionStatus === "COMPLETED" && job.skillGroups.length > 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
        <Link to="/jobs"><ArrowLeft /> Jobs</Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2"><JobStatusPill status={job.status} /></div>
          <h1 className="text-2xl font-semibold tracking-tight break-words">{job.title}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{job.location ?? "No location"}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="size-3.5" />{formatExperienceRange(job.minExperience, job.maxExperience)}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />Created {formatDate(job.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link to="/jobs/$id/edit" params={{ id: job.id }}><Pencil /> Edit</Link></Button>
          {job.status === "ACTIVE" ? (
            <Button variant="outline" onClick={() => setConfirm("close")}><Archive /> Close</Button>
          ) : (
            <Button variant="outline" onClick={() => activateJob(job)}><Play /> Activate</Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setConfirm("delete")} aria-label="Delete job" className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
          <Button asChild disabled={!canEvaluate}>
            <Link to="/jobs/$id/matches" params={{ id: job.id }}><Sparkles /> Evaluate candidates</Link>
          </Button>
        </div>
      </div>

      {job.extractionStatus === "FAILED" && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex-1 text-sm">
            <p className="font-medium">Requirement extraction failed</p>
            <p className="text-muted-foreground">{job.extractionError}</p>
          </div>
          <Button size="sm" variant="outline" asChild><Link to="/jobs/$id/edit" params={{ id: job.id }}>Fix & retry</Link></Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Candidate pool" value={poolSize} icon={Users} hint="Available to evaluate" />
        <StatCard label="Evaluated" value={evaluation?.results.length ?? 0} hint={evaluation ? `Last run ${formatRelative(evaluation.evaluatedAt)}` : "Not evaluated yet"} />
        <StatCard label="Strong matches" value={strong} hint="Score 75+" />
        <StatCard label="Shortlisted" value={shortlisted} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          <SectionCard title="Description">
            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/80">{job.description}</p>
          </SectionCard>
          <SectionCard title="Responsibilities">
            {job.jobResponsibility.length === 0 ? (
              <p className="text-sm text-muted-foreground">No responsibilities listed.</p>
            ) : (
              <ul className="space-y-2">
                {job.jobResponsibility.map((r, i) => (
                  <li key={i} className="flex gap-2.5 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{r}</li>
                ))}
              </ul>
            )}
          </SectionCard>
          <SkillGroupsDisplay job={job} />
        </div>
        <aside className="space-y-6">
          <EducationRequirementDisplay job={job} />
          <SectionCard title="Candidate pool">
            <p className="text-sm text-muted-foreground">
              {evaluation
                ? `${evaluation.results.length} of ${poolSize} candidates evaluated ${formatRelative(evaluation.evaluatedAt)}.`
                : `${poolSize} candidates in your pool are ready to be evaluated against this job.`}
            </p>
            <Button className="mt-4 w-full" variant="outline" asChild disabled={!canEvaluate}>
              <Link to="/jobs/$id/matches" params={{ id: job.id }}><Sparkles /> {evaluation ? "View matching results" : "Evaluate candidates"}</Link>
            </Button>
          </SectionCard>
        </aside>
      </div>

      <JobConfirmDialogs job={job} confirm={confirm} onChange={setConfirm} afterDelete={() => navigate({ to: "/jobs" })} />
    </div>
  );
}

export function SkillGroupsDisplay({ job }: { job: Job }) {
  return (
    <SectionCard title="Skill requirements" description="ALL = every skill required · ANY = at least one · PREFERRED = nice to have">
      {job.skillGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skill groups yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {job.skillGroups.map((g) => (
            <div key={g.id} className={g.requirementType === "PREFERRED" ? "rounded-lg border border-dashed p-4" : "rounded-lg border p-4"}>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{g.category}</p>
                <RequirementTypeBadge type={g.requirementType} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{SKILL_GROUP_TYPE_INFO[g.requirementType].description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.skills.map((s) => <span key={s.id} className="rounded-md bg-muted px-2 py-0.5 text-xs">{s.name}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export function EducationRequirementDisplay({ job }: { job: Job }) {
  const er = job.educationRequirement;
  return (
    <SectionCard title="Education requirement">
      {!er ? (
        <p className="text-sm text-muted-foreground">No education requirement.</p>
      ) : (
        <div className="space-y-4 text-sm">
          <dl className="grid grid-cols-2 gap-3">
            <div><dt className="text-xs text-muted-foreground">Minimum level</dt><dd className="font-medium">{er.minEducationLevel ? EDUCATION_LEVEL_LABEL[er.minEducationLevel] : "Any"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Mandatory</dt><dd className="font-medium">{er.isMandatory ? "Yes" : "No"}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-muted-foreground">Related degrees</dt><dd className="font-medium">{er.relatedDegreesAllowed ? `Allowed${er.relatedDegreeFieldsOfStudy.length ? ` · ${er.relatedDegreeFieldsOfStudy.join(", ")}` : ""}` : "Not allowed"}</dd></div>
          </dl>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Accepted degrees</p>
            {er.acceptedDegrees.length === 0 && <p className="text-muted-foreground">Any degree</p>}
            {er.acceptedDegrees.map((d) => (
              <div key={d.id} className="rounded-lg border p-3">
                <p className="flex items-center gap-2 font-medium"><GraduationCap className="size-4 text-muted-foreground" />{d.degreeName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.acceptedFieldOfStudy.length ? d.acceptedFieldOfStudy.join(", ") : "Any field"}
                  {" · "}
                  {d.isFieldOfStudyMandatory ? "field required" : "field flexible"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
