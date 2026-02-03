import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { organizations, organizationMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const SELECTED_ORG_COOKIE = "selected_organization_id";

export type Organization = {
  id: string;
  name: string;
  role: string;
};

export type OrganizationMembership = {
  organizationId: string;
  organizationName: string;
  role: string;
};

/**
 * Get the currently selected organization from cookie
 */
export async function getSelectedOrganizationId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SELECTED_ORG_COOKIE)?.value ?? null;
}

/**
 * Get the current organization with role for the authenticated user
 */
export async function getCurrentOrganization(
  userId: string
): Promise<Organization | null> {
  const orgId = await getSelectedOrganizationId();
  if (!orgId) return null;

  const result = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      role: organizationMembers.role,
    })
    .from(organizations)
    .innerJoin(
      organizationMembers,
      and(
        eq(organizationMembers.organizationId, organizations.id),
        eq(organizationMembers.userId, userId)
      )
    )
    .where(eq(organizations.id, orgId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get all organizations the user is a member of
 */
export async function getUserOrganizations(
  userId: string
): Promise<OrganizationMembership[]> {
  const result = await db
    .select({
      organizationId: organizations.id,
      organizationName: organizations.name,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizations.id, organizationMembers.organizationId)
    )
    .where(eq(organizationMembers.userId, userId));

  return result;
}

/**
 * Check if user has permission (is owner or admin)
 */
export function canManageOrganization(role: string): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Check if user is owner
 */
export function isOrganizationOwner(role: string): boolean {
  return role === "owner";
}
