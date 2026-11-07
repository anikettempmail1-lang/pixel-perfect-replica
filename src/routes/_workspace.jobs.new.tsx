import { createFileRoute } from "@tanstack/react-router";
import { JobForm } from "@/components/jobs/job-form";

export const Route = createFileRoute("/_workspace/jobs/new")({
  head: () => ({
    meta: [
      { title: "Create job — TalentIQ" },
      { name: "description", content: "Create a job and extract structured requirements from its description." },
      { property: "og:title", content: "Create job — TalentIQ" },
      { property: "og:description", content: "Create a job and extract structured requirements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewJobPage,
});

function NewJobPage() {
  return <JobForm />;
}
