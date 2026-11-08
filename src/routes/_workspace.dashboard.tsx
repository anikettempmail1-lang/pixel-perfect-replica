import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const Route = createFileRoute("/_workspace/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — TalentIQ" },
      { name: "description", content: "Your recruiting overview: candidates, jobs, processing, and evaluations." },
      { property: "og:title", content: "Overview — TalentIQ" },
      { property: "og:description", content: "Your recruiting overview at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardView,
});
