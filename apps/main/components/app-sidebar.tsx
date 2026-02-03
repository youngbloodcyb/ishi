"use client"

import * as React from "react"
import { House, Gear, SidebarSimple } from "@phosphor-icons/react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserDropdown } from "@/components/user-dropdown"
import { usePathname } from "next/navigation"
import { ROUTES } from "@/lib/routes"
import { useOrganization } from "@/lib/organization-context"
import { useTheme } from "next-themes"
import { Buildings, Moon, Sun } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check } from "@phosphor-icons/react"

const navItems = [
  {
    title: "Home",
    url: ROUTES.HOME,
    icon: House,
  },
  {
    title: "Settings",
    url: ROUTES.SETTINGS,
    icon: Gear,
  },
]

type AppSidebarProps = {
  userEmail: string;
};

function OrganizationSwitcherButton() {
  const { organization, memberships, switchOrg, isSwitching } = useOrganization();

  if (memberships.length <= 1) {
    return (
      <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/40 transition-colors cursor-default h-9 flex-1 min-w-0 text-sidebar-foreground/80">
        <Buildings className="size-4 shrink-0" />
        <span className="text-sm font-medium truncate min-w-0">{organization.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/40 transition-colors h-9 flex-1 min-w-0 text-left text-sidebar-foreground/80 hover:text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <Buildings className="size-4 shrink-0" />
          <span className="text-sm font-medium truncate min-w-0">{organization.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-52 rounded-lg"
        side="top"
        align="start"
        sideOffset={8}
      >
        {memberships.map((membership) => (
          <DropdownMenuItem
            key={membership.organizationId}
            onClick={() => {
              if (membership.organizationId !== organization.id) {
                switchOrg(membership.organizationId);
              }
            }}
            disabled={isSwitching}
            className="gap-2"
          >
            <Buildings className="size-3.5 shrink-0 opacity-50" />
            <span className="truncate flex-1">{membership.organizationName}</span>
            {membership.organizationId === organization.id && (
              <Check className="size-3.5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/40 transition-colors h-9 flex-1 min-w-0 text-left text-sidebar-foreground/60 hover:text-sidebar-foreground">
        <Sun className="size-4 shrink-0" />
        <span className="text-xs truncate">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/40 transition-colors h-9 flex-1 min-w-0 text-left text-sidebar-foreground/60 hover:text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
    >
      {theme === "dark" ? (
        <Sun className="size-4 shrink-0" />
      ) : (
        <Moon className="size-4 shrink-0" />
      )}
      <span className="text-xs truncate">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()

  const isActive = (url: string) => {
    if (url === ROUTES.HOME) return pathname === ROUTES.HOME
    return pathname.startsWith(url)
  }

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={ROUTES.HOME}>
                {state === "expanded" ? (
                  <>
                    <Image
                      src="/logo_light-mode.svg"
                      alt="App"
                      width={100}
                      height={27}
                      className="dark:hidden"
                      priority
                    />
                    <Image
                      src="/logo_dark-mode.svg"
                      alt="App"
                      width={100}
                      height={27}
                      className="hidden dark:block"
                      priority
                    />
                  </>
                ) : (
                  <Image
                    src="/icon.svg"
                    alt="App"
                    width={24}
                    height={24}
                    priority
                  />
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {state === "collapsed" ? (
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="flex items-center justify-center rounded-lg hover:bg-sidebar-accent/40 transition-colors cursor-pointer size-8 text-sidebar-foreground/80 hover:text-sidebar-foreground">
              <UserDropdown email={userEmail} />
            </div>
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center rounded-lg hover:bg-sidebar-accent/40 transition-colors size-8 text-sidebar-foreground/80 hover:text-sidebar-foreground"
            >
              <SidebarSimple className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 w-full">
              <OrganizationSwitcherButton />
              <div className="flex items-center justify-center rounded-lg hover:bg-sidebar-accent/40 transition-colors cursor-pointer size-9 text-sidebar-foreground/80 hover:text-sidebar-foreground shrink-0">
                <UserDropdown email={userEmail} />
              </div>
            </div>
            <div className="flex items-center gap-1 pt-2 border-t border-sidebar-border/30">
              <ThemeToggleButton />
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center rounded-lg hover:bg-sidebar-accent/40 transition-colors size-9 shrink-0 text-sidebar-foreground/80 hover:text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <SidebarSimple className="size-4" />
              </button>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
