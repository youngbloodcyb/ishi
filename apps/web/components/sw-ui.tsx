"use client";

import { cn } from "@/lib/utils";

export const SWFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("relative p-1", className)}>
      {/* Corner cutouts via clip-path */}
      <div 
        className="absolute inset-0 border border-primary/30 bg-background/50 backdrop-blur-[2px]"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)"
        }}
      />
      
      {/* Decorative corner markers */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-primary" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-primary" />
      {/* Bottom right is cut, so we move the marker */}
      <div className="absolute bottom-[16px] right-0 w-[1px] h-3 bg-primary/50" />
      <div className="absolute bottom-0 right-[16px] w-3 h-[1px] bg-primary/50" />

      {/* Content */}
      <div className="relative z-10 p-4">
        {children}
      </div>
    </div>
  );
};

export const SWLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70", className)}>
    {children}
  </span>
);

export const SWHololine = () => (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent my-4 opacity-50" />
);

export const SWDecor = ({ className }: { className?: string }) => (
  <div className={cn("flex flex-col gap-1 select-none pointer-events-none opacity-30", className)}>
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
