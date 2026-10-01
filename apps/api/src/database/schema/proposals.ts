import { sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';
import { clients } from './clients';
import { projects } from './projects';

// 10. Proposals
export const proposals = sqliteTable(
  'proposals',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    projectId: text('project_id').references(() => projects.id),
    proposalNumber: text('proposal_number').notNull(),
    title: text('title').notNull(),
    status: text('status').notNull().default('draft'),
    validUntil: text('valid_until').notNull(),
    currency: text('currency').notNull().default('USD'),
    subtotal: real('subtotal').notNull().default(0),
    discountPercent: real('discount_percent').notNull().default(0),
    discountAmount: real('discount_amount').notNull().default(0),
    taxPercent: real('tax_percent').notNull().default(0),
    taxAmount: real('tax_amount').notNull().default(0),
    totalAmount: real('total_amount').notNull().default(0),
    terms: text('terms'),
    notes: text('notes'),
    sentAt: text('sent_at'),
    acceptedAt: text('accepted_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_proposals_org').on(table.organizationId),
    index('idx_proposals_client').on(table.clientId),
    index('idx_proposals_status').on(table.status),
  ],
);

// 11. Proposal Items
export const proposalItems = sqliteTable(
  'proposal_items',
  {
    id: text('id').primaryKey(),
    proposalId: text('proposal_id')
      .notNull()
      .references(() => proposals.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    quantity: real('quantity').notNull().default(1),
    unitPrice: real('unit_price').notNull().default(0),
    amount: real('amount').notNull().default(0),
  },
  (table) => [
    index('idx_proposal_items_proposal').on(table.proposalId),
  ],
);

// 12. Quotes
export const quotes = sqliteTable(
  'quotes',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    projectId: text('project_id').references(() => projects.id),
    quoteNumber: text('quote_number').notNull(),
    title: text('title').notNull(),
    status: text('status').notNull().default('draft'),
    validUntil: text('valid_until').notNull(),
    currency: text('currency').notNull().default('USD'),
    subtotal: real('subtotal').notNull().default(0),
    discountAmount: real('discount_amount').notNull().default(0),
    taxAmount: real('tax_amount').notNull().default(0),
    totalAmount: real('total_amount').notNull().default(0),
    paymentTerms: text('payment_terms'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_quotes_org').on(table.organizationId),
    index('idx_quotes_client').on(table.clientId),
  ],
);

// 13. Quote Items
export const quoteItems = sqliteTable(
  'quote_items',
  {
    id: text('id').primaryKey(),
    quoteId: text('quote_id')
      .notNull()
      .references(() => quotes.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    quantity: real('quantity').notNull().default(1),
    unitPrice: real('unit_price').notNull().default(0),
    amount: real('amount').notNull().default(0),
  },
  (table) => [
    index('idx_quote_items_quote').on(table.quoteId),
  ],
);

// 14. Contracts
export const contracts = sqliteTable(
  'contracts',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    projectId: text('project_id').references(() => projects.id),
    title: text('title').notNull(),
    status: text('status').notNull().default('draft'),
    startDate: text('start_date').notNull(),
    endDate: text('end_date'),
    terms: text('terms').notNull(),
    signedAt: text('signed_at'),
    signedBy: text('signed_by'),
    attachmentUrl: text('attachment_url'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_contracts_org').on(table.organizationId),
    index('idx_contracts_client').on(table.clientId),
  ],
);
