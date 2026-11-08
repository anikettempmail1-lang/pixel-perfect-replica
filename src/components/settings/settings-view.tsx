import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { InitialsAvatar, PageHeader, SectionCard } from "@/components/shared/primitives";
import { MOCK_RECRUITER_PROFILE, MOCK_USER } from "@/lib/mock-data";
import { formatDate } from "@/lib/talent-utils";

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  title: z.string().trim().max(80),
  company: z.string().trim().min(1, "Company is required").max(80),
});

export function SettingsView() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: MOCK_RECRUITER_PROFILE.name, title: MOCK_RECRUITER_PROFILE.title, company: MOCK_RECRUITER_PROFILE.company },
  });
  const errors = form.formState.errors;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your recruiter profile and workspace preferences." />

      <SectionCard title="Profile" description="Shown to teammates in notes and activity.">
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(() => toast.success("Profile saved (mock)"))}
          noValidate
        >
          <div className="flex items-center gap-4">
            <InitialsAvatar name={form.watch("name") || "?"} className="size-12 text-base" />
            <div className="text-sm">
              <p className="font-medium">{MOCK_USER.email}</p>
              <p className="text-xs text-muted-foreground">Member since {formatDate(MOCK_USER.createdAt)}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" {...form.register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Job title</Label>
              <Input id="title" {...form.register("title")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...form.register("company")} />
              {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Notifications">
        <div className="space-y-4">
          {[
            ["Resume processing finished", "When a batch of uploaded resumes completes or fails.", true],
            ["Evaluation complete", "When a candidate evaluation run finishes for a job.", true],
            ["Weekly summary", "A digest of new candidates and job activity.", false],
          ].map(([t, d, on]) => (
            <label key={t as string} className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">{t}</span>
                <span className="block text-xs text-muted-foreground">{d}</span>
              </span>
              <Switch defaultChecked={on as boolean} onCheckedChange={() => toast.success("Preference updated")} />
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Session">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Authentication is mocked in this preview.</p>
          <Button variant="outline" onClick={() => toast("Signed out of other sessions (mock)")}>Sign out other sessions</Button>
        </div>
      </SectionCard>
    </div>
  );
}
