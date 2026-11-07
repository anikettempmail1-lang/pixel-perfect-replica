import { createFileRoute } from "@tanstack/react-router";
import { JobDetails } from "@/components/jobs/job-details";

export const Route = createFileRoute("/_workspace/jobs/$id/")({
  head: () => ({
    meta: [
      { title: "Job details — TalentIQ" },
      { name: "description", content: "Job requirements, skill groups, and candidate pool." },
      { property: "og:title", content: "Job details — TalentIQ" },
      { property: "og:description", content: "Job requirements, skill groups, and candidate pool." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobPage,
});

function JobPage() {
  const { id } = Route.useParams();
  return <JobDetails jobId={id} />;
}
