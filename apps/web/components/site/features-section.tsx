import { Container, Section, Box } from "@/components/ds";
import { BarChart, Database, GitBranch, Plug, Search, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/site/section-header";
import { FeatureCard } from "@/components/site/card";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export const FeaturesSection = () => (
  <Section id="features" className="border-b border-border/40 bg-muted/20">
    <Container>
      <Box className="py-24">
        <ScrollReveal>
          <SectionHeader label="Feature Set" title="Everything you need to ship faster" />
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ScrollReveal delay={100} className="h-full">
            <FeatureCard
              title="Modern Stack"
              description="Built with Next.js, TypeScript, and Tailwind CSS for a great developer experience."
              icon={<Sparkles className="w-5 h-5" />}
            />
          </ScrollReveal>
          <ScrollReveal delay={150} className="h-full">
            <FeatureCard
              title="Authentication Ready"
              description="WorkOS integration for secure user authentication and organization management."
              icon={<Search className="w-5 h-5" />}
            />
          </ScrollReveal>
          <ScrollReveal delay={200} className="h-full">
            <FeatureCard
              title="Database Included"
              description="PostgreSQL with Drizzle ORM for type-safe database operations."
              icon={<Plug className="w-5 h-5" />}
            />
          </ScrollReveal>
          <ScrollReveal delay={250} className="h-full">
            <FeatureCard
              title="UI Components"
              description="Beautiful components from shadcn/ui ready to use out of the box."
              icon={<Database className="w-5 h-5" />}
            />
          </ScrollReveal>
          <ScrollReveal delay={300} className="h-full">
            <FeatureCard
              title="Team Management"
              description="Built-in organization and team member management with invitations."
              icon={<GitBranch className="w-5 h-5" />}
            />
          </ScrollReveal>
          <ScrollReveal delay={350} className="h-full">
            <FeatureCard
              title="Analytics Ready"
              description="Vercel Analytics integration for tracking user behavior."
              icon={<BarChart className="w-5 h-5" />}
            />
          </ScrollReveal>
        </div>
      </Box>
    </Container>
  </Section>
);
