"use client";

import { createContext, useContext, useTransition } from "react";
import { switchOrganization } from "@/lib/services/organization";

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

type OrganizationContextType = {
  organization: Organization;
  memberships: OrganizationMembership[];
  switchOrg: (organizationId: string) => Promise<void>;
  isSwitching: boolean;
  canManage: boolean;
  isOwner: boolean;
};

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({
  children,
  organization,
  memberships,
}: {
  children: React.ReactNode;
  organization: Organization;
  memberships: OrganizationMembership[];
}) {
  const [isSwitching, startTransition] = useTransition();

  const switchOrg = async (organizationId: string) => {
    startTransition(async () => {
      await switchOrganization(organizationId);
    });
  };

  const canManage =
    organization.role === "owner" || organization.role === "admin";
  const isOwner = organization.role === "owner";

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        memberships,
        switchOrg,
        isSwitching,
        canManage,
        isOwner,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
}
