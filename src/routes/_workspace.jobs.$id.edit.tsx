import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Briefcase } from "lucide-react";
import { JobForm } from "@/components/jobs/job-form";
import { EmptyState } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { useTalentStore } from "@/lib/store";

export const Route = createFileRoute("/_workspace/jobs/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit job — TalentIQ" },
      { name: "description", content: "Edit job details and requirements." },
      { property: "og:title", content: "Edit job — TalentIQ" },
      { property: "og:description", content: "Edit job details and requirements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditJobPage,
});

function EditJobPage() {
  const { id } = Route.useParams();
  const job = useTalentStore((s) => s.jobs.find((j) => j.id === id));
  if (!job) {
    return <EmptyState icon={Briefcase} title="Job not found" action={<Button variant="outline" asChild><Link to="/jobs"><ArrowLeft /> Back to jobs</Link></Button>} />;
  }
  return <JobForm key={job.id} job={job} />;
}
