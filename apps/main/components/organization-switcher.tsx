"use client";

import { useOrganization } from "@/lib/organization-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Check, Buildings } from "@phosphor-icons/react";

export function OrganizationSwitcher() {
  const { organization, memberships, switchOrg, isSwitching } =
    useOrganization();

  if (memberships.length <= 1) {
    return (
      <SidebarMenuButton
        size="sm"
        className="size-6 p-0 justify-center bg-transparent hover:bg-transparent rounded-none"
        tooltip={organization.name}
      >
        <Buildings className="size-4" />
      </SidebarMenuButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="sm"
          className="size-6 p-0 justify-center bg-transparent hover:bg-transparent data-[state=open]:bg-transparent rounded-none"
          tooltip={organization.name}
        >
          <Buildings className="size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-52 rounded-md"
            side="bottom"
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
