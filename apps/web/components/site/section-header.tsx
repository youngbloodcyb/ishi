import { SWLabel } from "@/components/sw-ui";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  title: string;
  accent?: "primary" | "destructive";
  centered?: boolean;
  className?: string;
}

export const SectionHeader = ({
  label,
  title,
  accent = "primary",
  centered = false,
  className,
}: SectionHeaderProps) => (
  <div className={cn("mb-16 flex flex-col gap-6", className)}>
    <div className={cn("flex items-center gap-3", centered && "justify-center")}>
      <span className={cn(
        "flex h-2 w-2 rounded-full animate-pulse",
        accent === "primary" ? "bg-primary" : "bg-destructive"
      )}></span>
      <span className={cn(
        "text-xs font-medium uppercase tracking-wide",
        accent === "primary" ? "text-primary" : "text-destructive"
      )}>
        {label}
      </span>
    </div>
    <h2
      className={cn(
        "text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1] text-foreground",
        centered && "text-center"
      )}
    >
      {title}
    </h2>
  </div>
);
