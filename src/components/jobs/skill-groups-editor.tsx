import { useState, type KeyboardEvent } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Info, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SKILL_GROUP_TYPE_INFO } from "@/lib/talent-utils";
import type { SkillGroupType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { newLocalId, type JobFormValues } from "./job-form-schema";

export function RequirementTypeLegend() {
  return (
    <div className="grid gap-2 rounded-lg border bg-surface p-3 sm:grid-cols-3">
      {(["ALL", "ANY", "PREFERRED"] as SkillGroupType[]).map((t) => (
        <div key={t} className="flex gap-2">
          <RequirementTypeBadge type={t} />
          <p className="text-xs text-muted-foreground">{SKILL_GROUP_TYPE_INFO[t].description}</p>
        </div>
      ))}
    </div>
  );
}

export function RequirementTypeBadge({ type }: { type: SkillGroupType }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded px-1.5 font-mono text-[10px] font-medium tracking-wide",
        type === "ALL" && "bg-ink text-ink-foreground",
        type === "ANY" && "bg-primary-soft text-primary-soft-foreground",
        type === "PREFERRED" && "border border-dashed text-muted-foreground",
      )}
    >
      {type}
    </span>
  );
}

export function SkillGroupsEditor() {
  const { control, formState } = useFormContext<JobFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "skillGroups", keyName: "_key" });

  return (
    <div className="space-y-3">
      <RequirementTypeLegend />
      {fields.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No skill groups yet. Add one to describe the skills this role needs.
        </p>
      )}
      {fields.map((f, i) => (
        <SkillGroupCard key={f._key} index={i} onRemove={() => remove(i)} />
      ))}
      {formState.errors.skillGroups?.root?.message && <p className="text-xs text-destructive">{formState.errors.skillGroups.root.message}</p>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ id: newLocalId("sg"), category: "", requirementType: "ALL", skills: [] })}
      >
        <Plus /> Add skill group
      </Button>
    </div>
  );
}

function SkillGroupCard({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { control, register, setValue, formState } = useFormContext<JobFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: `skillGroups.${index}.skills`, keyName: "_key" });
  const type = useWatch({ control, name: `skillGroups.${index}.requirementType` });
  const [draft, setDraft] = useState("");
  const err = formState.errors.skillGroups?.[index];

  const addSkill = () => {
    const names = draft.split(",").map((s) => s.trim()).filter(Boolean);
    names.forEach((name) => append({ id: newLocalId("sk"), name }));
    setDraft("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input {...register(`skillGroups.${index}.category`)} placeholder="Category, e.g. Core frontend" className="h-9" aria-label="Group category" />
          {err?.category && <p className="mt-1 text-xs text-destructive">{err.category.message}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Select value={type} onValueChange={(v) => setValue(`skillGroups.${index}.requirementType`, v as SkillGroupType, { shouldDirty: true })}>
            <SelectTrigger className="h-9 w-full sm:w-[190px]" aria-label="Requirement type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["ALL", "ANY", "PREFERRED"] as SkillGroupType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  <span className="flex items-center gap-2">
                    <RequirementTypeBadge type={t} /> {SKILL_GROUP_TYPE_INFO[t].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Remove group" className="text-muted-foreground hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="size-3" /> {SKILL_GROUP_TYPE_INFO[type].description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {fields.map((s, si) => (
          <span key={s._key} className="inline-flex items-center gap-1 rounded-md border bg-surface py-0.5 pr-1 pl-2">
            <input
              {...register(`skillGroups.${index}.skills.${si}.name`)}
              className="w-[9ch] min-w-[4ch] bg-transparent text-xs outline-none field-sizing-content"
              aria-label="Skill name"
            />
            <button type="button" onClick={() => remove(si)} className="text-muted-foreground hover:text-foreground" aria-label="Remove skill">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder="Add skill…"
            className="h-7 w-32 text-xs"
            aria-label="New skill"
          />
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={addSkill} aria-label="Add skill">
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
      {err?.skills?.message && <p className="mt-2 text-xs text-destructive">{err.skills.message}</p>}
      {err?.skills?.root?.message && <p className="mt-2 text-xs text-destructive">{err.skills.root.message}</p>}
    </div>
  );
}
