import { Container, Section, Box } from "@/components/ds";
import { SectionHeader } from "@/components/site/section-header";

export const ProblemSection = () => (
  <Section className="border-b border-primary/20">
    <Container>
      <Box className="py-20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl flex flex-col gap-6">
          <SectionHeader
            label="Warning: Efficiency Critical"
            title="Writing personalized emails doesn't scale"
            accent="destructive"
            className="mb-0"
          />
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            Your sales team spends hours crafting sequences. Copy-paste
            templates feel generic. Prospects can tell. Outr generates truly
            personalized emails—researched, relevant, and ready to send.
          </p>
        </div>
      </Box>
    </Container>
  </Section>
);
