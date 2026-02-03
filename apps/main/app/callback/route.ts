import { handleAuth } from "@workos-inc/authkit-nextjs";
import { cookies } from "next/headers";
import {
  createOrganization as createWorkosOrganization,
  createOrganizationMembership as createWorkosMembership,
  listOrganizationMembershipsByUserId,
  getOrganization as getWorkosOrganization,
} from "@/lib/services/workos";
import {
  upsertUser,
  getUserMemberships,
  getUserById,
  updateUserSelectedOrganization,
  createOrganization,
  createOrganizationMembership,
} from "@/lib/services/users";
import { ROUTES } from "@/lib/routes";

const SELECTED_ORG_COOKIE = "selected_organization_id";

export const GET = handleAuth({
  returnPathname: ROUTES.HOME,
  onSuccess: async ({ user }) => {
    try {
      // Upsert user to database
      await upsertUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePictureUrl: user.profilePictureUrl,
      });

      // Check LOCAL database for existing memberships
      let existingMemberships = await getUserMemberships(user.id);

      // If no local memberships, check WorkOS API as fallback (handles race condition with webhooks)
      if (existingMemberships.length === 0) {
        const workosMemberships = await listOrganizationMembershipsByUserId(
          user.id
        );

        // Sync any WorkOS memberships to local DB
        for (const membership of workosMemberships.data) {
          // Fetch and sync the organization
          const org = await getWorkosOrganization(membership.organizationId);
          await createOrganization({
            id: org.id,
            name: org.name,
          });

          // Sync the membership
          await createOrganizationMembership({
            userId: user.id,
            organizationId: membership.organizationId,
            role:
              (membership.role?.slug as "owner" | "admin" | "member") ??
              "member",
          });
        }

        // Re-fetch local memberships after sync
        existingMemberships = await getUserMemberships(user.id);
      }

      let selectedOrgId: string;

      if (existingMemberships.length === 0) {
        // User has no organizations anywhere - create one for them
        const orgName = user.email.split("@")[0] + "'s Organization";

        // Create organization in WorkOS
        const newOrg = await createWorkosOrganization(orgName);

        // Sync organization to database
        await createOrganization({
          id: newOrg.id,
          name: newOrg.name,
        });

        // Create membership in WorkOS (without roleSlug - uses default)
        await createWorkosMembership({
          organizationId: newOrg.id,
          userId: user.id,
        });

        // Sync membership to database with owner role
        await createOrganizationMembership({
          userId: user.id,
          organizationId: newOrg.id,
          role: "owner",
        });

        selectedOrgId = newOrg.id;
      } else {
        // User has memberships - get their selected org or use first one
        const existingUser = await getUserById(user.id);
        const currentSelectedOrgId = existingUser?.selectedOrganizationId;

        if (currentSelectedOrgId) {
          // Verify the selected org is still valid
          const stillMember = existingMemberships.some(
            (m) => m.organizationId === currentSelectedOrgId
          );
          if (stillMember) {
            selectedOrgId = currentSelectedOrgId;
          } else {
            selectedOrgId = existingMemberships[0]?.organizationId ?? "";
          }
        } else {
          selectedOrgId = existingMemberships[0]?.organizationId ?? "";
        }
      }

      // Update user's selected organization in database
      if (selectedOrgId) {
        await updateUserSelectedOrganization(user.id, selectedOrgId);

        // Set selected organization cookie
        const cookieStore = await cookies();
        cookieStore.set(SELECTED_ORG_COOKIE, selectedOrgId, {
          httpOnly: true,
          // eslint-disable-next-line turbo/no-undeclared-env-vars
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      }
    } catch (error) {
      console.error("Error in onSuccess callback:", error);
      // Don't throw - allow sign-in to complete even if org setup fails
      // The user can be handled on next sign-in or via a setup page
    }
  },
});
