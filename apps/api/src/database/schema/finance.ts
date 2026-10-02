import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';
import { clients } from './clients';
import { projects } from './projects';

// 20. Invoices
export const invoices = sqliteTable(
  'invoices',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id),
    projectId: text('project_id').references(() => projects.id),
    invoiceNumber: text('invoice_number').notNull(),
    title: text('title').notNull(),
    status: text('status').notNull().default('draft'),
    issueDate: text('issue_date').notNull(),
    dueDate: text('due_date').notNull(),
    currency: text('currency').notNull().default('USD'),
    subtotal: real('subtotal').notNull().default(0),
    discountPercent: real('discount_percent').notNull().default(0),
    discountAmount: real('discount_amount').notNull().default(0),
    taxPercent: real('tax_percent').notNull().default(0),
    taxAmount: real('tax_amount').notNull().default(0),
    totalAmount: real('total_amount').notNull().default(0),
    amountPaid: real('amount_paid').notNull().default(0),
    balanceDue: real('balance_due').notNull().default(0),
    paymentTerms: text('payment_terms'),
    notes: text('notes'),
    sentAt: text('sent_at'),
    paidAt: text('paid_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_invoices_org').on(table.organizationId),
    index('idx_invoices_client').on(table.clientId),
    index('idx_invoices_project').on(table.projectId),
    index('idx_invoices_status').on(table.status),
    index('idx_invoices_due_date').on(table.dueDate),
  ],
);

// 21. Invoice Items
export const invoiceItems = sqliteTable(
  'invoice_items',
  {
    id: text('id').primaryKey(),
    invoiceId: text('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    quantity: real('quantity').notNull().default(1),
    unitPrice: real('unit_price').notNull().default(0),
    amount: real('amount').notNull().default(0),
  },
  (table) => [
    index('idx_invoice_items_invoice').on(table.invoiceId),
  ],
);

// 22. Payments
export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    invoiceId: text('invoice_id')
      .notNull()
      .references(() => invoices.id),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id),
    amount: real('amount').notNull(),
    currency: text('currency').notNull().default('USD'),
    paymentMethod: text('payment_method').notNull().default('bank_transfer'),
    paymentDate: text('payment_date').notNull(),
    reference: text('reference'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_payments_org').on(table.organizationId),
    index('idx_payments_invoice').on(table.invoiceId),
    index('idx_payments_client').on(table.clientId),
  ],
);

// 23. Expenses
export const expenses = sqliteTable(
  'expenses',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    vendor: text('vendor').notNull(),
    category: text('category').notNull().default('software'),
    amount: real('amount').notNull(),
    currency: text('currency').notNull().default('USD'),
    projectId: text('project_id').references(() => projects.id),
    clientId: text('client_id').references(() => clients.id),
    receiptUrl: text('receipt_url'),
    notes: text('notes'),
    isReimbursable: integer('is_reimbursable').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_expenses_org').on(table.organizationId),
    index('idx_expenses_project').on(table.projectId),
    index('idx_expenses_client').on(table.clientId),
    index('idx_expenses_date').on(table.date),
  ],
);

// 24. Retainers
export const retainers = sqliteTable(
  'retainers',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    monthlyAmount: real('monthly_amount').notNull(),
    currency: text('currency').notNull().default('USD'),
    includedHours: real('included_hours').notNull().default(20),
    usedHours: real('used_hours').notNull().default(0),
    startDate: text('start_date').notNull(),
    renewalDate: text('renewal_date').notNull(),
    status: text('status').notNull().default('active'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_retainers_org').on(table.organizationId),
    index('idx_retainers_client').on(table.clientId),
  ],
);
