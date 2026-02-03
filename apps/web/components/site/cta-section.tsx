import { Box, Container, Section } from "@/components/ds";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export const CTASection = () => (
  <Section id="contact" className="border-b border-border/40 bg-muted/30 relative overflow-hidden">
    <Container>
      <Box className="py-24 text-center relative z-10 flex flex-col gap-8 items-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1] text-foreground max-w-2xl">
            Ready to ship faster?
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed text-balance">
            Get started with this template and launch your SaaS in days, not months.
            Everything you need is already configured.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-3 px-8 py-3 text-sm font-semibold tracking-wide transition-all duration-300 ease-[var(--ease-weighted)] bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm hover-lift focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background press-effect"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </Box>
    </Container>
  </Section>
);
