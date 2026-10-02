import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';
import { projects } from './projects';

// 27. Project Milestones
export const projectMilestones = sqliteTable(
  'project_milestones',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    dueDate: text('due_date').notNull(),
    status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed'
    paymentAmount: real('payment_amount').default(0),
    invoiceId: text('invoice_id'),
    orderIndex: integer('order_index').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_milestones_org').on(table.organizationId),
    index('idx_milestones_project').on(table.projectId),
    index('idx_milestones_status').on(table.status),
  ],
);
