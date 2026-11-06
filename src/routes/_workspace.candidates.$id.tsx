import { createFileRoute } from "@tanstack/react-router";
import { CandidateProfile } from "@/components/candidates/candidate-profile";

export const Route = createFileRoute("/_workspace/candidates/$id")({
  head: () => ({
    meta: [
      { title: "Candidate profile — TalentIQ" },
      { name: "description", content: "Candidate experience, projects, education, and resume." },
      { property: "og:title", content: "Candidate profile — TalentIQ" },
      { property: "og:description", content: "Candidate experience, projects, education, and resume." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CandidatePage,
});

function CandidatePage() {
  const { id } = Route.useParams();
  return <CandidateProfile candidateId={id} />;
}
