import { Container, Section, Box } from "@/components/ds";
import { SectionHeader } from "@/components/site/section-header";

export const SolutionSection = () => (
  <Section className="border-b border-primary/20">
    <Container>
      <Box className="py-20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl flex flex-col gap-6">
          <SectionHeader
            label="Solution: Automated Personalization"
            title="AI that writes like your best SDR"
            className="mb-0"
          />
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            Outr researches each prospect, pulls company context, and generates
            emails that feel hand-written. Every message is unique, relevant,
            and ready to send—no templates, no busywork.
          </p>
        </div>
      </Box>
    </Container>
  </Section>
);
