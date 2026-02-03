import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full px-4 py-3 bg-background border border-primary/20",
          "font-mono text-sm placeholder:text-muted-foreground/50 resize-none",
          "focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-200 rounded-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
