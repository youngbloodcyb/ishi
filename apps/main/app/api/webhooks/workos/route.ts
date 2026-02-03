import { NextRequest, NextResponse } from "next/server";
import {
  constructWebhookEvent,
  getOrganization as getWorkosOrganization,
  getWorkosUser,
} from "@/lib/services/workos";
import {
  upsertUser,
  insertUserIfNotExists,
  createOrganization,
  createOrganizationMembership,
  deleteOrganizationMembership,
} from "@/lib/services/users";
import { updateInvitationStatus } from "@/lib/services/invitations";

const WEBHOOK_SECRET = process.env.WORKOS_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error("WORKOS_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const sigHeader = request.headers.get("workos-signature");

  if (!sigHeader) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  let event;
  try {
    event = await constructWebhookEvent({
      payload,
      sigHeader,
      secret: WEBHOOK_SECRET,
    });
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    switch (event.event) {
      case "user.created":
      case "user.updated": {
        const userData = event.data;
        await upsertUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePictureUrl: userData.profilePictureUrl,
        });
        break;
      }

      case "organization.created":
      case "organization.updated": {
        const orgData = event.data;
        await createOrganization({
          id: orgData.id,
          name: orgData.name,
        });
        break;
      }

      case "organization_membership.created": {
        const membershipData = event.data;

        // Ensure organization exists in our DB
        const org = await getWorkosOrganization(membershipData.organizationId);
        await createOrganization({
          id: org.id,
          name: org.name,
        });

        // Ensure user exists in our DB
        const user = await getWorkosUser(membershipData.userId);
        await insertUserIfNotExists({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePictureUrl: user.profilePictureUrl,
        });

        // Create membership record
        await createOrganizationMembership({
          userId: membershipData.userId,
          organizationId: membershipData.organizationId,
          role: (membershipData.role?.slug as "owner" | "admin" | "member") ?? "member",
        });
        break;
      }

      case "organization_membership.deleted": {
        const membershipData = event.data;
        await deleteOrganizationMembership(
          membershipData.userId,
          membershipData.organizationId
        );
        break;
      }

      case "invitation.accepted": {
        const invitationData = event.data;
        await updateInvitationStatus(invitationData.id, "accepted");
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
