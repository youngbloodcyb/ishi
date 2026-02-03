import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import "./globals.css";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { OrganizationProvider } from "@/lib/organization-context";
import {
  getCurrentOrganization,
  getUserOrganizations,
} from "@/lib/services/get-organization";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { DeveloperTools } from "@/components/developer-tools";
import { QueryProvider } from "@/lib/query-client";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "App",
    template: "%s | App",
  },
  description: "Your application description",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await withAuth({ ensureSignedIn: true });

  const organization = await getCurrentOrganization(user.id);
  const memberships = await getUserOrganizations(user.id);

  // If no organization, something went wrong during signup - redirect to re-auth
  if (!organization) {
    redirect("/");
    return;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthKitProvider>
            <QueryProvider>
              <OrganizationProvider
                organization={organization}
                memberships={memberships}
              >
                <SidebarWrapper userEmail={user.email}>{children}</SidebarWrapper>
                {process.env.VERCEL_ENV !== "production" && <DeveloperTools />}
              </OrganizationProvider>
            </QueryProvider>
          </AuthKitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
