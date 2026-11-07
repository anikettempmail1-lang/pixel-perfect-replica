import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  FileText,
  Flag,
  GraduationCap,
  MapPin,
  Quote,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InitialsAvatar } from "@/components/shared/primitives";
import { EvaluationStatusPill, ScoreBar, ScoreRing } from "@/components/shared/status";
import { RequirementTypeBadge } from "@/components/jobs/skill-groups-editor";
import { talentActions } from "@/lib/store";
import { MATCH_TIER_LABEL, matchTier } from "@/lib/matching";
import { formatExperience, totalExperienceMonths } from "@/lib/talent-utils";
import type { Candidate, EvaluationStatus, MatchResult } from "@/lib/types";

export function setMatchStatus(jobId: string, candidate: Candidate, status: EvaluationStatus) {
  talentActions.updateMatch(jobId, candidate.id, { status });
  const msg = { SHORTLISTED: "shortlisted", REJECTED: "rejected", NEEDS_REVIEW: "marked for review", PENDING: "reset" }[status];
  toast.success(`${candidate.name} ${msg}`);
}

export function EvaluationSheet({
  open,
  onOpenChange,
  result,
  candidate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  result: MatchResult | null;
  candidate: Candidate | null;
}) {
  const [notes, setNotes] = useState("");
  useEffect(() => setNotes(result?.notes ?? ""), [result?.id, result?.notes]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        {result && candidate && (
          <>
            <SheetHeader className="border-b p-5 text-left">
              <div className="flex items-start gap-3 pr-6">
                <InitialsAvatar name={candidate.name} className="size-11 text-sm" />
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate">{candidate.name}</SheetTitle>
                  <SheetDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {candidate.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{candidate.location}</span>}
                    <span>{formatExperience(totalExperienceMonths(candidate.experience))} derived</span>
                  </SheetDescription>
                  <div className="mt-2"><EvaluationStatusPill status={result.status} /></div>
                </div>
                <ScoreRing value={result.overallScore} size={56} stroke={5} />
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
              <p className="rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
                Illustrative evaluation. Scores summarise how the resume aligns with this job's listed requirements — they are not hiring probabilities or decisions.
              </p>

              <Section title="Score breakdown">
                <div className="space-y-2.5">
                  {[
                    ["Skills", result.skillsScore, "40%"],
                    ["Experience", result.experienceScore, "20%"],
                    ["Role alignment", result.roleAlignmentScore, "20%"],
                    ["Education", result.educationScore, "10%"],
                    ["Location", result.locationScore, "10%"],
                  ].map(([l, v, w]) => (
                    <div key={l as string} className="flex items-center gap-3 text-sm">
                      <span className="w-28 shrink-0 text-muted-foreground">{l}</span>
                      <ScoreBar value={v as number} className="flex-1" />
                      <span className="w-8 text-right text-[11px] text-muted-foreground">{w}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{MATCH_TIER_LABEL[matchTier(result.overallScore)]} · weights shown on the right</p>
              </Section>

              <Section title="Matching skills" icon={CheckCircle2} iconClass="text-success">
                {result.matchingSkills.length === 0 ? (
                  <Muted>No listed skills found in the resume.</Muted>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchingSkills.map((m) => (
                      <span key={`${m.groupCategory}-${m.skill}`} className="inline-flex items-center gap-1.5 rounded-md border bg-success-soft/60 px-2 py-1 text-xs" title={`Found in: ${m.foundIn.join(", ")}`}>
                        <RequirementTypeBadge type={m.requirementType} />
                        {m.skill}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Required skills not found in resume" icon={CircleDashed} iconClass="text-warning">
                {result.missingRequiredSkills.length === 0 ? (
                  <Muted>All required skill groups are satisfied.</Muted>
                ) : (
                  <ul className="space-y-2">
                    {result.missingRequiredSkills.map((m) => (
                      <li key={m.groupId} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <RequirementTypeBadge type={m.requirementType} />
                          <span className="font-medium">{m.category}</span>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {m.requirementType === "ANY" ? "None of: " : "Not found: "}
                          {m.missingSkills.join(", ")}
                        </p>
                      </li>
                    ))}
                    <li className="text-xs text-muted-foreground">Not mentioned doesn't mean not known — verify during screening.</li>
                  </ul>
                )}
              </Section>

              <Section title="Preferred skills">
                {result.preferredSkillsFound.length + result.preferredSkillsNotFound.length === 0 ? (
                  <Muted>This job has no preferred skills.</Muted>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {result.preferredSkillsFound.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-1 text-xs text-primary-soft-foreground"><CheckCircle2 className="size-3" />{s}</span>
                    ))}
                    {result.preferredSkillsNotFound.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-xs text-muted-foreground">{s}</span>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Relevant experience" icon={Briefcase}>
                {result.relevantExperience.length === 0 ? (
                  <Muted>No roles closely matching this job title were found.</Muted>
                ) : (
                  <ul className="space-y-1.5">
                    {result.relevantExperience.map((r) => (
                      <li key={r.experienceId} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate">{r.position} · <span className="text-muted-foreground">{r.company}</span></span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatExperience(r.months)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Education assessment" icon={GraduationCap}>
                <p className="text-sm">{result.educationAssessment.note}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <Check label="Meets minimum level" value={result.educationAssessment.meetsMinimumLevel} />
                  <Check label="Accepted degree" value={result.educationAssessment.matchedDegree ? true : result.educationAssessment.meetsMinimumLevel === null ? null : false} />
                  <Check label="Field of study" value={result.educationAssessment.fieldOfStudyMatch} />
                </div>
              </Section>

              <Section title="Resume evidence" icon={Quote}>
                {result.resumeEvidence.length === 0 ? (
                  <Muted>No direct evidence excerpts found.</Muted>
                ) : (
                  <ul className="space-y-2">
                    {result.resumeEvidence.map((e, i) => (
                      <li key={i} className="rounded-lg border-l-2 border-primary/40 bg-surface px-3 py-2">
                        <p className="text-xs font-medium text-muted-foreground">{e.label}</p>
                        <p className="mt-0.5 text-sm leading-relaxed">{e.excerpt}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Areas requiring review" icon={AlertTriangle} iconClass="text-warning">
                {result.reviewFlags.length === 0 ? (
                  <Muted>Nothing flagged.</Muted>
                ) : (
                  <ul className="space-y-1.5">
                    {result.reviewFlags.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="mt-2 size-1 shrink-0 rounded-full bg-warning" />{f}</li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Recruiter notes" icon={FileText}>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add context for your team…" maxLength={2000} />
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={notes === result.notes}
                    onClick={() => {
                      talentActions.updateMatch(result.jobId, candidate.id, { notes: notes.trim() });
                      toast.success("Notes saved");
                    }}
                  >
                    Save notes
                  </Button>
                </div>
              </Section>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t bg-surface p-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/candidates/$id" params={{ id: candidate.id }}><ExternalLink /> Profile</Link>
              </Button>
              <div className="ml-auto flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setMatchStatus(result.jobId, candidate, "REJECTED")} disabled={result.status === "REJECTED"}><XCircle /> Reject</Button>
                <Button size="sm" variant="outline" onClick={() => setMatchStatus(result.jobId, candidate, "NEEDS_REVIEW")} disabled={result.status === "NEEDS_REVIEW"}><Flag /> Review</Button>
                <Button size="sm" onClick={() => setMatchStatus(result.jobId, candidate, "SHORTLISTED")} disabled={result.status === "SHORTLISTED"}><BookmarkCheck /> Shortlist</Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, icon: Icon, iconClass, children }: { title: string; icon?: typeof Quote | undefined; iconClass?: string | undefined; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
        {Icon && <Icon className={iconClass ? `size-4 ${iconClass}` : "size-4 text-muted-foreground"} />}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function Check({ label, value }: { label: string; value: boolean | null }) {
  const cls = value === true ? "bg-success-soft text-success" : value === false ? "bg-warning-soft text-warning-foreground" : "bg-muted text-muted-foreground";
  return <span className={`rounded-md px-2 py-0.5 ${cls}`}>{label}: {value === true ? "Yes" : value === false ? "No" : "Unknown"}</span>;
}
