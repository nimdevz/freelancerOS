import { pgTable, text, integer, real, uuid } from 'drizzle-orm/pg-core';

// 1. Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('owner'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 2. Organizations / Workspaces
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey(),
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
});

// 3. Organization Members
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  role: text('role').notNull().default('owner'),
  createdAt: text('created_at').notNull(),
});

// 4. Clients
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  company: text('company'),
  email: text('email').notNull(),
  phone: text('phone'),
  website: text('website'),
  address: text('address'),
  currency: text('currency').notNull().default('USD'),
  notes: text('notes'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 5. Client Contacts
export const clientContacts = pgTable('client_contacts', {
  id: uuid('id').primaryKey(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  role: text('role'),
  isPrimary: integer('is_primary').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

// 6. Leads
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
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
});

// 7. Projects
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'),
  health: text('health').notNull().default('healthy'),
  healthReason: text('health_reason'),
  startDate: text('start_date').notNull(),
  deadline: text('deadline'),
  budget: real('budget').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  includedRevisions: integer('included_revisions').notNull().default(2),
  progressPercent: integer('progress_percent').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 8. Tasks
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  clientId: uuid('client_id').references(() => clients.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('todo'),
  priority: text('priority').notNull().default('medium'),
  dueDate: text('due_date'),
  estimatedHours: real('estimated_hours'),
  actualHours: real('actual_hours'),
  clientVisible: integer('client_visible').notNull().default(0),
  tags: text('tags').default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 9. Time Entries
export const timeEntries = pgTable('time_entries', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  taskId: uuid('task_id').references(() => tasks.id),
  description: text('description'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  billable: integer('billable').notNull().default(1),
  hourlyRate: real('hourly_rate').notNull().default(125),
  isRunning: integer('is_running').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 10. Proposals
export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  projectId: uuid('project_id').references(() => projects.id),
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
});

// 11. Proposal Items
export const proposalItems = pgTable('proposal_items', {
  id: uuid('id').primaryKey(),
  proposalId: uuid('proposal_id').notNull().references(() => proposals.id),
  description: text('description').notNull(),
  quantity: real('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull().default(0),
  amount: real('amount').notNull().default(0),
});

// 12. Quotes
export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  projectId: uuid('project_id').references(() => projects.id),
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
});

// 13. Quote Items
export const quoteItems = pgTable('quote_items', {
  id: uuid('id').primaryKey(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id),
  description: text('description').notNull(),
  quantity: real('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull().default(0),
  amount: real('amount').notNull().default(0),
});

// 14. Contracts
export const contracts = pgTable('contracts', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  projectId: uuid('project_id').references(() => projects.id),
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
});

// 15. Deliverables
export const deliverables = pgTable('deliverables', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
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
});

// 16. Deliverable Versions
export const deliverableVersions = pgTable('deliverable_versions', {
  id: uuid('id').primaryKey(),
  deliverableId: uuid('deliverable_id').notNull().references(() => deliverables.id),
  versionNumber: text('version_number').notNull(),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  notes: text('notes'),
  status: text('status').notNull().default('client_review'),
  uploadedAt: text('uploaded_at').notNull(),
});

// 17. Feedback Items
export const feedbackItems = pgTable('feedback_items', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  deliverableId: uuid('deliverable_id').notNull().references(() => deliverables.id),
  versionNumber: text('version_number').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull().default('client'),
  content: text('content').notNull(),
  timestampOrSection: text('timestamp_or_section'),
  status: text('status').notNull().default('open'),
  createdAt: text('created_at').notNull(),
  resolvedAt: text('resolved_at'),
});

// 18. Revisions
export const revisions = pgTable('revisions', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  deliverableId: uuid('deliverable_id').notNull().references(() => deliverables.id),
  revisionNumber: integer('revision_number').notNull(),
  maxIncluded: integer('max_included').notNull(),
  isScopeExceeded: integer('is_scope_exceeded').notNull().default(0),
  requestDetails: text('request_details').notNull(),
  requestedBy: text('requested_by').notNull(),
  requestedAt: text('requested_at').notNull(),
  status: text('status').notNull().default('pending'),
});

// 19. Approvals
export const approvals = pgTable('approvals', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  deliverableId: uuid('deliverable_id').notNull().references(() => deliverables.id),
  versionNumber: text('version_number').notNull(),
  status: text('status').notNull().default('pending'),
  requestedAt: text('requested_at').notNull(),
  decidedAt: text('decided_at'),
  decidedBy: text('decided_by'),
  feedbackComments: text('feedback_comments'),
});

// 20. Invoices
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  projectId: uuid('project_id').references(() => projects.id),
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
});

// 21. Invoice Items
export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  description: text('description').notNull(),
  quantity: real('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull().default(0),
  amount: real('amount').notNull().default(0),
});

// 22. Payments
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  paymentMethod: text('payment_method').notNull().default('bank_transfer'),
  paymentDate: text('payment_date').notNull(),
  reference: text('reference'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// 23. Expenses
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  date: text('date').notNull(),
  vendor: text('vendor').notNull(),
  category: text('category').notNull().default('software'),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  projectId: uuid('project_id').references(() => projects.id),
  clientId: uuid('client_id').references(() => clients.id),
  receiptUrl: text('receipt_url'),
  notes: text('notes'),
  isReimbursable: integer('is_reimbursable').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 24. Retainers
export const retainers = pgTable('retainers', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  monthlyAmount: real('monthly_amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  includedHours: real('included_hours').notNull().default(20),
  usedHours: real('used_hours').notNull().default(0),
  startDate: text('start_date').notNull(),
  renewalDate: text('renewal_date').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 25. Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  isRead: integer('is_read').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

// 26. Activity Logs
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  description: text('description').notNull(),
  metadata: text('metadata').default('{}'),
  createdAt: text('created_at').notNull(),
});
