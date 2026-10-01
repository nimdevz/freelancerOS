import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// 1. Users
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    avatarUrl: text('avatar_url'),
    role: text('role').notNull().default('owner'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_users_email').on(table.email),
  ],
);

// 2. Organizations / Workspaces
export const organizations = sqliteTable(
  'organizations',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    currency: text('currency').notNull().default('USD'),
    timezone: text('timezone').notNull().default('America/New_York'),
    defaultPaymentTermsDays: integer('default_payment_terms_days').notNull().default(14),
    taxRatePercent: real('tax_rate_percent').notNull().default(0),
    plan: text('plan').notNull().default('pro'),
    freelancerType: text('freelancer_type'),
    hourlyRate: real('hourly_rate').notNull().default(125),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_organizations_slug').on(table.slug),
  ],
);

// 3. Organization Members
export const organizationMembers = sqliteTable(
  'organization_members',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('owner'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_org_members_org').on(table.organizationId),
    index('idx_org_members_user').on(table.userId),
  ],
);
