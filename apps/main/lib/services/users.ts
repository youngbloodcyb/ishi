"use server";

import { db } from "@/lib/db";
import { users, organizations, organizationMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function upsertUser(params: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}): Promise<void> {
  await db
    .insert(users)
    .values({
      id: params.id,
      email: params.email,
      firstName: params.firstName ?? null,
      lastName: params.lastName ?? null,
      profilePictureUrl: params.profilePictureUrl ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: params.email,
        firstName: params.firstName ?? null,
        lastName: params.lastName ?? null,
        profilePictureUrl: params.profilePictureUrl ?? null,
        updatedAt: new Date(),
      },
    });
}

export async function insertUserIfNotExists(params: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
  selectedOrganizationId?: string;
}): Promise<void> {
  await db
    .insert(users)
    .values({
      id: params.id,
      email: params.email,
      firstName: params.firstName ?? null,
      lastName: params.lastName ?? null,
      profilePictureUrl: params.profilePictureUrl ?? null,
      selectedOrganizationId: params.selectedOrganizationId ?? null,
    })
    .onConflictDoNothing();
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function updateUserSelectedOrganization(
  userId: string,
  organizationId: string
): Promise<void> {
  await db
    .update(users)
    .set({ selectedOrganizationId: organizationId })
    .where(eq(users.id, userId));
}

export async function getUserMemberships(userId: string) {
  return db
    .select({
      organizationId: organizationMembers.organizationId,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId));
}

export async function getUserMembership(userId: string, organizationId: string) {
  const [membership] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId)
      )
    )
    .limit(1);

  return membership ?? null;
}

export async function createOrganization(params: {
  id: string;
  name: string;
}): Promise<void> {
  await db
    .insert(organizations)
    .values({
      id: params.id,
      name: params.name,
    })
    .onConflictDoNothing();
}

export async function createOrganizationMembership(params: {
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
}): Promise<void> {
  await db
    .insert(organizationMembers)
    .values({
      userId: params.userId,
      organizationId: params.organizationId,
      role: params.role,
    })
    .onConflictDoNothing();
}

export async function deleteOrganizationMembership(
  userId: string,
  organizationId: string
): Promise<void> {
  await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId)
      )
    );
}

export async function getOrganizationMembers(organizationId: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profilePictureUrl: users.profilePictureUrl,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(users.id, organizationMembers.userId))
    .where(eq(organizationMembers.organizationId, organizationId));
}
