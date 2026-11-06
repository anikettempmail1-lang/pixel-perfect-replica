import { Check, CircleDashed, FileText, MapPin, Sparkles } from "lucide-react";
import { InitialsAvatar, Pill } from "@/components/shared/primitives";
import { ScoreBar, ScoreRing } from "@/components/shared/status";

/** Static product illustration for the landing page (no real data). */
export function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="absolute -inset-x-8 -top-8 bottom-0 -z-10 rounded-[2rem] bg-primary/5 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-glow">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b bg-surface px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="ml-3 truncate text-xs text-muted-foreground">Senior Frontend Engineer · Matching results</span>
        </div>

        <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
          {/* ranking list */}
          <div className="border-b p-4 md:border-r md:border-b-0 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Ranked candidates</p>
              <Pill tone="primary">12 evaluated</Pill>
            </div>
            <ul className="space-y-1.5">
              {[
                { name: "Priya Sharma", role: "Senior Frontend Engineer · Razorpay", score: 92, active: true },
                { name: "Lena Fischer", role: "Staff Frontend Engineer · Contentful", score: 84 },
                { name: "Ishita Chatterjee", role: "Programmer Analyst · Cognizant", score: 63 },
                { name: "Rahul Banerjee", role: "Full Stack Developer · TCS", score: 58 },
              ].map((c, i) => (
                <li
                  key={c.name}
                  className={
                    c.active
                      ? "flex items-center gap-3 rounded-lg border border-primary/20 bg-primary-soft/60 p-2.5"
                      : "flex items-center gap-3 rounded-lg border border-transparent p-2.5"
                  }
                >
                  <span className="w-4 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                  <InitialsAvatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  <ScoreRing value={c.score} size={36} stroke={3.5} />
                </li>
              ))}
            </ul>
          </div>

          {/* evaluation detail */}
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <InitialsAvatar name="Priya Sharma" className="size-10 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">Priya Sharma</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> Bengaluru · 7 yrs 11 mos derived
                </p>
              </div>
              <Pill tone="success" dot>
                Strong match
              </Pill>
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              {[
                ["Skills", 95],
                ["Experience", 100],
                ["Role alignment", 88],
                ["Education", 100],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-muted-foreground">{l}</span>
                  <ScoreBar value={v as number} className="flex-1" />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Requirements</p>
              <div className="flex flex-wrap gap-1.5">
                <ReqChip ok label="React" type="ALL" />
                <ReqChip ok label="TypeScript" type="ALL" />
                <ReqChip ok label="Next.js" type="ANY" />
                <ReqChip label="Accessibility" type="PREFERRED" />
              </div>
            </div>

            <div className="rounded-lg bg-surface p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium">
                <FileText className="size-3.5 text-primary" /> Resume evidence
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                “Own the merchant dashboard design system in React and TypeScript. Cut bundle size 32%…”
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 left-4 hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs shadow-elevated sm:flex">
        <Sparkles className="size-3.5 text-primary" />
        Requirements extracted from job description
      </div>
    </div>
  );
}

function ReqChip({ label, ok = false, type }: { label: string; ok?: boolean; type: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-xs">
      {ok ? <Check className="size-3 text-success" /> : <CircleDashed className="size-3 text-muted-foreground" />}
      {label}
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{type}</span>
    </span>
  );
}
