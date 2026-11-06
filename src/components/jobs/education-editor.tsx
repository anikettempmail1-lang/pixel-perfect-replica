import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/shared/tag-input";
import { EDUCATION_LEVELS, EDUCATION_LEVEL_LABEL } from "@/lib/talent-utils";
import type { EducationLevel } from "@/lib/types";
import { newLocalId, type JobFormValues } from "./job-form-schema";

export function EducationEditor() {
  const { control, register, formState } = useFormContext<JobFormValues>();
  const enabled = useWatch({ control, name: "education.enabled" });
  const related = useWatch({ control, name: "education.relatedDegreesAllowed" });
  const { fields, append, remove } = useFieldArray({ control, name: "education.acceptedDegrees", keyName: "_key" });
  const errs = formState.errors.education?.acceptedDegrees;

  return (
    <div className="space-y-4">
      <Controller
        control={control}
        name="education.enabled"
        render={({ field }) => (
          <label className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <span>
              <span className="block text-sm font-medium">Include an education requirement</span>
              <span className="block text-xs text-muted-foreground">Turn off if any educational background is acceptable.</span>
            </span>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </label>
        )}
      />

      {enabled && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Minimum education level</Label>
              <Controller
                control={control}
                name="education.minEducationLevel"
                render={({ field }) => (
                  <Select value={field.value ?? "NONE"} onValueChange={(v) => field.onChange(v === "NONE" ? null : (v as EducationLevel))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">No minimum</SelectItem>
                      {EDUCATION_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>{EDUCATION_LEVEL_LABEL[l]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <ToggleRow name="education.isMandatory" label="Mandatory" hint="Candidates must meet this requirement" />
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <ToggleRow name="education.relatedDegreesAllowed" label="Allow related degrees" hint="Accept degrees outside the list if the field of study is related" bare />
            {related && (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="related-fields" className="text-xs">Related fields of study</Label>
                <Controller
                  control={control}
                  name="education.relatedDegreeFieldsOfStudy"
                  render={({ field }) => <TagInput id="related-fields" value={field.value} onChange={field.onChange} placeholder="e.g. Electronics, Mathematics" />}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Accepted degrees</p>
                <p className="text-xs text-muted-foreground">Each degree keeps its own fields of study and mandatory-field rule.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ id: newLocalId("deg"), degreeName: "", acceptedFieldOfStudy: [], isFieldOfStudyMandatory: false })}
              >
                <Plus /> Add degree
              </Button>
            </div>
            {fields.length === 0 && (
              <p className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">No specific degrees listed.</p>
            )}
            {fields.map((f, i) => (
              <div key={f._key} className="rounded-xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-muted"><GraduationCap className="size-4 text-muted-foreground" /></span>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <Input {...register(`education.acceptedDegrees.${i}.degreeName`)} placeholder="Degree name, e.g. B.Tech" className="h-9" aria-label="Degree name" />
                      {errs?.[i]?.degreeName && <p className="mt-1 text-xs text-destructive">{errs[i]!.degreeName!.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Accepted fields of study</Label>
                      <Controller
                        control={control}
                        name={`education.acceptedDegrees.${i}.acceptedFieldOfStudy`}
                        render={({ field }) => <TagInput value={field.value} onChange={field.onChange} placeholder="e.g. Computer Science" />}
                      />
                    </div>
                    <Controller
                      control={control}
                      name={`education.acceptedDegrees.${i}.isFieldOfStudyMandatory`}
                      render={({ field }) => (
                        <label className="flex items-center gap-2 text-sm">
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                          Field of study is mandatory for this degree
                        </label>
                      )}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove degree" className="text-muted-foreground hover:text-destructive">
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
            {errs?.root?.message && <p className="text-xs text-destructive">{errs.root.message}</p>}
            {errs?.message && <p className="text-xs text-destructive">{errs.message}</p>}
          </div>
        </>
      )}
    </div>
  );
}

function ToggleRow({ name, label, hint, bare = false }: { name: "education.isMandatory" | "education.relatedDegreesAllowed"; label: string; hint: string; bare?: boolean }) {
  const { control } = useFormContext<JobFormValues>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className={bare ? "flex items-center justify-between gap-4" : "flex h-9 items-center justify-between gap-4 rounded-md border px-3"}>
          <span className="min-w-0">
            <span className="block text-sm font-medium">{label}</span>
            {bare && <span className="block text-xs text-muted-foreground">{hint}</span>}
          </span>
          <Switch checked={field.value} onCheckedChange={field.onChange} aria-label={label} />
        </label>
      )}
    />
  );
}
