import { createFileRoute } from "@tanstack/react-router";
import { MatchesView } from "@/components/matches/matches-view";

export const Route = createFileRoute("/_workspace/jobs/$id/matches")({
  head: () => ({
    meta: [
      { title: "Matching results — TalentIQ" },
      { name: "description", content: "Ranked candidates with skill, experience, and education evidence for this job." },
      { property: "og:title", content: "Matching results — TalentIQ" },
      { property: "og:description", content: "Ranked candidates with explainable evaluation evidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const { id } = Route.useParams();
  return <MatchesView jobId={id} />;
}
