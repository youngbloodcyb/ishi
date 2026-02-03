// Swiss UI components for design system accents.
// Minimal, functional decorative elements.

import { cn } from "@/lib/utils";

export const SWLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70",
      className
    )}
  >
    {children}
  </span>
);

export const SWHololine = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent my-4 opacity-50",
      className
    )}
  />
);

export const SWDecor = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex flex-col gap-1 select-none pointer-events-none opacity-30",
      className
    )}
  >
    <div className="flex gap-1">
      <div className="w-8 h-1 bg-primary" />
      <div className="w-2 h-1 bg-primary" />
      <div className="w-1 h-1 bg-primary" />
    </div>
    <div className="flex gap-1">
      <div className="w-1 h-1 bg-primary" />
      <div className="w-4 h-1 bg-primary" />
    </div>
  </div>
);
