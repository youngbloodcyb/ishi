import { Container, Section } from "@/components/ds";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/site/scroll-reveal";


const ComparisonRow = (
  { left, right, isLast }: { left: string; right: string; isLast?: boolean },
) => (
  <div
    className={cn("grid grid-cols-2 transition-colors duration-150 hover:bg-muted/30", !isLast && "border-b border-border/40")}
  >
    <div className="p-6 flex items-center gap-4 bg-transparent text-muted-foreground">
      <div className="p-1 rounded-full bg-destructive/10 text-destructive shrink-0">
        <X className="w-3.5 h-3.5" />
      </div>
      <span className="leading-relaxed text-sm font-medium">{left}</span>
    </div>
    <div className="p-6 flex items-center gap-4 border-l border-border/40 bg-primary/5 text-foreground">
      <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0">
        <Check className="w-3.5 h-3.5" />
      </div>
      <span className="leading-relaxed text-sm font-medium">{right}</span>
    </div>
  </div>
);

export const ComparisonSection = () => (
  <Section className="border-b border-border/40 py-24">
    <Container className="max-w-4xl mx-auto">
      <ScrollReveal>
        <div className="rounded-2xl border border-border/40 overflow-hidden shadow-sm bg-card">
          <div className="grid grid-cols-2 border-b border-border/40">
            <div className="p-6 font-semibold uppercase tracking-wider text-xs text-muted-foreground bg-muted/20">
              Building from Scratch
            </div>
            <div className="p-6 font-semibold uppercase tracking-wider text-xs text-primary border-l border-border/40 bg-primary/5">
              With This Template
            </div>
          </div>
          <ComparisonRow
            left="Weeks of setup time"
            right="Deploy in minutes"
          />
          <ComparisonRow
            left="Configure auth yourself"
            right="WorkOS ready to go"
          />
          <ComparisonRow
            left="Build UI from scratch"
            right="shadcn/ui included"
          />
          <ComparisonRow
            left="Manual deployment"
            right="Vercel-optimized"
            isLast
          />
        </div>
      </ScrollReveal>
    </Container>
  </Section>
);
