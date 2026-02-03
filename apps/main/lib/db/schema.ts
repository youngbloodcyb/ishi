import {
  pgTable,
  uuid,
  timestamp,
  text,
  varchar,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Organizations table - synced from WorkOS
 */
export const organizations = pgTable("organizations", {
  id: varchar("id", { length: 255 }).primaryKey(), // WorkOS org ID
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

/**
 * Users table - synced from WorkOS on login
 */
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // WorkOS user ID
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profilePictureUrl: text("profile_picture_url"),
  selectedOrganizationId: varchar("selected_organization_id", {
    length: 255,
  }).references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

/**
 * User-Organization membership
 * Roles: owner (creator), admin (can invite/manage), member (basic access)
 * Each user can only have one membership per organization
 */
export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    organizationId: varchar("organization_id", { length: 255 })
      .references(() => organizations.id)
      .notNull(),
    role: varchar("role", { length: 50 }).default("member").notNull(), // "owner" | "admin" | "member"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [unique().on(table.userId, table.organizationId)]
);

/**
 * Invitations table - tracks invitations sent via WorkOS
 */
export const invitations = pgTable("invitations", {
  id: varchar("id", { length: 255 }).primaryKey(), // WorkOS invitation ID
  email: varchar("email", { length: 255 }).notNull(),
  organizationId: varchar("organization_id", { length: 255 })
    .references(() => organizations.id)
    .notNull(),
  invitedByUserId: varchar("invited_by_user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // "pending" | "accepted" | "revoked" | "expired"
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ============================================
// Type Exports for queries
// ============================================

export type Organization = typeof organizations.$inferSelect;
export type User = typeof users.$inferSelect;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
