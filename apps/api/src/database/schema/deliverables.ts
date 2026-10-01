import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';
import { projects } from './projects';

// 15. Deliverables
export const deliverables = sqliteTable(
  'deliverables',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('client_review'),
    currentVersion: text('current_version').notNull().default('V1'),
    includedRevisions: integer('included_revisions').notNull().default(2),
    approvedAt: text('approved_at'),
    approvedBy: text('approved_by'),
    deliveredAt: text('delivered_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_deliverables_org').on(table.organizationId),
    index('idx_deliverables_project').on(table.projectId),
    index('idx_deliverables_status').on(table.status),
  ],
);

// 16. Deliverable Versions
export const deliverableVersions = sqliteTable(
  'deliverable_versions',
  {
    id: text('id').primaryKey(),
    deliverableId: text('deliverable_id')
      .notNull()
      .references(() => deliverables.id, { onDelete: 'cascade' }),
    versionNumber: text('version_number').notNull(),
    fileUrl: text('file_url'),
    fileName: text('file_name'),
    fileSize: integer('file_size'),
    notes: text('notes'),
    status: text('status').notNull().default('client_review'),
    uploadedAt: text('uploaded_at').notNull(),
  },
  (table) => [
    index('idx_deliv_versions_deliv').on(table.deliverableId),
  ],
);

// 17. Feedback Items
export const feedbackItems = sqliteTable(
  'feedback_items',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    deliverableId: text('deliverable_id')
      .notNull()
      .references(() => deliverables.id, { onDelete: 'cascade' }),
    versionNumber: text('version_number').notNull(),
    authorName: text('author_name').notNull(),
    authorRole: text('author_role').notNull().default('client'),
    content: text('content').notNull(),
    timestampOrSection: text('timestamp_or_section'),
    status: text('status').notNull().default('open'),
    createdAt: text('created_at').notNull(),
    resolvedAt: text('resolved_at'),
  },
  (table) => [
    index('idx_feedback_org').on(table.organizationId),
    index('idx_feedback_deliv').on(table.deliverableId),
  ],
);

// 18. Revisions
export const revisions = sqliteTable(
  'revisions',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    deliverableId: text('deliverable_id')
      .notNull()
      .references(() => deliverables.id, { onDelete: 'cascade' }),
    revisionNumber: integer('revision_number').notNull(),
    maxIncluded: integer('max_included').notNull(),
    isScopeExceeded: integer('is_scope_exceeded').notNull().default(0),
    requestDetails: text('request_details').notNull(),
    requestedBy: text('requested_by').notNull(),
    requestedAt: text('requested_at').notNull(),
    status: text('status').notNull().default('pending'),
  },
  (table) => [
    index('idx_revisions_org').on(table.organizationId),
    index('idx_revisions_deliv').on(table.deliverableId),
  ],
);

// 19. Approvals
export const approvals = sqliteTable(
  'approvals',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    deliverableId: text('deliverable_id')
      .notNull()
      .references(() => deliverables.id, { onDelete: 'cascade' }),
    versionNumber: text('version_number').notNull(),
    status: text('status').notNull().default('pending'),
    requestedAt: text('requested_at').notNull(),
    decidedAt: text('decided_at'),
    decidedBy: text('decided_by'),
    feedbackComments: text('feedback_comments'),
  },
  (table) => [
    index('idx_approvals_org').on(table.organizationId),
    index('idx_approvals_deliv').on(table.deliverableId),
  ],
);
