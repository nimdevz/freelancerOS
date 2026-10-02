import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';
import { projects } from './projects';

// 28. Project Scopes
export const projectScopes = sqliteTable(
  'project_scopes',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    includedItems: text('included_items').default('[]'),
    excludedItems: text('excluded_items').default('[]'),
    limitations: text('limitations'),
    revisionAllowance: integer('revision_allowance').notNull().default(2),
    deliveryAssumptions: text('delivery_assumptions'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_scopes_org').on(table.organizationId),
    index('idx_scopes_project').on(table.projectId),
  ],
);

// 29. Scope Changes (Change Orders)
export const scopeChanges = sqliteTable(
  'scope_changes',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    requestDetails: text('request_details').notNull(),
    requestedBy: text('requested_by').notNull(),
    requestedDate: text('requested_date').notNull(),
    estimatedHours: real('estimated_hours').default(0),
    additionalCost: real('additional_cost').notNull().default(0),
    currency: text('currency').notNull().default('USD'),
    status: text('status').notNull().default('requested'), // 'requested' | 'quoted' | 'approved' | 'rejected' | 'completed'
    approvedAt: text('approved_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_scope_changes_org').on(table.organizationId),
    index('idx_scope_changes_project').on(table.projectId),
    index('idx_scope_changes_status').on(table.status),
  ],
);
