import { createFileRoute } from "@tanstack/react-router";
import { CandidatesView } from "@/components/candidates/candidates-view";

export const Route = createFileRoute("/_workspace/candidates/")({
  head: () => ({
    meta: [
      { title: "Candidates — TalentIQ" },
      { name: "description", content: "Search, filter, and manage your reusable candidate pool." },
      { property: "og:title", content: "Candidates — TalentIQ" },
      { property: "og:description", content: "Search, filter, and manage your reusable candidate pool." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CandidatesView,
});
