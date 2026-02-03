"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, organizationMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { revalidatePath } from "next/cache";

const SELECTED_ORG_COOKIE = "selected_organization_id";

export async function switchOrganization(organizationId: string) {
  const { user } = await withAuth({ ensureSignedIn: true });

  // Verify user is a member of this organization
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
    throw new Error("You are not a member of this organization");
  }

  // Update user's selected organization in database
  await db
    .update(users)
    .set({ selectedOrganizationId: organizationId })
    .where(eq(users.id, user.id));

  // Update cookie
  const cookieStore = await cookies();
  cookieStore.set(SELECTED_ORG_COOKIE, organizationId, {
    httpOnly: true,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  revalidatePath("/", "layout");

  return { success: true };
}
