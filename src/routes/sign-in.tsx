import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/primitives";
import { MOCK_RECRUITER_PROFILE } from "@/lib/mock-data";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — TalentIQ" },
      { name: "description", content: "Sign in to your TalentIQ recruiter workspace." },
      { property: "og:title", content: "Sign in — TalentIQ" },
      { property: "og:description", content: "Sign in to your TalentIQ recruiter workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignInPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid work email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function SignInPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: MOCK_RECRUITER_PROFILE.email, password: "demo-password" },
  });

  const onSubmit = form.handleSubmit(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success(`Welcome back, ${MOCK_RECRUITER_PROFILE.name.split(" ")[0]}`);
    navigate({ to: "/dashboard" });
  });

  return (
    <div className="relative grid min-h-screen place-items-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-2xl border bg-card p-6 shadow-elevated">
          <h1 className="text-lg font-semibold tracking-tight">Sign in to TalentIQ</h1>
          <p className="mt-1 text-sm text-muted-foreground">Demo mode — any valid email and password works.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
              {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              Continue
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Recruiter accounts only. Candidates don't need to sign in.</p>
      </div>
    </div>
  );
}
