import { Container, Section, Box } from "@/components/ds";
import { SectionHeader } from "@/components/site/section-header";
import { TestimonialCard } from "@/components/site/card";

export const TestimonialsSection = () => (
  <Section className="border-b border-primary/20">
    <Container>
      <Box className="py-20">
        <SectionHeader
          label="Social Proof Verification"
          title="Trusted by sales teams who hate busywork"
          centered
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TestimonialCard
            quote="Outr completely changed how we do outbound. It's like having 10 SDRs in a box."
            author="Sarah J., VP of Sales"
          />
          <TestimonialCard
            quote="The personalization is actually good. I was skeptical, but the reply rates don't lie."
            author="Mike T., Account Executive"
          />
        </div>
      </Box>
    </Container>
  </Section>
);
