import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ---------- Logo ----------
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight text-foreground", className)}>
      <span className="relative grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-ink-foreground shadow-card">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
          <path d="M5 6h14M12 6v12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="18.5" cy="17.5" r="2.2" className="fill-primary" />
        </svg>
      </span>
      {!compact && <span className="text-[15px]">TalentIQ</span>}
    </span>
  );
}

// ---------- Status pill ----------
export const pillVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        primary: "border-transparent bg-primary-soft text-primary-soft-foreground",
        success: "border-transparent bg-success-soft text-success",
        warning: "border-transparent bg-warning-soft text-warning-foreground",
        danger: "border-transparent bg-destructive-soft text-destructive",
        info: "border-transparent bg-info-soft text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type PillTone = NonNullable<VariantProps<typeof pillVariants>["tone"]>;

const dotTone: Record<PillTone, string> = {
  neutral: "bg-muted-foreground/60",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
};

export function Pill({
  tone = "neutral",
  dot = false,
  pulse = false,
  className,
  children,
}: {
  tone?: PillTone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn(pillVariants({ tone }), className)}>
      {dot && <span className={cn("size-1.5 rounded-full", dotTone[tone], pulse && "animate-pulse")} />}
      {children}
    </span>
  );
}

// ---------- Skill chips with overflow ----------
export function SkillChips({
  skills,
  max = 3,
  className,
  highlight,
}: {
  skills: string[];
  max?: number;
  className?: string;
  highlight?: (s: string) => boolean;
}) {
  if (skills.length === 0) return <span className="text-xs text-muted-foreground">No skills listed</span>;
  const shown = skills.slice(0, max);
  const rest = skills.slice(max);
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-1", className)}>
      {shown.map((s) => (
        <span
          key={s}
          className={cn(
            "max-w-[10rem] truncate rounded-md border px-1.5 py-0.5 text-xs",
            highlight?.(s)
              ? "border-transparent bg-primary-soft text-primary-soft-foreground"
              : "border-border bg-card text-foreground/80",
          )}
        >
          {s}
        </span>
      ))}
      {rest.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              +{rest.length}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{rest.join(", ")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ---------- Stat card ----------
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-card", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ---------- Empty state ----------
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-14 text-center", className)}>
      <div className="grid size-11 place-items-center rounded-xl border bg-background shadow-card">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

// ---------- Page header ----------
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight break-words">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---------- Section card ----------
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card shadow-card", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

// ---------- Avatar ----------
export function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  const palette = ["bg-primary-soft text-primary-soft-foreground", "bg-success-soft text-success", "bg-warning-soft text-warning-foreground", "bg-info-soft text-info", "bg-muted text-foreground"];
  let h = 0;
  for (const ch of name) h = (h + ch.charCodeAt(0)) % palette.length;
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold", palette[h], className)}>
      {letters || "?"}
    </span>
  );
}
