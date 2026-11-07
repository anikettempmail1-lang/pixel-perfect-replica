import { createFileRoute } from "@tanstack/react-router";
import { JobsView } from "@/components/jobs/jobs-view";

export const Route = createFileRoute("/_workspace/jobs/")({
  head: () => ({
    meta: [
      { title: "Jobs — TalentIQ" },
      { name: "description", content: "Manage jobs and their structured requirements." },
      { property: "og:title", content: "Jobs — TalentIQ" },
      { property: "og:description", content: "Manage jobs and their structured requirements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobsView,
});
