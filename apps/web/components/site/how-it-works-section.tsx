import { Container, Section, Box } from "@/components/ds";
import { Send, Upload, Workflow } from "lucide-react";
import { SectionHeader } from "@/components/site/section-header";
import { StepCard } from "@/components/site/card";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export const HowItWorksSection = () => (
  <Section className="border-b border-border/40 bg-background/50 backdrop-blur-sm">
    <Container>
      <Box className="py-24">
        <ScrollReveal>
          <div className="mb-12">
            <SectionHeader label="Getting Started" title="How It Works" />
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal delay={100} className="h-full">
            <StepCard
              number="01"
              title="Clone the Template"
              description="Fork the repository and configure your environment variables."
              icon={<Workflow className="w-6 h-6" />}
            />
          </ScrollReveal>
          <ScrollReveal delay={200} className="h-full">
            <StepCard
              number="02"
              title="Customize Your App"
              description="Add your features, update the branding, and connect your services."
              icon={<Upload className="w-6 h-6" />}
            />
          </ScrollReveal>
          <ScrollReveal delay={300} className="h-full">
            <StepCard
              number="03"
              title="Deploy & Launch"
              description="Push to production with Vercel. Your app is ready for users."
              icon={<Send className="w-6 h-6" />}
            />
          </ScrollReveal>
        </div>
      </Box>
    </Container>
  </Section>
);
