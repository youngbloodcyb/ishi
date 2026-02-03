"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  removeMember,
  updateMemberRole,
  revokeInvitation,
} from "@/lib/services/invitations";
import { useOrganization } from "@/lib/organization-context";
import { DotsThreeIcon, XIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

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

type MembersListProps = {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
};

export function MembersList({
  members,
  invitations,
  currentUserId,
}: MembersListProps) {
  const { canManage, isOwner } = useOrganization();
  const [isPending, startTransition] = useTransition();

  const handleRemoveMember = (userId: string, name: string) => {
    startTransition(async () => {
      try {
        await removeMember(userId);
        toast.success(`${name} has been removed`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove member"
        );
      }
    });
  };

  const handleUpdateRole = (userId: string, newRole: "admin" | "member") => {
    startTransition(async () => {
      try {
        await updateMemberRole(userId, newRole);
        toast.success(`Role updated to ${newRole}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update role"
        );
      }
    });
  };

  const handleRevokeInvitation = (invitationId: string, email: string) => {
    startTransition(async () => {
      try {
        await revokeInvitation(invitationId);
        toast.success(`Invitation to ${email} has been revoked`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to revoke invitation"
        );
      }
    });
  };

  const getInitials = (
    firstName: string | null,
    lastName: string | null,
    email: string
  ) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getName = (
    firstName: string | null,
    lastName: string | null,
    email: string
  ) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    return email;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border/40 bg-muted/20">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground ml-2">Team Members ({members.length})</h3>
        </div>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead className="pl-6 h-10 text-xs font-medium uppercase tracking-wider text-muted-foreground">Member</TableHead>
                <TableHead className="h-10 text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</TableHead>
                {canManage && <TableHead className="w-12 h-10"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/40 transition-colors border-b border-border/40 last:border-b-0">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border/40">
                        <AvatarImage
                          src={member.profilePictureUrl ?? undefined}
                        />
                        <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                          {getInitials(
                            member.firstName,
                            member.lastName,
                            member.email
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {getName(
                            member.firstName,
                            member.lastName,
                            member.email
                          )}
                          {member.id === currentUserId && (
                            <span className="text-muted-foreground ml-1 font-normal text-xs">
                              (you)
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs font-normal">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant={getRoleBadgeVariant(member.role)} className="rounded-full px-2.5 py-0.5 font-medium border-border/40">
                      {member.role}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="py-4 pr-4">
                      {member.id !== currentUserId && member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={isPending}
                              className="h-8 w-8 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            >
                              <DotsThreeIcon weight="bold" className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40 bg-card/95 backdrop-blur-xl shadow-lg">
                            {isOwner && (
                              <>
                                {member.role === "member" ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRole(member.id, "admin")
                                    }
                                    className="rounded-lg focus:bg-muted/50 cursor-pointer"
                                  >
                                    Make admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRole(member.id, "member")
                                    }
                                    className="rounded-lg focus:bg-muted/50 cursor-pointer"
                                  >
                                    Make member
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-border/40" />
                              </>
                            )}
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                handleRemoveMember(
                                  member.id,
                                  getName(
                                    member.firstName,
                                    member.lastName,
                                    member.email
                                  )
                                )
                              }
                              className="rounded-lg focus:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer"
                            >
                              Remove member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {pendingInvitations.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
          <div className="p-4 border-b border-border/40 bg-muted/20">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground ml-2">
              Pending Invitations ({pendingInvitations.length})
            </h3>
          </div>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/40">
                  <TableHead className="pl-6 h-10 text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</TableHead>
                  <TableHead className="h-10 text-xs font-medium uppercase tracking-wider text-muted-foreground">Sent</TableHead>
                  {canManage && <TableHead className="w-12 h-10"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((invitation) => (
                  <TableRow key={invitation.id} className="hover:bg-muted/40 transition-colors border-b border-border/40 last:border-b-0">
                    <TableCell className="pl-6 py-4 text-sm font-medium">{invitation.email}</TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </TableCell>
                    {canManage && (
                      <TableCell className="py-4 pr-4">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isPending}
                          onClick={() =>
                            handleRevokeInvitation(invitation.id, invitation.email)
                          }
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
