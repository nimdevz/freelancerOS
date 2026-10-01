import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';

// 6. Leads
export const leads = sqliteTable(
  'leads',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    clientName: text('client_name').notNull(),
    company: text('company'),
    email: text('email'),
    phone: text('phone'),
    stage: text('stage').notNull().default('new'),
    value: real('value').notNull().default(0),
    currency: text('currency').notNull().default('USD'),
    probabilityPercent: integer('probability_percent').notNull().default(50),
    expectedCloseDate: text('expected_close_date'),
    nextAction: text('next_action'),
    nextActionDate: text('next_action_date'),
    source: text('source'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_leads_org').on(table.organizationId),
    index('idx_leads_stage').on(table.stage),
  ],
);
