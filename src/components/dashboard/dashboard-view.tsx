import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { EmptyState, InitialsAvatar, SectionCard, SkillChips, StatCard } from "@/components/shared/primitives";
import { JobStatusPill } from "@/components/shared/status";
import { SkillSummary } from "@/components/jobs/jobs-view";
import { useUploadDialog } from "@/components/app/upload-context";
import { useTalentStore, type ActivityType } from "@/lib/store";
import { MOCK_RECRUITER_PROFILE } from "@/lib/mock-data";
import { MOCK_NOW, formatExperience, formatRelative, totalExperienceMonths } from "@/lib/talent-utils";

const ACTIVITY_ICON: Record<ActivityType, typeof FileText> = { resume: FileText, candidate: UserRound, job: Briefcase, evaluation: Sparkles };

const weeklyConfig = { count: { label: "Candidates added", color: "var(--chart-1)" } } satisfies ChartConfig;
const skillsConfig = { count: { label: "Candidates", color: "var(--chart-2)" } } satisfies ChartConfig;

export function DashboardView() {
  const candidates = useTalentStore((s) => s.candidates);
  const resumes = useTalentStore((s) => s.resumes);
  const jobs = useTalentStore((s) => s.jobs);
  const evaluations = useTalentStore((s) => s.evaluations);
  const activity = useTalentStore((s) => s.activity);
  const { openUpload } = useUploadDialog();

  const evaluatedCandidates = useMemo(() => new Set(Object.values(evaluations).flatMap((e) => e.results.map((r) => r.candidateId))).size, [evaluations]);
  const processing = resumes.filter((r) => r.status === "PROCESSING" || r.status === "PENDING").length;
  const activeJobs = jobs.filter((j) => j.status === "ACTIVE").length;

  const weekly = useMemo(() => {
    const weeks = Array.from({ length: 6 }, (_, i) => {
      const end = new Date(MOCK_NOW.getTime() - (5 - i) * 7 * 864e5);
      return { end, label: `${end.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${end.getUTCDate()}`, count: 0 };
    });
    for (const c of candidates) {
      const t = new Date(c.createdAt).getTime();
      const w = weeks.find((wk) => t <= wk.end.getTime() + 864e5 && t > wk.end.getTime() - 6 * 864e5);
      if (w) w.count += 1;
    }
    return weeks.map(({ label, count }) => ({ label, count }));
  }, [candidates]);

  const topSkills = useMemo(() => {
    const m = new Map<string, number>();
    candidates.forEach((c) => c.skills.forEach((s) => m.set(s, (m.get(s) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([skill, count]) => ({ skill, count }));
  }, [candidates]);

  const recentCandidates = [...candidates].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentJobs = [...jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const onboarding = [
    { done: candidates.length > 0, label: "Upload your first resumes" },
    { done: jobs.length > 0, label: "Create a job from a description" },
    { done: Object.keys(evaluations).length > 0, label: "Evaluate candidates against a job" },
  ];
  const showOnboarding = onboarding.some((o) => !o.done);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm text-muted-foreground">{MOCK_RECRUITER_PROFILE.company}</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Welcome back, {MOCK_RECRUITER_PROFILE.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {processing > 0 ? `${processing} resume${processing === 1 ? " is" : "s are"} being processed.` : "All resumes are processed."} {activeJobs} active job{activeJobs === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openUpload}><Upload /> Upload resumes</Button>
          <Button asChild><Link to="/jobs/new"><Plus /> Create job</Link></Button>
        </div>
      </div>

      {showOnboarding && (
        <SectionCard title="Get started" description="Three steps to your first evaluation">
          <ol className="grid gap-3 sm:grid-cols-3">
            {onboarding.map((o, i) => (
              <li key={o.label} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                {o.done ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-muted-foreground" />}
                <span className={o.done ? "text-muted-foreground line-through" : ""}>{i + 1}. {o.label}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total candidates" value={candidates.length} icon={Users} />
        <StatCard label="Active jobs" value={activeJobs} icon={Briefcase} hint={`${jobs.length} total`} />
        <StatCard label="Resumes processing" value={processing} icon={Loader2} />
        <StatCard label="Candidates evaluated" value={evaluatedCandidates} icon={Sparkles} hint={`Across ${Object.keys(evaluations).length} jobs`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Candidates added" description="Last 6 weeks">
          <ChartContainer config={weeklyConfig} className="h-56 w-full">
            <BarChart data={weekly} margin={{ left: -20, right: 4, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </SectionCard>
        <SectionCard title="Top skills in your pool" description="Number of candidates listing each skill">
          {topSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills yet.</p>
          ) : (
            <ChartContainer config={skillsConfig} className="h-56 w-full">
              <BarChart data={topSkills} layout="vertical" margin={{ left: 10, right: 8 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="skill" tickLine={false} axisLine={false} width={84} fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <SectionCard
          title="Recently added candidates"
          action={<Button variant="ghost" size="sm" asChild><Link to="/candidates">View all <ArrowRight /></Link></Button>}
          bodyClassName="p-0"
        >
          {recentCandidates.length === 0 ? (
            <div className="p-5"><EmptyState icon={Users} title="No candidates yet" action={<Button size="sm" onClick={openUpload}><Upload /> Upload resumes</Button>} className="border-0" /></div>
          ) : (
            <ul className="divide-y">
              {recentCandidates.map((c) => (
                <li key={c.id}>
                  <Link to="/candidates/$id" params={{ id: c.id }} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/50">
                    <InitialsAvatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{formatExperience(totalExperienceMonths(c.experience))} · {c.location ?? "—"}</p>
                    </div>
                    <SkillChips skills={c.skills} max={2} className="hidden justify-end sm:flex" />
                    <span className="hidden shrink-0 text-xs text-muted-foreground md:block">{formatRelative(c.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent activity" bodyClassName="p-0">
          <ul className="divide-y">
            {activity.slice(0, 7).map((a) => {
              const Icon = ACTIVITY_ICON[a.type];
              return (
                <li key={a.id} className="flex gap-3 px-5 py-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-muted"><Icon className="size-3.5 text-muted-foreground" /></span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{a.message}</p>
                    <p className="text-xs text-muted-foreground">{formatRelative(a.at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent jobs"
        action={<Button variant="ghost" size="sm" asChild><Link to="/jobs">View all <ArrowRight /></Link></Button>}
        bodyClassName="p-0"
      >
        {recentJobs.length === 0 ? (
          <div className="p-5"><EmptyState icon={Briefcase} title="No jobs yet" action={<Button size="sm" asChild><Link to="/jobs/new"><Plus /> Create job</Link></Button>} className="border-0" /></div>
        ) : (
          <ul className="grid divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
            {recentJobs.map((j) => (
              <li key={j.id} className="sm:border-r sm:last:border-r-0">
                <Link to="/jobs/$id" params={{ id: j.id }} className="block h-full space-y-3 p-5 hover:bg-accent/50">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium">{j.title}</p>
                    <JobStatusPill status={j.status} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{j.location ?? "No location"}</p>
                  <SkillSummary job={j} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
