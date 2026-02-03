import { Box, Container, Section } from "@/components/ds";
import { Check } from "lucide-react";
import { SectionHeader } from "@/components/site/section-header";
import { ScrollReveal } from "@/components/site/scroll-reveal";

const PricingFeature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center gap-3 text-sm text-muted-foreground">
    <div className="p-0.5 rounded-full bg-primary/10 text-primary shrink-0">
      <Check className="w-3 h-3" />
    </div>
    <span>{children}</span>
  </li>
);

const PricingCard = ({
  label,
  price,
  unit,
  description,
  features,
  bestFor,
  featured = false,
}: {
  label: string;
  price: string;
  unit?: string;
  description: string;
  features: string[];
  bestFor: string;
  featured?: boolean;
}) => (
  <div
    className={`p-8 flex flex-col gap-6 group rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md h-full ${
      featured
        ? "bg-background border-primary/50 ring-4 ring-primary/5 relative overflow-hidden"
        : "bg-background border-border/40 hover:border-border"
    }`}
  >
    {featured && (
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
    )}

    <div className="flex flex-col gap-2">
      <span
        className={`text-sm font-medium uppercase tracking-wide w-fit px-2.5 py-0.5 rounded-full ${featured ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {price}
        </span>
        {unit && (
          <span className="text-muted-foreground text-sm font-medium">
            {unit}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>

    <div className="w-full h-px bg-border/40" />

    <ul className="space-y-3 flex-1">
      {features.map((feature, i) => (
        <PricingFeature key={i}>{feature}</PricingFeature>
      ))}
    </ul>

    <div className="pt-4 border-t border-border/40">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {bestFor}
      </span>
    </div>
  </div>
);

export const PricingSection = () => (
  <Section id="pricing" className="border-b border-border/40 bg-muted/20">
    <Container>
      <Box className="py-24">
        <ScrollReveal>
          <SectionHeader label="Pricing" title="Simple, transparent pricing" />
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <ScrollReveal delay={100} className="h-full">
            <PricingCard
              label="Pro"
              price="$29"
              unit="/user/mo"
              description="Everything you need to build and scale your product"
              features={[
                "Unlimited projects",
                "Team collaboration",
                "Priority support",
                "Advanced analytics",
                "Custom integrations",
              ]}
              bestFor="Best for: Growing teams"
              featured
            />
          </ScrollReveal>
          <ScrollReveal delay={200} className="h-full">
            <PricingCard
              label="Enterprise"
              price="Custom"
              description="Tailored to your needs"
              features={[
                "Volume-based pricing",
                "Custom integrations",
                "Dedicated support",
                "SLA guarantees",
              ]}
              bestFor="Best for: Large organizations"
            />
          </ScrollReveal>
        </div>

        <ScrollReveal delay={300}>
          <p className="mt-12 text-sm text-muted-foreground text-center max-w-md mx-auto">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </ScrollReveal>
      </Box>
    </Container>
  </Section>
);
