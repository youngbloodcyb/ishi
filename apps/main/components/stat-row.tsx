import type React from "react";
import { cn } from "@/lib/utils";

interface StatItem {
  label?: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  valueClassName?: string;
  hidden?: boolean;
}

interface StatRowProps extends React.ComponentProps<"div"> {
  items: StatItem[];
}

function StatRow({ items, className, ...props }: StatRowProps) {
  return (
    <div
      className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}
      {...props}
    >
      {items
        .filter((item) => !item.hidden)
        .map((item, index) => (
          <div key={index} className="flex flex-col gap-1 p-4 rounded-xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              {item.icon}
              <span className="text-xs font-medium uppercase tracking-wide">{item.label}</span>
            </div>
            <span className={cn("text-2xl font-semibold tracking-tight", item.valueClassName)}>
              {item.value}
            </span>
          </div>
        ))}
    </div>
  );
}

export { StatRow };
