import { Main } from "@/components/ds";
import { Hero } from "@/components/site/hero";
import { StatsSection } from "@/components/site/stats-section";
import { ProblemSolutionSection } from "@/components/site/problem-solution-section";
import { ImageSection } from "@/components/site/image-section";
import { HowItWorksSection } from "@/components/site/how-it-works-section";
import { DemoSection } from "@/components/site/demo-section";
import { FeaturesSection } from "@/components/site/features-section";
import { ComparisonSection } from "@/components/site/comparison-section";
import { PricingSection } from "@/components/site/pricing-section";
import { CTASection } from "@/components/site/cta-section";
import { PostsSection } from "@/components/site/posts-section";

import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <Main className="bg-background min-h-screen selection:bg-primary/20 selection:text-primary">
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] mix-blend-overlay opacity-20" />
      <Hero />
      <StatsSection />
      <ProblemSolutionSection />
      <ImageSection src="/example-image.png" alt="Product visualization" />
      <HowItWorksSection />
      <DemoSection />
      <FeaturesSection />
      <ImageSection src="/person-image.png" alt="Feature showcase" />
      <ComparisonSection />
      <PricingSection />
      <CTASection />
      <PostsSection posts={posts} />
    </Main>
  );
}
