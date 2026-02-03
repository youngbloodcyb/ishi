"use client";

import { User, SignOut, GearSix } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import { logout } from "@/lib/services/auth";

type UserDropdownProps = {
  email: string;
};

export function UserDropdown({ email }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="sm"
          className="size-6 p-0 justify-center bg-transparent hover:bg-transparent data-[state=open]:bg-transparent rounded-none"
          tooltip={email}
        >
          <User className="size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-52 rounded-md"
        side="top"
        align="end"
        sideOffset={8}
      >
        <div className="px-2 py-1.5">
          <div className="text-xs font-medium">{email}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <GearSix className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>
          <SignOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
