"use server";

import { db } from "@/lib/db";
import { invitations, organizationMembers } from "@/lib/db/schema";
import {
  sendWorkosInvitation,
  revokeWorkosInvitation,
  listOrganizationMemberships,
  deleteOrganizationMembership,
  updateOrganizationMembership,
} from "@/lib/services/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { getSelectedOrganizationId } from "@/lib/services/get-organization";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InvitationRole = "admin" | "member";

export async function sendInvitation(email: string, role: InvitationRole) {
  const { user } = await withAuth({ ensureSignedIn: true });
  const organizationId = await getSelectedOrganizationId();

  if (!organizationId) {
    throw new Error("No organization selected");
  }

  // Verify user has permission to invite (owner or admin)
  const membership = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, user.id),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  if (
    membership.length === 0 ||
    (membership[0]?.role !== "owner" && membership[0]?.role !== "admin")
  ) {
    throw new Error("You do not have permission to invite members");
  }

  // Create invitation via WorkOS
  const invitation = await sendWorkosInvitation({
    email,
    organizationId,
    roleSlug: role,
    expiresInDays: 7,
  });

  // Sync invitation to database
  await db.insert(invitations).values({
    id: invitation.id,
    email: invitation.email,
    organizationId,
    invitedByUserId: user.id,
    status: "pending",
    expiresAt: invitation.expiresAt ? new Date(invitation.expiresAt) : null,
  });

  revalidatePath("/settings/members");

  return { success: true, invitationId: invitation.id };
}

export async function revokeInvitation(invitationId: string) {
  const { user } = await withAuth({ ensureSignedIn: true });
  const organizationId = await getSelectedOrganizationId();

  if (!organizationId) {
    throw new Error("No organization selected");
  }

  // Verify user has permission to revoke (owner or admin)
  const membership = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, user.id),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  if (
    membership.length === 0 ||
    (membership[0]?.role !== "owner" && membership[0]?.role !== "admin")
  ) {
    throw new Error("You do not have permission to revoke invitations");
  }

  // Verify invitation belongs to this organization
  const invitation = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.id, invitationId),
        eq(invitations.organizationId, organizationId)
      )
    )
    .limit(1);

  if (invitation.length === 0) {
    throw new Error("Invitation not found");
  }

  // Revoke invitation via WorkOS
  await revokeWorkosInvitation(invitationId);

  // Update invitation status in database
  await db
    .update(invitations)
    .set({ status: "revoked", updatedAt: new Date() })
    .where(eq(invitations.id, invitationId));

  revalidatePath("/settings/members");

  return { success: true };
}

export async function getOrganizationInvitations() {
  const { user } = await withAuth({ ensureSignedIn: true });
  const organizationId = await getSelectedOrganizationId();

  if (!organizationId) {
    return [];
  }

  // Verify user is a member
  const membership = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, user.id),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  if (membership.length === 0) {
    return [];
  }

  // Get pending invitations
  const pendingInvitations = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.organizationId, organizationId),
        eq(invitations.status, "pending")
      )
    );

  return pendingInvitations;
}

export async function removeMember(memberUserId: string) {
  const { user } = await withAuth({ ensureSignedIn: true });
  const organizationId = await getSelectedOrganizationId();

  if (!organizationId) {
    throw new Error("No organization selected");
  }

  if (user.id === memberUserId) {
    throw new Error("You cannot remove yourself from the organization");
  }

  // Verify current user has permission (owner or admin)
  const currentMembership = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, user.id),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  if (
    currentMembership.length === 0 ||
    (currentMembership[0]?.role !== "owner" &&
      currentMembership[0]?.role !== "admin")
  ) {
    throw new Error("You do not have permission to remove members");
  }

  // Get the member to be removed
  const targetMembership = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, memberUserId),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  if (targetMembership.length === 0) {
    throw new Error("Member not found");
  }

  // Prevent removing owner
  if (targetMembership[0]?.role === "owner") {
    throw new Error("Cannot remove the organization owner");
  }

  // Admins can only remove members, not other admins
  if (
    currentMembership[0]?.role === "admin" &&
    targetMembership[0]?.role === "admin"
  ) {
    throw new Error("Admins cannot remove other admins");
  }

  // Find and delete the WorkOS organization membership
  const memberships = await listOrganizationMemberships({
    userId: memberUserId,
    organizationId,
  });

  if (memberships.data.length > 0) {
    await deleteOrganizationMembership(memberships.data[0]?.id ?? "");
  }

  // Remove from database
  await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, memberUserId),
        eq(organizationMembers.organizationId, organizationId)
      )
    );

  revalidatePath("/settings/members");

  return { success: true };
}

export async function updateMemberRole(
  memberUserId: string,
  newRole: "admin" | "member"
) {
  const { user } = await withAuth({ ensureSignedIn: true });
  const organizationId = await getSelectedOrganizationId();

  if (!organizationId) {
    throw new Error("No organization selected");
  }

  // Only owners can change roles
  const currentMembership = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, user.id),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  if (
    currentMembership.length === 0 ||
    currentMembership[0]?.role !== "owner"
  ) {
    throw new Error("Only owners can change member roles");
  }

  // Get the target member
  const targetMembership = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, memberUserId),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  if (targetMembership.length === 0) {
    throw new Error("Member not found");
  }

  if (targetMembership[0]?.role === "owner") {
    throw new Error("Cannot change owner role");
  }

  // Update in database
  await db
    .update(organizationMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(organizationMembers.userId, memberUserId),
        eq(organizationMembers.organizationId, organizationId)
      )
    );

  // Update in WorkOS
  const memberships = await listOrganizationMemberships({
    userId: memberUserId,
    organizationId,
  });

  if (memberships.data.length > 0) {
    await updateOrganizationMembership(memberships.data[0]?.id ?? "", {
      roleSlug: newRole,
    });
  }

  revalidatePath("/settings/members");

  return { success: true };
}

export async function updateInvitationStatus(
  invitationId: string,
  status: "pending" | "accepted" | "revoked"
): Promise<void> {
  await db
    .update(invitations)
    .set({ status, updatedAt: new Date() })
    .where(eq(invitations.id, invitationId));
}
