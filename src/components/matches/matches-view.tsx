import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookmarkCheck,
  Briefcase,
  Eye,
  Flag,
  Info,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState, InitialsAvatar, PageHeader, StatCard } from "@/components/shared/primitives";
import { EvaluationStatusPill, JobStatusPill, ScoreBar, ScoreRing } from "@/components/shared/status";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { talentActions, useTalentStore } from "@/lib/store";
import { matchTier, type MatchTier } from "@/lib/matching";
import { formatDate, formatRelative } from "@/lib/talent-utils";
import type { Candidate, EvaluationStatus, MatchResult } from "@/lib/types";
import { EvaluationSheet, setMatchStatus } from "./evaluation-sheet";

type SortKey = "overallScore" | "skillsScore" | "experienceScore" | "roleAlignmentScore" | "educationScore" | "locationScore";
const SORT_LABEL: Record<SortKey, string> = {
  overallScore: "Overall score",
  skillsScore: "Skills",
  experienceScore: "Experience",
  roleAlignmentScore: "Role alignment",
  educationScore: "Education",
  locationScore: "Location",
};
const PAGE_SIZE = 10;

export function MatchesView({ jobId }: { jobId: string }) {
  const job = useTalentStore((s) => s.jobs.find((j) => j.id === jobId));
  const evaluation = useTalentStore((s) => s.evaluations[jobId]);
  const candidates = useTalentStore((s) => s.candidates);
  const [running, setRunning] = useState(false);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<MatchTier | "all">("all");
  const [status, setStatus] = useState<EvaluationStatus | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("overallScore");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const byId = useMemo(() => new Map(candidates.map((c) => [c.id, c])), [candidates]);

  const ranked = useMemo(() => {
    const results = evaluation?.results ?? [];
    return [...results].sort((a, b) => b.overallScore - a.overallScore).map((r, i) => ({ r, rank: i + 1 }));
  }, [evaluation]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked
      .filter(({ r }) => byId.has(r.candidateId))
      .filter(({ r }) => (tier === "all" ? true : matchTier(r.overallScore) === tier))
      .filter(({ r }) => (status === "ALL" ? true : r.status === status))
      .filter(({ r }) => {
        if (!q) return true;
        const c = byId.get(r.candidateId)!;
        return [c.name, c.email, ...c.skills].filter(Boolean).join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => b.r[sort] - a.r[sort] || a.rank - b.rank);
  }, [ranked, byId, tier, status, query, sort]);

  if (!job) {
    return <EmptyState icon={Briefcase} title="Job not found" action={<Button variant="outline" asChild><Link to="/jobs"><ArrowLeft /> Back to jobs</Link></Button>} />;
  }

  const run = async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 1600));
    talentActions.runEvaluation(job.id);
    setRunning(false);
    toast.success("Evaluation complete", { description: `${candidates.length} candidates evaluated for ${job.title}` });
  };

  const results = evaluation?.results ?? [];
  const strong = results.filter((r) => matchTier(r.overallScore) === "strong").length;
  const potential = results.filter((r) => matchTier(r.overallScore) === "potential").length;
  const review = results.filter((r) => r.status === "NEEDS_REVIEW").length;
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openResult = results.find((r) => r.candidateId === openId) ?? null;
  const canEvaluate = job.extractionStatus === "COMPLETED" && job.skillGroups.length > 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
        <Link to="/jobs/$id" params={{ id: job.id }}><ArrowLeft /> {job.title}</Link>
      </Button>
      <PageHeader
        eyebrow={<JobStatusPill status={job.status} />}
        title={`Matching results · ${job.title}`}
        description={
          evaluation
            ? `${results.length} candidates evaluated on ${formatDate(evaluation.evaluatedAt)} (${formatRelative(evaluation.evaluatedAt)})`
            : "This job hasn't been evaluated yet."
        }
        actions={
          evaluation && (
            <Button variant="outline" onClick={run} disabled={running || !canEvaluate}>
              {running ? <Loader2 className="animate-spin" /> : <RefreshCw />} Re-run evaluation
            </Button>
          )
        }
      />

      <div className="flex items-start gap-2.5 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-card">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          <span className="font-medium text-foreground">Illustrative mock evaluation.</span> Scores reflect how each resume aligns with this job's listed requirements. They aren't hiring probabilities or decisions, and a skill missing from a resume isn't proof the candidate lacks it.
        </p>
      </div>

      {!evaluation ? (
        running ? (
          <div className="flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center shadow-card">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium">Evaluating {candidates.length} candidates…</p>
            <p className="mt-1 text-xs text-muted-foreground">Comparing skills, experience, education, and location.</p>
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="Evaluate your candidate pool"
            description={canEvaluate ? `Compare all ${candidates.length} candidates against this job's requirements.` : "Add skill requirements to this job before evaluating candidates."}
            action={
              canEvaluate ? (
                <Button onClick={run}><Sparkles /> Run evaluation</Button>
              ) : (
                <Button variant="outline" asChild><Link to="/jobs/$id/edit" params={{ id: job.id }}>Edit requirements</Link></Button>
              )
            }
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Candidates evaluated" value={results.length} icon={Users} />
            <StatCard label="Strong matches" value={strong} icon={Target} hint="Overall 75+" />
            <StatCard label="Potential matches" value={potential} icon={TrendingUp} hint="Overall 55–74" />
            <StatCard label="Needs review" value={review} icon={Flag} hint="Marked by recruiter" />
          </div>

          <div className={running ? "pointer-events-none rounded-xl border bg-card opacity-60 shadow-card" : "rounded-xl border bg-card shadow-card"}>
            <div className="flex flex-col gap-3 border-b p-3 sm:p-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search candidates or skills" className="h-9 pl-9" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={tier} onValueChange={(v) => { setTier(v as MatchTier | "all"); setPage(1); }}>
                  <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All matches</SelectItem>
                    <SelectItem value="strong">Strong (75+)</SelectItem>
                    <SelectItem value="potential">Potential (55–74)</SelectItem>
                    <SelectItem value="low">Low (&lt;55)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={(v) => { setStatus(v as EvaluationStatus | "ALL"); setPage(1); }}>
                  <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="PENDING">Not reviewed</SelectItem>
                    <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                    <SelectItem value="NEEDS_REVIEW">Needs review</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger className="h-9 w-[170px]"><span className="text-muted-foreground">Sort:</span><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => <SelectItem key={k} value={k}>{SORT_LABEL[k]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="p-4"><EmptyState icon={Search} title="No candidates match these filters" className="border-0" /></div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 pl-4">Rank</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Overall</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Education</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageRows.map(({ r, rank }) => {
                        const c = byId.get(r.candidateId)!;
                        return (
                          <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpenId(c.id)}>
                            <TableCell className="pl-4 font-mono text-xs text-muted-foreground">#{rank}</TableCell>
                            <TableCell className="max-w-[14rem]">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <InitialsAvatar name={c.name} />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{c.name}</p>
                                  <p className="truncate text-xs text-muted-foreground">{c.location ?? "Location not found"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell><ScoreRing value={r.overallScore} size={38} stroke={3.5} /></TableCell>
                            <TableCell><ScoreBar value={r.skillsScore} /></TableCell>
                            <TableCell><ScoreBar value={r.experienceScore} /></TableCell>
                            <TableCell><ScoreBar value={r.roleAlignmentScore} /></TableCell>
                            <TableCell><ScoreBar value={r.educationScore} /></TableCell>
                            <TableCell><ScoreBar value={r.locationScore} /></TableCell>
                            <TableCell><EvaluationStatusPill status={r.status} /></TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}><MatchActions jobId={job.id} result={r} candidate={c} onOpen={() => setOpenId(c.id)} /></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <ul className="divide-y lg:hidden">
                  {pageRows.map(({ r, rank }) => {
                    const c = byId.get(r.candidateId)!;
                    return (
                      <li key={r.id} className="p-4" onClick={() => setOpenId(c.id)}>
                        <div className="flex items-center gap-3">
                          <span className="w-6 font-mono text-xs text-muted-foreground">#{rank}</span>
                          <ScoreRing value={r.overallScore} size={42} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{c.name}</p>
                            <EvaluationStatusPill status={r.status} />
                          </div>
                          <div onClick={(e) => e.stopPropagation()}><MatchActions jobId={job.id} result={r} candidate={c} onOpen={() => setOpenId(c.id)} /></div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
                          {([["Skills", r.skillsScore], ["Experience", r.experienceScore], ["Role", r.roleAlignmentScore], ["Education", r.educationScore], ["Location", r.locationScore]] as const).map(([l, v]) => (
                            <div key={l}><p className="text-muted-foreground">{l}</p><ScoreBar value={v} /></div>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <PaginationBar page={page} pageSize={PAGE_SIZE} total={rows.length} onPageChange={setPage} />
              </>
            )}
          </div>
        </>
      )}

      <EvaluationSheet open={!!openResult} onOpenChange={(o) => !o && setOpenId(null)} result={openResult} candidate={openResult ? byId.get(openResult.candidateId) ?? null : null} />
    </div>
  );
}

function MatchActions({ jobId, result, candidate, onOpen }: { jobId: string; result: MatchResult; candidate: Candidate; onOpen: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Candidate actions"><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={onOpen}><Eye /> View evaluation</DropdownMenuItem>
        <DropdownMenuItem onSelect={onOpen}><Info /> Add notes</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={result.status === "SHORTLISTED"} onSelect={() => setMatchStatus(jobId, candidate, "SHORTLISTED")}><BookmarkCheck /> Shortlist</DropdownMenuItem>
        <DropdownMenuItem disabled={result.status === "NEEDS_REVIEW"} onSelect={() => setMatchStatus(jobId, candidate, "NEEDS_REVIEW")}><Flag /> Mark for review</DropdownMenuItem>
        <DropdownMenuItem disabled={result.status === "REJECTED"} onSelect={() => setMatchStatus(jobId, candidate, "REJECTED")} className="text-destructive focus:text-destructive"><XCircle /> Reject</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
