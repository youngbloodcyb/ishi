import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-background/50 border border-border/40 hover:bg-muted/50 focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg px-3 py-2 text-sm transition-all duration-200 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 w-full shadow-sm h-9 min-w-0",
        className
      )}
      {...props}
    />
  )
}

export { Input }
