import { ThemeProvider } from "@/components/theme/theme-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Layout, Main } from "@/components/ds";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Analytics } from "@vercel/analytics/react";

import { JetBrains_Mono } from "next/font/google";

import type { Metadata } from "next";

import "./globals.css";

import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "App / Your SaaS Platform",
    template: "%s | App",
  },
  description:
    "Build and deploy your application with modern tools and best practices. A starter template for your next SaaS project.",
  keywords: [
    "saas",
    "starter template",
    "next.js",
    "react",
    "typescript",
    "tailwind css",
  ],
  authors: [{ name: "Your Company" }],
  creator: "Your Company",
  publisher: "Your Company",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
    siteName: "App",
    title: "App - Your SaaS Platform",
    description:
      "Build and deploy your application with modern tools and best practices. A starter template for your next SaaS project.",
  },
  twitter: {
    card: "summary_large_image",
    title: "App - Your SaaS Platform",
    description:
      "Build and deploy your application with modern tools and best practices. A starter template for your next SaaS project.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased w-full flex flex-col",
          jetbrainsMono.variable,
        )}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow-md"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LenisProvider>
            <Header />
            <Main className="flex-1" id="main-content">
              {children}
            </Main>
            <Footer />
            <div className="fixed bottom-6 right-6 z-50">
              <ThemeToggle />
            </div>
            <Toaster position="top-center" />
            <Analytics />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </Layout>
  );
}
