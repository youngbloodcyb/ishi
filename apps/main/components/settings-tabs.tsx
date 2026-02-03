"use client";

import { Users, User } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MembersList } from "@/components/members-list";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Member = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
  role: string;
};

type Invitation = {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
};

interface SettingsTabsProps {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
  canManage: boolean;
}

export function SettingsTabs({
  members,
  invitations,
  currentUserId,
  canManage,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="team" className="gap-8">
      <div className="flex items-center justify-between">
        <TabsList className="bg-muted/50 p-1 rounded-lg h-10 border border-border/40">
          <TabsTrigger
            value="team"
            className="rounded-md px-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            <Users className="mr-2 h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="rounded-md px-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        {canManage && <InviteMemberDialog />}
      </div>

      <TabsContent value="team" className="mt-0 space-y-6">
        <MembersList
          members={members}
          invitations={invitations}
          currentUserId={currentUserId}
        />
      </TabsContent>

      <TabsContent value="account" className="mt-0">
        <Card className="rounded-xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight">Account Settings</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Manage your personal account settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border/40">
              Account settings coming soon.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
