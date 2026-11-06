import type { EvaluationStatus, JobExtractionStatus, JobStatus, ResumeStatus } from "@/lib/types";
import { JOB_STATUS_LABEL, RESUME_STATUS_LABEL } from "@/lib/talent-utils";
import { Pill, type PillTone } from "./primitives";
import { cn } from "@/lib/utils";

const RESUME_TONE: Record<ResumeStatus, PillTone> = {
  PENDING: "neutral",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "danger",
};

export function ResumeStatusPill({ status }: { status: ResumeStatus }) {
  return (
    <Pill tone={RESUME_TONE[status]} dot pulse={status === "PROCESSING"}>
      {RESUME_STATUS_LABEL[status]}
    </Pill>
  );
}

const JOB_TONE: Record<JobStatus, PillTone> = { DRAFT: "neutral", ACTIVE: "success", CLOSED: "warning" };

export function JobStatusPill({ status }: { status: JobStatus }) {
  return (
    <Pill tone={JOB_TONE[status]} dot>
      {JOB_STATUS_LABEL[status]}
    </Pill>
  );
}

const EXTRACTION_TONE: Record<JobExtractionStatus, PillTone> = {
  PENDING: "neutral",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "danger",
};

export function ExtractionStatusPill({ status }: { status: JobExtractionStatus }) {
  const label = { PENDING: "Not extracted", PROCESSING: "Extracting", COMPLETED: "Extracted", FAILED: "Extraction failed" }[status];
  return <Pill tone={EXTRACTION_TONE[status]}>{label}</Pill>;
}

export const EVALUATION_STATUS_INFO: Record<EvaluationStatus, { label: string; tone: PillTone }> = {
  PENDING: { label: "Not reviewed", tone: "neutral" },
  SHORTLISTED: { label: "Shortlisted", tone: "success" },
  NEEDS_REVIEW: { label: "Needs review", tone: "warning" },
  REJECTED: { label: "Rejected", tone: "danger" },
};

export function EvaluationStatusPill({ status }: { status: EvaluationStatus }) {
  const info = EVALUATION_STATUS_INFO[status];
  return <Pill tone={info.tone}>{info.label}</Pill>;
}

// ---------- Scores ----------
export function scoreTone(score: number) {
  if (score >= 75) return { bar: "bg-success", text: "text-success", ring: "stroke-success" };
  if (score >= 55) return { bar: "bg-primary", text: "text-primary", ring: "stroke-primary" };
  return { bar: "bg-warning", text: "text-warning-foreground", ring: "stroke-warning" };
}

export function ScoreBar({ value, className, showValue = true }: { value: number; className?: string; showValue?: boolean }) {
  const tone = scoreTone(value);
  return (
    <div className={cn("flex min-w-[5.5rem] items-center gap-2", className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone.bar)} style={{ width: `${value}%` }} />
      </div>
      {showValue && <span className="w-7 text-right text-xs font-medium tabular-nums text-foreground/80">{value}</span>}
    </div>
  );
}

export function ScoreRing({ value, size = 44, stroke = 4, className }: { value: number; size?: number; stroke?: number; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = scoreTone(value);
  return (
    <div className={cn("relative grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          className={cn("fill-none transition-all", tone.ring)}
        />
      </svg>
      <span className="absolute text-xs font-semibold tabular-nums">{value}</span>
    </div>
  );
}
