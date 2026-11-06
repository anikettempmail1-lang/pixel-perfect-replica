import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/marketing/site-nav";
import { FinalCta, Features, Hero, HowItWorks, ProblemSolution, SiteFooter, WhyTalentIQ } from "@/components/marketing/landing-sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TalentIQ — Hire smarter. Discover the right talent." },
      { name: "description", content: "Parse resumes in bulk, extract job requirements, and evaluate candidates with explainable, evidence-backed insights." },
      { property: "og:title", content: "TalentIQ — Hire smarter. Discover the right talent." },
      { property: "og:description", content: "Parse resumes in bulk, extract job requirements, and evaluate candidates with explainable insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <WhyTalentIQ />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
