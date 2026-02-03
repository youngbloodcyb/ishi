"use server";

import { workos } from "@/lib/workos";
import type {
  Organization,
  User,
  OrganizationMembership,
  Invitation,
} from "@workos-inc/node";

// Organization Operations

export async function createOrganization(name: string): Promise<Organization> {
  return workos.organizations.createOrganization({ name });
}

export async function getOrganization(
  organizationId: string
): Promise<Organization> {
  return workos.organizations.getOrganization(organizationId);
}

// User Operations

export async function createWorkosUser(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}): Promise<User> {
  return workos.userManagement.createUser({
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    emailVerified: params.emailVerified,
  });
}

export async function getWorkosUser(userId: string): Promise<User> {
  return workos.userManagement.getUser(userId);
}

export async function sendMagicAuthCode(email: string): Promise<void> {
  await workos.userManagement.createMagicAuth({ email });
}

// Invitation Operations

export async function sendWorkosInvitation(params: {
  email: string;
  organizationId: string;
  roleSlug: string;
  expiresInDays?: number;
}): Promise<Invitation> {
  return workos.userManagement.sendInvitation({
    email: params.email,
    organizationId: params.organizationId,
    roleSlug: params.roleSlug,
    expiresInDays: params.expiresInDays ?? 7,
  });
}

export async function revokeWorkosInvitation(
  invitationId: string
): Promise<void> {
  await workos.userManagement.revokeInvitation(invitationId);
}

// Organization Membership Operations

export async function createOrganizationMembership(params: {
  userId: string;
  organizationId: string;
  roleSlug?: string;
}): Promise<OrganizationMembership> {
  return workos.userManagement.createOrganizationMembership({
    userId: params.userId,
    organizationId: params.organizationId,
    roleSlug: params.roleSlug,
  });
}

export async function listOrganizationMembershipsByUserId(
  userId: string,
  organizationId?: string
): Promise<{ data: OrganizationMembership[] }> {
  return workos.userManagement.listOrganizationMemberships({
    userId,
    organizationId,
  });
}

export async function listOrganizationMemberships(params: {
  userId: string;
  organizationId?: string;
}): Promise<{ data: OrganizationMembership[] }> {
  return workos.userManagement.listOrganizationMemberships({
    userId: params.userId,
    organizationId: params.organizationId,
  });
}

export async function deleteOrganizationMembership(
  membershipId: string
): Promise<void> {
  await workos.userManagement.deleteOrganizationMembership(membershipId);
}

export async function updateOrganizationMembership(
  membershipId: string,
  params: { roleSlug: string }
): Promise<OrganizationMembership> {
  return workos.userManagement.updateOrganizationMembership(
    membershipId,
    params
  );
}

// Webhook Operations

export async function constructWebhookEvent(params: {
  payload: Record<string, unknown>;
  sigHeader: string;
  secret: string;
}) {
  return workos.webhooks.constructEvent({
    payload: params.payload,
    sigHeader: params.sigHeader,
    secret: params.secret,
  });
}
