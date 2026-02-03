import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageShell, PageHeader } from "@/components/page-shell";

export default async function DashboardPage() {
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome${user.firstName ? `, ${user.firstName}` : ""}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Your application is ready. Start building your features here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This template includes WorkOS authentication, organization management,
            and team invitations. Customize the dashboard and add your own features.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
