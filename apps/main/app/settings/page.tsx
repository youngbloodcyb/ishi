import { withAuth } from "@workos-inc/authkit-nextjs";
import {
  getSelectedOrganizationId,
  canManageOrganization,
} from "@/lib/services/get-organization";
import {
  getUserMembership,
  getOrganizationMembers,
} from "@/lib/services/users";
import { getOrganizationInvitations } from "@/lib/services/invitations";
import { PageShell, PageHeader } from "@/components/page-shell";
import { SettingsTabs } from "@/components/settings-tabs";

export default async function SettingsPage() {
  const { user } = await withAuth({ ensureSignedIn: true });
  const organizationId = await getSelectedOrganizationId();

  if (!organizationId) {
    return <div>No organization selected</div>;
  }

  // Get current user's role
  const currentMembership = await getUserMembership(user.id, organizationId);

  const canManage = currentMembership
    ? canManageOrganization(currentMembership.role)
    : false;

  // Get all members of the organization
  const members = await getOrganizationMembers(organizationId);

  // Get pending invitations
  const pendingInvitations = await getOrganizationInvitations();

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        subtitle="Manage your team, account, and integrations."
      />

      <SettingsTabs
        members={members}
        invitations={pendingInvitations}
        currentUserId={user.id}
        canManage={canManage}
      />
    </PageShell>
  );
}
