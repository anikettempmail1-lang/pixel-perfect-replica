import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  Search,
  Upload,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, InitialsAvatar, PageHeader, SkillChips, StatCard } from "@/components/shared/primitives";
import { ResumeStatusPill } from "@/components/shared/status";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { useUploadDialog } from "@/components/app/upload-context";
import { useTalentStore } from "@/lib/store";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate, formatExperience, totalExperienceMonths } from "@/lib/talent-utils";
import type { Candidate, Resume, ResumeStatus } from "@/lib/types";

export interface CandidateRow {
  resume: Resume;
  candidate: Candidate | null;
  experienceMonths: number | null;
}

const EXPERIENCE_BUCKETS = {
  any: { label: "Any experience", test: () => true },
  "0-2": { label: "0–2 years", test: (m: number) => m < 24 },
  "2-5": { label: "2–5 years", test: (m: number) => m >= 24 && m < 60 },
  "5-8": { label: "5–8 years", test: (m: number) => m >= 60 && m < 96 },
  "8+": { label: "8+ years", test: (m: number) => m >= 96 },
} as const;
type ExpBucket = keyof typeof EXPERIENCE_BUCKETS;
type SortKey = "recent" | "name" | "experience";

const PAGE_SIZE = 8;

export function downloadResumeMock(resume: Resume) {
  toast.success(`Downloading ${resume.fileName}`, { description: "Mock download — connect storage to enable." });
}

export function CandidatesView() {
  const resumes = useTalentStore((s) => s.resumes);
  const candidates = useTalentStore((s) => s.candidates);
  const loading = useMockLoading();
  const { openUpload } = useUploadDialog();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [status, setStatus] = useState<ResumeStatus | "ALL">("ALL");
  const [exp, setExp] = useState<ExpBucket>("any");
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo<CandidateRow[]>(
    () =>
      resumes.map((r) => {
        const c = r.candidateId ? candidates.find((x) => x.id === r.candidateId) ?? null : null;
        return { resume: r, candidate: c, experienceMonths: c ? totalExperienceMonths(c.experience) : null };
      }),
    [resumes, candidates],
  );

  const allLocations = useMemo(() => [...new Set(candidates.map((c) => c.location).filter(Boolean) as string[])].sort(), [candidates]);
  const allSkills = useMemo(() => [...new Set(candidates.flatMap((c) => c.skills))].sort((a, b) => a.localeCompare(b)), [candidates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(({ resume, candidate, experienceMonths }) => {
      if (status !== "ALL" && resume.status !== status) return false;
      const needsCandidate = locations.length > 0 || skills.length > 0 || exp !== "any";
      if (needsCandidate && !candidate) return false;
      if (locations.length && !locations.includes(candidate!.location ?? "")) return false;
      if (skills.length && !skills.every((s) => candidate!.skills.includes(s))) return false;
      if (exp !== "any" && !EXPERIENCE_BUCKETS[exp].test(experienceMonths ?? 0)) return false;
      if (q) {
        const hay = [candidate?.name, candidate?.email, resume.fileName, ...(candidate?.skills ?? [])].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "name") return (a.candidate?.name ?? a.resume.fileName).localeCompare(b.candidate?.name ?? b.resume.fileName);
      if (sort === "experience") return (b.experienceMonths ?? -1) - (a.experienceMonths ?? -1);
      return new Date(b.resume.createdAt).getTime() - new Date(a.resume.createdAt).getTime();
    });
  }, [rows, query, status, locations, skills, exp, sort]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = query || locations.length || skills.length || status !== "ALL" || exp !== "any";
  const resetFilters = () => {
    setQuery("");
    setLocations([]);
    setSkills([]);
    setStatus("ALL");
    setExp("any");
    setPage(1);
  };

  const stats = {
    total: resumes.length,
    completed: resumes.filter((r) => r.status === "COMPLETED").length,
    processing: resumes.filter((r) => r.status === "PROCESSING" || r.status === "PENDING").length,
    failed: resumes.filter((r) => r.status === "FAILED").length,
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.has(r.resume.id));
  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      pageRows.forEach((r) => (allOnPage ? next.delete(r.resume.id) : next.add(r.resume.id)));
      return next;
    });

  const openRow = (row: CandidateRow) => {
    if (row.candidate) navigate({ to: "/candidates/$id", params: { id: row.candidate.id } });
    else if (row.resume.status === "FAILED") toast.error(row.resume.errorMessage ?? "Processing failed");
    else toast.info("This resume is still being processed.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidates"
        description="Your reusable candidate pool, built from uploaded resumes."
        actions={
          <Button onClick={openUpload}>
            <Upload /> Upload resumes
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total records" value={stats.total} icon={FileText} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} />
        <StatCard label="Processing" value={stats.processing} icon={Loader2} hint="Pending + processing" />
        <StatCard label="Failed" value={stats.failed} icon={AlertTriangle} />
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        {/* toolbar */}
        <div className="flex flex-col gap-3 border-b p-3 sm:p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, or skill"
              className="h-9 pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MultiSelectFilter label="Location" options={allLocations} value={locations} onChange={(v) => { setLocations(v); setPage(1); }} />
            <MultiSelectFilter label="Skills" options={allSkills} value={skills} onChange={(v) => { setSkills(v); setPage(1); }} />
            <Select value={exp} onValueChange={(v) => { setExp(v as ExpBucket); setPage(1); }}>
              <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(EXPERIENCE_BUCKETS).map(([k, b]) => (
                  <SelectItem key={k} value={k}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v as ResumeStatus | "ALL"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-[160px]">
                <ArrowUpDown className="size-3.5 opacity-60" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently added</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
                <SelectItem value="experience">Most experience</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X /> Reset
              </Button>
            ) : null}
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-primary-soft/50 px-4 py-2 text-sm">
            <span className="font-medium text-primary-soft-foreground">{selected.size} selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success(`Preparing ${selected.size} resumes for download (mock)`)}>
                <Download /> Download
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="p-4">
            {rows.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No candidates yet"
                description="Upload a batch of PDF resumes to start building your candidate pool."
                action={<Button onClick={openUpload}><Upload /> Upload resumes</Button>}
                className="border-0"
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No candidates match these filters"
                description="Try a different search term or clear some filters."
                action={<Button variant="outline" onClick={resetFilters}>Clear filters</Button>}
                className="border-0"
              />
            )}
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 pl-4">
                      <Checkbox checked={allOnPage} onCheckedChange={togglePage} aria-label="Select page" />
                    </TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead className="hidden xl:table-cell">Location</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead className="hidden lg:table-cell">Added</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((row) => (
                    <TableRow key={row.resume.id} className="cursor-pointer" onClick={() => openRow(row)} data-state={selected.has(row.resume.id) ? "selected" : undefined}>
                      <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.has(row.resume.id)} onCheckedChange={() => toggle(row.resume.id)} aria-label="Select row" />
                      </TableCell>
                      <TableCell className="max-w-[16rem]">
                        <CandidateCell row={row} />
                      </TableCell>
                      <TableCell className="hidden max-w-[10rem] truncate text-sm text-muted-foreground xl:table-cell">{row.candidate?.location ?? "—"}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{row.candidate ? formatExperience(row.experienceMonths) : "—"}</TableCell>
                      <TableCell className="max-w-[15rem]">{row.candidate ? <SkillChips skills={row.candidate.skills} max={2} highlight={(s) => skills.includes(s)} /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                      <TableCell><ResumeStatusPill status={row.resume.status} /></TableCell>
                      <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground lg:table-cell">{formatDate(row.resume.createdAt)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <RowActions row={row} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* mobile cards */}
            <ul className="divide-y md:hidden">
              {pageRows.map((row) => (
                <li key={row.resume.id} className="flex items-start gap-3 p-4" onClick={() => openRow(row)}>
                  <div className="min-w-0 flex-1 space-y-2">
                    <CandidateCell row={row} />
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <ResumeStatusPill status={row.resume.status} />
                      {row.candidate && <span>{formatExperience(row.experienceMonths)}</span>}
                      {row.candidate?.location && <span className="truncate">· {row.candidate.location}</span>}
                    </div>
                    {row.candidate && <SkillChips skills={row.candidate.skills} max={3} />}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <RowActions row={row} />
                  </div>
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

function CandidateCell({ row }: { row: CandidateRow }) {
  if (!row.candidate) {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
          <FileText className="size-3.5 text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground" title={row.resume.fileName}>{row.resume.fileName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.resume.status === "FAILED" ? row.resume.errorMessage : "Awaiting extraction"}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-3">
      <InitialsAvatar name={row.candidate.name} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{row.candidate.name}</p>
        <p className="truncate text-xs text-muted-foreground">{row.candidate.email ?? "No email found"}</p>
      </div>
    </div>
  );
}

function RowActions({ row }: { row: CandidateRow }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {row.candidate && (
          <DropdownMenuItem asChild>
            <Link to="/candidates/$id" params={{ id: row.candidate.id }}>
              <Eye /> View profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => downloadResumeMock(row.resume)}>
          <Download /> Download resume
        </DropdownMenuItem>
        {row.resume.status === "FAILED" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => toast.info("Reprocessing queued (mock)")}>
              <Loader2 /> Retry processing
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="hidden h-5 w-24 md:block" />
          <Skeleton className="hidden h-5 w-20 md:block" />
        </div>
      ))}
    </div>
  );
}
