import { SWLabel } from "@/components/sw-ui";
import { cn } from "@/lib/utils";

// Shared icon container
export const IconBox = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-2 bg-primary/5 text-primary w-fit rounded-lg transition-colors duration-200 group-hover:bg-primary/10", className)}>
    {children}
  </div>
);

// Base card styles
const cardBase = "p-6 flex flex-col gap-4 group border border-border/40 hover:border-border/80 bg-card rounded-xl shadow-sm hover-lift hover-scale transition-all duration-300 ease-[var(--ease-weighted)]";

// Feature Card
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const FeatureCard = ({ title, description, icon }: FeatureCardProps) => (
  <div className={cn(cardBase, "h-full")}>
    <IconBox>{icon}</IconBox>
    <h3 className="text-base font-semibold tracking-tight leading-tight">
      {title}
    </h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

// Step Card
interface StepCardProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const StepCard = ({ number, title, description, icon }: StepCardProps) => (
  <div className={cn(cardBase, "relative h-full")}>
    <div className="absolute top-4 right-4 font-mono text-xs text-muted-foreground/60 bg-muted/50 px-2 py-1 rounded-full">
      {number}
    </div>
    <IconBox className="p-3">{icon}</IconBox>
    <h3 className="text-xl font-semibold tracking-tight leading-tight">
      {title}
    </h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

// Testimonial Card
interface TestimonialCardProps {
  quote: string;
  author: string;
}

export const TestimonialCard = ({ quote, author }: TestimonialCardProps) => (
  <div className={cardBase}>
    <p className="text-base font-light italic mb-2 leading-relaxed text-muted-foreground">"{quote}"</p>
    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/40">
      <span className="text-xs font-medium uppercase tracking-wider text-foreground">
        {author}
      </span>
    </div>
  </div>
);

// Stat Card
interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}

export const StatCard = ({ label, value, sub, icon }: StatCardProps) => (
  <div className="p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors duration-200 group relative">
    <IconBox className="rounded-full">{icon}</IconBox>
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-semibold tracking-tight text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </div>
  </div>
);
