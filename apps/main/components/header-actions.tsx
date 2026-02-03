import type React from "react";
import { cn } from "@/lib/utils";

function HeaderActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

export { HeaderActions };
