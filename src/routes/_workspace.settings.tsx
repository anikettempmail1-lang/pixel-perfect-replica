import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/components/settings/settings-view";

export const Route = createFileRoute("/_workspace/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TalentIQ" },
      { name: "description", content: "Manage your TalentIQ recruiter profile and preferences." },
      { property: "og:title", content: "Settings — TalentIQ" },
      { property: "og:description", content: "Manage your TalentIQ recruiter profile and preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsView,
});
