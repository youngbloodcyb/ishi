// Design system components for layout and structure.
// Provides reusable primitives for Swiss/Linear design aesthetic.

import { cn } from "@/lib/utils";

type DSProps = {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
};

export const Section = ({ children, className, id, style }: DSProps) => (
  <section className={cn("", className)} id={id} style={style}>
    {children}
  </section>
);

export const Container = ({ children, className, id, style }: DSProps) => (
  <div
    className={cn("max-w-5xl mx-auto border-x border-border/50", className)}
    id={id}
    style={style}
  >
    {children}
  </div>
);

export const Box = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn("p-6 sm:p-8 lg:p-12 relative overflow-hidden", className)}
    >
      {children}
    </div>
  );
};
