import { Box, Container, Section } from "@/components/ds";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export const ProblemSolutionSection = () => (
  <Section className="border-b border-border/40">
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y divide-x lg:divide-y-0 lg:divide-x divide-border/40">
        <ScrollReveal className="h-full">
          <Box className="py-20 relative overflow-hidden bg-destructive/5 rounded-2xl lg:rounded-r-none border border-border/40 lg:border-r-0 lg:border-b-0 m-4 mb-0 lg:mr-0 lg:m-6 h-full">
            <div className="relative z-10 max-w-2xl flex flex-col gap-6 px-4">
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
                <span className="text-xs font-medium text-destructive uppercase tracking-wide">
                  The Problem
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1]">
                Building from scratch takes forever
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Setting up authentication, database, UI components, and deployment
                pipelines eats weeks of development time. By the time you ship,
                you've already burned through your runway.
              </p>
            </div>
          </Box>
        </ScrollReveal>
        <ScrollReveal delay={200} className="h-full">
          <Box className="py-20 relative overflow-hidden bg-green-500/5 rounded-2xl lg:rounded-l-none border border-border/40 lg:border-l-0 lg:border-t-0 m-4 mt-0 lg:ml-0 lg:m-6 h-full">
            <div className="relative z-10 max-w-2xl flex flex-col gap-6 px-4">
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                  The Solution
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1]">
                Start with everything you need
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                This template gives you authentication, database, UI components,
                and deployment configuration out of the box. Focus on what makes
                your product unique, not the infrastructure.
              </p>
            </div>
          </Box>
        </ScrollReveal>
      </div>
    </Container>
  </Section>
);
