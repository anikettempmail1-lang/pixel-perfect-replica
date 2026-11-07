import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Archive, Briefcase, CircleCheck, FilePen, GraduationCap, MapPin, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, PageHeader, StatCard } from "@/components/shared/primitives";
import { ExtractionStatusPill, JobStatusPill } from "@/components/shared/status";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { useTalentStore } from "@/lib/store";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { EDUCATION_LEVEL_LABEL, formatDate, formatExperienceRange } from "@/lib/talent-utils";
import type { Job, JobStatus } from "@/lib/types";
import { JobActionsMenu } from "./job-actions";
import { RequirementTypeBadge } from "./skill-groups-editor";

const EXP_FILTERS = {
  any: { label: "Any experience", test: () => true },
  entry: { label: "Entry (0–2 yrs min)", test: (j: Job) => (j.minExperience ?? 0) <= 2 },
  mid: { label: "Mid (3–5 yrs min)", test: (j: Job) => (j.minExperience ?? 0) >= 3 && (j.minExperience ?? 0) <= 5 },
  senior: { label: "Senior (6+ yrs min)", test: (j: Job) => (j.minExperience ?? 0) >= 6 },
} as const;
type ExpFilter = keyof typeof EXP_FILTERS;
const PAGE_SIZE = 8;

export function JobsView() {
  const jobs = useTalentStore((s) => s.jobs);
  const loading = useMockLoading();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");
  const [locations, setLocations] = useState<string[]>([]);
  const [exp, setExp] = useState<ExpFilter>("any");
  const [page, setPage] = useState(1);

  const allLocations = useMemo(() => [...new Set(jobs.map((j) => j.location).filter(Boolean) as string[])].sort(), [jobs]);
  const filtered = useMemo(
    () =>
      jobs
        .filter((j) => (status === "ALL" ? true : j.status === status))
        .filter((j) => (locations.length ? locations.includes(j.location ?? "") : true))
        .filter((j) => EXP_FILTERS[exp].test(j))
        .filter((j) => j.title.toLowerCase().includes(query.trim().toLowerCase()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [jobs, status, locations, exp, query],
  );
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = query || status !== "ALL" || locations.length || exp !== "any";
  const reset = () => {
    setQuery("");
    setStatus("ALL");
    setLocations([]);
    setExp("any");
    setPage(1);
  };

  const count = (s: JobStatus) => jobs.filter((j) => j.status === s).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Job descriptions with structured, reviewable requirements."
        actions={
          <Button asChild>
            <Link to="/jobs/new"><Plus /> Create job</Link>
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total jobs" value={jobs.length} icon={Briefcase} />
        <StatCard label="Active" value={count("ACTIVE")} icon={CircleCheck} />
        <StatCard label="Draft" value={count("DRAFT")} icon={FilePen} />
        <StatCard label="Closed" value={count("CLOSED")} icon={Archive} />
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <div className="flex flex-col gap-3 border-b p-3 sm:p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search by job title" className="h-9 pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onValueChange={(v) => { setStatus(v as JobStatus | "ALL"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <MultiSelectFilter label="Location" options={allLocations} value={locations} onChange={(v) => { setLocations(v); setPage(1); }} />
            <Select value={exp} onValueChange={(v) => { setExp(v as ExpFilter); setPage(1); }}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(EXP_FILTERS).map(([k, f]) => <SelectItem key={k} value={k}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters ? <Button variant="ghost" size="sm" onClick={reset}><X /> Reset</Button> : null}
          </div>
        </div>

        {loading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-48" /><Skeleton className="h-3 w-28" /></div>
                <Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4">
            {jobs.length === 0 ? (
              <EmptyState icon={Briefcase} title="No jobs yet" description="Create your first job to start evaluating candidates." action={<Button asChild><Link to="/jobs/new"><Plus /> Create job</Link></Button>} className="border-0" />
            ) : (
              <EmptyState icon={Search} title="No jobs match these filters" action={<Button variant="outline" onClick={reset}>Clear filters</Button>} className="border-0" />
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">Job</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Skill requirements</TableHead>
                    <TableHead className="hidden lg:table-cell">Education</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((j) => (
                    <TableRow key={j.id} className="cursor-pointer" onClick={() => navigate({ to: "/jobs/$id", params: { id: j.id } })}>
                      <TableCell className="max-w-[18rem] pl-4">
                        <p className="truncate text-sm font-medium">{j.title}</p>
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="size-3 shrink-0" />{j.location ?? "No location"}</p>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{formatExperienceRange(j.minExperience, j.maxExperience)}</TableCell>
                      <TableCell className="max-w-[16rem]"><SkillSummary job={j} /></TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell"><EducationSummary job={j} /></TableCell>
                      <TableCell><JobStatusPill status={j.status} /></TableCell>
                      <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground xl:table-cell">{formatDate(j.createdAt)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}><JobActionsMenu job={j} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="divide-y md:hidden">
              {pageRows.map((j) => (
                <li key={j.id} className="flex items-start gap-3 p-4" onClick={() => navigate({ to: "/jobs/$id", params: { id: j.id } })}>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="truncate font-medium">{j.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{j.location ?? "No location"} · {formatExperienceRange(j.minExperience, j.maxExperience)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2"><JobStatusPill status={j.status} /><SkillSummary job={j} /></div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}><JobActionsMenu job={j} /></div>
                </li>
              ))}
            </ul>
            <PaginationBar page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

export function SkillSummary({ job }: { job: Job }) {
  if (job.extractionStatus !== "COMPLETED" || job.skillGroups.length === 0) return <ExtractionStatusPill status={job.extractionStatus === "COMPLETED" ? "PENDING" : job.extractionStatus} />;
  const total = job.skillGroups.reduce((s, g) => s + g.skills.length, 0);
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {job.skillGroups.slice(0, 3).map((g) => (
        <span key={g.id} className="inline-flex max-w-[9rem] items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs" title={`${g.category}: ${g.skills.map((s) => s.name).join(", ")}`}>
          <RequirementTypeBadge type={g.requirementType} />
          <span className="truncate">{g.skills.length}</span>
        </span>
      ))}
      <span className="text-xs text-muted-foreground">{total} skills</span>
    </div>
  );
}

function EducationSummary({ job }: { job: Job }) {
  const er = job.educationRequirement;
  if (!er) return <span className="text-xs">None</span>;
  return (
    <span className="flex items-center gap-1.5 text-xs">
      <GraduationCap className="size-3.5 shrink-0" />
      {er.minEducationLevel ? EDUCATION_LEVEL_LABEL[er.minEducationLevel] : "Any level"}
      {er.isMandatory && <span className="rounded bg-muted px-1 text-[10px] uppercase">Req.</span>}
    </span>
  );
}
