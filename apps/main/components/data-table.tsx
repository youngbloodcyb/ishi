import type React from "react";
import { cn } from "@/lib/utils";
import { Table } from "@/components/ui/table";

interface DataTableProps {
  isEmpty?: boolean;
  empty?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

function DataTable({ isEmpty, empty, className, children }: DataTableProps) {
  return (
    <div className={cn("rounded-xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-xl overflow-hidden relative", className)}>
      {isEmpty ? empty : <div className="relative w-full overflow-auto"><Table>{children}</Table></div>}
    </div>
  );
}

export { DataTable };
