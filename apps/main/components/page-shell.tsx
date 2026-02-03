import { cn } from "@/lib/utils";
import { PageBreadcrumbs, type BreadcrumbItemType } from "@/components/page-breadcrumbs";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export type { BreadcrumbItemType };

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: "div" | "main" | "section";
}

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  leading?: React.ReactNode;
  breadcrumbs?: BreadcrumbItemType[];
  titleClassName?: string;
  subtitleClassName?: string;
}

function PageShell({
  children,
  className,
  as: Component = "div",
  ...props
}: PageShellProps) {
  return (
    <Component
      className={cn("w-full max-w-5xl mx-auto space-y-8 relative", className)}
      {...props}
    >
      <div className="absolute -top-2 -left-2 text-border/40 select-none pointer-events-none">
        <Plus className="h-4 w-4" />
      </div>
      <div className="absolute -top-2 -right-2 text-border/40 select-none pointer-events-none">
        <Plus className="h-4 w-4" />
      </div>
      {children}
    </Component>
  );
}

function PageHeader({
  title,
  subtitle,
  action,
  leading,
  breadcrumbs,
  titleClassName,
  subtitleClassName,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 px-1", className)} {...props}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <PageBreadcrumbs items={breadcrumbs} />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {leading && <div className="mt-1">{leading}</div>}
          <div className="space-y-1">
            <h1
              className={cn(
                "text-3xl font-bold tracking-tight text-foreground",
                titleClassName
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p className={cn("text-base text-muted-foreground", subtitleClassName)}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex items-start gap-2">{action}</div>}
      </div>
    </div>
  );
}

export { PageShell, PageHeader };
