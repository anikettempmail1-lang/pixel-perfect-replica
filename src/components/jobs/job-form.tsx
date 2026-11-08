import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  FileText,
  GraduationCap,
  ListChecks,
  Loader2,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, SectionCard } from "@/components/shared/primitives";
import { extractJobRequirements, SAMPLE_JOB_DESCRIPTION } from "@/lib/job-extraction";
import { talentActions } from "@/lib/store";
import type { Job, JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  activationProblems,
  applyExtraction,
  emptyJobForm,
  formToJob,
  jobFormSchema,
  jobToForm,
  type JobFormValues,
} from "./job-form-schema";
import { SkillGroupsEditor } from "./skill-groups-editor";
import { EducationEditor } from "./education-editor";

type Phase = "input" | "extracting" | "review" | "failed";

const EXTRACT_STEPS = ["Reading job description", "Identifying skills and grouping requirements", "Detecting experience and education rules", "Drafting responsibilities"];

export function JobForm({ job }: { job?: Job | undefined }) {
  const navigate = useNavigate();
  const editing = !!job;
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: job ? jobToForm(job) : emptyJobForm,
    mode: "onTouched",
  });
  const [phase, setPhase] = useState<Phase>(job && job.extractionStatus === "COMPLETED" ? "review" : job?.extractionStatus === "FAILED" ? "failed" : "input");
  const [extractError, setExtractError] = useState<string | null>(job?.extractionError ?? null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState<JobStatus | null>(null);

  useEffect(() => {
    if (phase !== "extracting") return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, EXTRACT_STEPS.length - 1)), 520);
    return () => clearInterval(t);
  }, [phase]);

  const runExtraction = async () => {
    const ok = await form.trigger(["title", "description", "location"]);
    if (!ok) return;
    const { title, description, location } = form.getValues();
    setPhase("extracting");
    setExtractError(null);
    try {
      const ex = await extractJobRequirements({ title, description, location });
      form.reset(applyExtraction(form.getValues(), ex), { keepDefaultValues: true });
      setPhase("review");
      toast.success("Requirements extracted", { description: `${ex.skillGroups.length} skill groups found. Review before saving.` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Extraction failed";
      setExtractError(msg);
      setPhase("failed");
      toast.error("Couldn't extract requirements", { description: msg });
    }
  };

  const save = (status: JobStatus) =>
    form.handleSubmit(
      async (values) => {
        if (status === "ACTIVE") {
          const problems = activationProblems(values);
          if (problems.length) {
            toast.error("This job isn't ready to activate", { description: problems.join(" ") });
            return;
          }
        }
        setSaving(status);
        await new Promise((r) => setTimeout(r, 500));
        // In edit mode "Save changes" keeps the job's current status.
        const nextStatus: JobStatus = editing && status === "DRAFT" ? job!.status : status;
        const next = formToJob(values, nextStatus, job);
        talentActions.saveJob(next);
        setSaving(null);
        toast.success(editing ? "Job updated" : status === "ACTIVE" ? "Job activated" : "Draft saved", { description: next.title });
        navigate({ to: "/jobs/$id", params: { id: next.id } });
      },
      () => toast.error("Please fix the highlighted fields"),
    )();

  const errors = form.formState.errors;
  const descLen = form.watch("description").length;

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
          {editing ? (
            <Link to="/jobs/$id" params={{ id: job!.id }}><ArrowLeft /> Back to job</Link>
          ) : (
            <Link to="/jobs"><ArrowLeft /> Jobs</Link>
          )}
        </Button>
        <PageHeader
          title={editing ? `Edit ${job!.title}` : "Create a job"}
          description={editing ? "Update job details and structured requirements." : "Paste a job description, extract requirements, then review before saving."}
        />

        <Stepper phase={phase} />

        <SectionCard title="Job information" description="These details are used to extract structured requirements.">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
              <Field label="Job title" error={errors.title?.message} htmlFor="title">
                <Input id="title" placeholder="e.g. Senior Frontend Engineer" {...form.register("title")} />
              </Field>
              <Field label="Location" htmlFor="location" error={errors.location?.message}>
                <Input id="location" placeholder="e.g. Bengaluru, India or Remote" {...form.register("location")} />
              </Field>
            </div>
            <Field
              label="Job description"
              htmlFor="description"
              error={errors.description?.message}
              hint={
                <span className="flex items-center gap-3">
                  <span className="tabular-nums">{descLen} chars</span>
                  {!editing && descLen === 0 && (
                    <button type="button" className="text-primary hover:underline" onClick={() => form.setValue("description", SAMPLE_JOB_DESCRIPTION, { shouldValidate: true })}>
                      Use sample description
                    </button>
                  )}
                </span>
              }
            >
              <Textarea id="description" rows={10} placeholder="Paste the full job description…" className="font-normal leading-relaxed" {...form.register("description")} />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={runExtraction} disabled={phase === "extracting"}>
                {phase === "extracting" ? <Loader2 className="animate-spin" /> : phase === "review" ? <RefreshCw /> : <Wand2 />}
                {phase === "review" ? "Re-extract requirements" : "Extract requirements"}
              </Button>
              {phase === "review" && <p className="text-xs text-muted-foreground">Re-extracting replaces your edits below.</p>}
            </div>
          </div>
        </SectionCard>

        {phase === "extracting" && <ExtractingState step={step} />}

        {phase === "failed" && (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive-soft p-5 sm:flex-row sm:items-center">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium">Extraction failed</p>
              <p className="text-sm text-muted-foreground">{extractError}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={runExtraction}><RefreshCw /> Retry</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPhase("review")}>Enter manually</Button>
            </div>
          </div>
        )}

        {phase === "review" && (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft/60 p-4 text-sm">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-primary-soft-foreground">Review everything below. Extracted requirements are suggestions — edit them to reflect what this role really needs.</p>
            </div>

            <SectionCard title="Experience" description="Location is edited in Job information above.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Minimum years" htmlFor="minExp" error={errors.minExperience?.message}>
                  <Input id="minExp" type="number" min={0} step={1} placeholder="Any" {...form.register("minExperience", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })} />
                </Field>
                <Field label="Maximum years" htmlFor="maxExp" error={errors.maxExperience?.message}>
                  <Input id="maxExp" type="number" min={0} step={1} placeholder="Any" {...form.register("maxExperience", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" />Responsibilities</span>}>
              <ResponsibilitiesEditor />
            </SectionCard>

            <SectionCard
              title={<span className="flex items-center gap-2"><ListChecks className="size-4 text-muted-foreground" />Skill requirements</span>}
              description="Groups of skills with their own requirement type."
            >
              <SkillGroupsEditor />
            </SectionCard>

            <SectionCard title={<span className="flex items-center gap-2"><GraduationCap className="size-4 text-muted-foreground" />Education requirement</span>}>
              <EducationEditor />
            </SectionCard>
          </>
        )}

        {/* sticky action bar */}
        <div className="sticky bottom-0 z-20 -mx-4 -mb-6 border-t bg-background/90 backdrop-blur-md sm:-mx-6 lg:-mx-8 lg:-mb-8">
          <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
              {phase === "review" ? "Draft saves anytime. Activation requires skill groups and responsibilities." : "Extract requirements to continue."}
            </p>
            <Button type="button" variant="outline" onClick={() => save("DRAFT")} disabled={!!saving || phase === "extracting"}>
              {saving === "DRAFT" ? <Loader2 className="animate-spin" /> : <Save />}
              {editing ? "Save changes" : "Save as draft"}
            </Button>
            <Button type="button" onClick={() => save("ACTIVE")} disabled={!!saving || phase !== "review"}>
              {saving === "ACTIVE" ? <Loader2 className="animate-spin" /> : <Rocket />}
              {editing && job!.status === "ACTIVE" ? "Save & keep active" : "Activate job"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string | undefined;
  error?: string | undefined;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ResponsibilitiesEditor() {
  const { control, register, formState } = useFormContext<JobFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "jobResponsibility", keyName: "_key" });
  return (
    <div className="space-y-2">
      {fields.length === 0 && <p className="text-sm text-muted-foreground">No responsibilities yet.</p>}
      {fields.map((f, i) => (
        <div key={f._key} className="flex items-start gap-2">
          <span className="mt-2.5 w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
          <div className="flex-1">
            <Input {...register(`jobResponsibility.${i}.value`)} aria-label={`Responsibility ${i + 1}`} />
            {formState.errors.jobResponsibility?.[i]?.value && <p className="mt-1 text-xs text-destructive">{formState.errors.jobResponsibility[i]!.value!.message}</p>}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove responsibility" className="text-muted-foreground hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
        <Plus /> Add responsibility
      </Button>
    </div>
  );
}

function Stepper({ phase }: { phase: Phase }) {
  const steps = ["Job information", "Extract requirements", "Review & save"];
  const current = phase === "input" ? 0 : phase === "extracting" || phase === "failed" ? 1 : 2;
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={cn(
              "grid size-6 place-items-center rounded-full border text-xs font-medium",
              i < current && "border-transparent bg-success text-success-foreground",
              i === current && "border-primary bg-primary-soft text-primary-soft-foreground",
              i > current && "text-muted-foreground",
            )}
          >
            {i < current ? <Check className="size-3.5" /> : i + 1}
          </span>
          <span className={cn(i === current ? "font-medium" : "text-muted-foreground")}>{s}</span>
          {i < steps.length - 1 && <span className="mx-1 hidden h-px w-8 bg-border sm:block" />}
        </li>
      ))}
    </ol>
  );
}

function ExtractingState({ step }: { step: number }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="relative grid size-10 place-items-center rounded-xl bg-primary-soft">
          <Sparkles className="size-5 animate-pulse text-primary" />
        </span>
        <div>
          <p className="text-sm font-semibold">Extracting requirements</p>
          <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2.5">
        {EXTRACT_STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2.5 text-sm">
            {i < step ? (
              <Check className="size-4 text-success" />
            ) : i === step ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <span className="size-4 rounded-full border" />
            )}
            <span className={i <= step ? "" : "text-muted-foreground"}>{s}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}
