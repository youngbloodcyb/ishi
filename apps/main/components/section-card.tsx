import type React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SectionCardProps extends Omit<React.ComponentProps<typeof Card>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

function SectionCard({
  title,
  description,
  action,
  className,
  headerClassName,
  contentClassName,
  children,
  ...props
}: SectionCardProps) {
  const hasHeader = title || description || action;

  return (
    <Card className={className} {...props}>
      {hasHeader && (
        <CardHeader className={cn("gap-2", headerClassName)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export { SectionCard };
