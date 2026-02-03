import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-4 py-3 bg-background border border-primary/20",
          "font-mono text-sm placeholder:text-muted-foreground/50",
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
Input.displayName = "Input";

export { Input };
