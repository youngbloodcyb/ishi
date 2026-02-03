"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

interface SidebarWrapperProps {
  children: React.ReactNode;
  userEmail: string;
}

export function SidebarWrapper({ children, userEmail }: SidebarWrapperProps) {
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith("/onboarding");

  if (isOnboarding) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <SidebarProvider>
      <AppSidebar userEmail={userEmail} />
      <SidebarInset className="bg-background">
        <main className="flex-1 w-full min-w-0 p-4 md:p-6 overflow-x-hidden relative">
          <div 
            className="absolute inset-0 grid-pattern pointer-events-none mask-[radial-gradient(ellipse_at_center,black,transparent_90%)] opacity-30 dark:opacity-20" 
            style={{ backgroundSize: '40px 40px' }}
          />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
