import { z } from 'zod';

export const currencyEnum = z.enum(['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']);

// ----------------- ORGANIZATION & ONBOARDING -----------------
export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100),
  currency: currencyEnum.default('INR'),
  timezone: z.string().default('UTC'),
  defaultPaymentTermsDays: z.number().int().min(0).max(180).default(14),
  taxRatePercent: z.number().min(0).max(100).default(18),
  freelancerType: z.string().optional(),
  hourlyRate: z.number().min(0).default(2000),
});

export const onboardingSchema = z.object({
  freelancerType: z.string().min(1, 'Select your freelancer specialization'),
  workspaceName: z.string().min(2, 'Workspace name is required'),
  currency: currencyEnum.default('INR'),
  defaultPaymentTermsDays: z.number().int().min(0).default(14),
  firstClientName: z.string().min(1, 'Client name is required'),
  firstClientEmail: z.string().email('Invalid email address'),
  firstProjectName: z.string().min(1, 'Project name is required'),
  firstProjectBudget: z.number().min(0).default(50000),
});

// ----------------- CLIENTS -----------------
export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(100),
  company: z.string().max(100).optional().nullable(),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(30).optional().nullable(),
  website: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  address: z.string().max(255).optional().nullable(),
  currency: currencyEnum.default('INR'),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'lead', 'archived']).default('active'),
});

export const updateClientSchema = createClientSchema.partial();

// ----------------- LEADS -----------------
export const createLeadSchema = z.object({
  title: z.string().min(1, 'Lead title is required').max(150),
  clientName: z.string().min(1, 'Prospect or company name is required').max(100),
  company: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable(),
  stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).default('new'),
  value: z.number().min(0).default(0),
  currency: currencyEnum.default('INR'),
  probabilityPercent: z.number().min(0).max(100).default(50),
  expectedCloseDate: z.string().optional().nullable(),
  nextAction: z.string().max(200).optional().nullable(),
  nextActionDate: z.string().optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();

// ----------------- PROPOSALS -----------------
export const proposalItemSchema = z.object({
  description: z.string().min(1, 'Line item description is required'),
  quantity: z.number().min(0.1, 'Quantity must be at least 0.1').default(1),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
});

export const createProposalSchema = z.object({
  title: z.string().min(1, 'Proposal title is required').max(150),
  clientId: z.string().uuid('Valid client is required'),
  projectId: z.string().uuid().optional().nullable(),
  validUntil: z.string().min(1, 'Validity date is required'),
  currency: currencyEnum.default('INR'),
  discountPercent: z.number().min(0).max(100).default(0),
  taxPercent: z.number().min(0).max(100).default(18),
  terms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(proposalItemSchema).min(1, 'Add at least one line item'),
});

export const updateProposalSchema = createProposalSchema.partial();

// ----------------- QUOTES -----------------
export const quoteItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.1).default(1),
  unitPrice: z.number().min(0),
});

export const createQuoteSchema = z.object({
  title: z.string().min(1, 'Quote title is required').max(150),
  clientId: z.string().uuid('Valid client is required'),
  projectId: z.string().uuid().optional().nullable(),
  validUntil: z.string().min(1, 'Validity date is required'),
  currency: currencyEnum.default('INR'),
  discountAmount: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(quoteItemSchema).min(1, 'Add at least one line item'),
});

export const updateQuoteSchema = createQuoteSchema.partial();

// ----------------- CONTRACTS -----------------
export const createContractSchema = z.object({
  title: z.string().min(1, 'Contract title is required').max(150),
  clientId: z.string().uuid('Client is required'),
  projectId: z.string().uuid().optional().nullable(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  terms: z.string().min(1, 'Contract terms are required'),
});

export const updateContractSchema = createContractSchema.partial();

// ----------------- PROJECTS -----------------
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(120),
  clientId: z.string().uuid('Client is required'),
  description: z.string().optional().nullable(),
  status: z.enum(['planning', 'active', 'waiting', 'review', 'completed', 'archived']).default('planning'),
  health: z.enum(['healthy', 'at_risk', 'blocked']).default('healthy'),
  healthReason: z.string().optional().nullable(),
  startDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  deadline: z.string().optional().nullable(),
  budget: z.number().min(0).default(0),
  currency: currencyEnum.default('INR'),
  includedRevisions: z.number().int().min(0).default(2),
});

export const updateProjectSchema = createProjectSchema.partial();

// ----------------- TASKS -----------------
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().optional().nullable(),
  projectId: z.string().uuid('Project is required'),
  status: z.enum(['todo', 'in_progress', 'waiting', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional().nullable(),
  estimatedHours: z.number().min(0).optional().nullable(),
  clientVisible: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const updateTaskSchema = createTaskSchema.partial();

// ----------------- TIME TRACKING -----------------
export const createTimeEntrySchema = z.object({
  projectId: z.string().uuid('Project is required'),
  taskId: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional().nullable(),
  durationMinutes: z.number().int().min(1, 'Duration must be at least 1 minute'),
  billable: z.boolean().default(true),
  hourlyRate: z.number().min(0).optional(),
});

export const startTimerSchema = z.object({
  projectId: z.string().uuid('Project is required'),
  taskId: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  billable: z.boolean().default(true),
});

// ----------------- DELIVERABLES & VERSIONS -----------------
export const createDeliverableSchema = z.object({
  title: z.string().min(1, 'Deliverable title is required').max(150),
  description: z.string().optional().nullable(),
  projectId: z.string().uuid('Project is required'),
  includedRevisions: z.number().int().min(0).default(2),
  initialFileUrl: z.string().optional().nullable(),
  initialFileName: z.string().optional().nullable(),
  initialNotes: z.string().optional().nullable(),
});

export const addDeliverableVersionSchema = z.object({
  deliverableId: z.string().uuid(),
  fileUrl: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ----------------- FEEDBACK & APPROVALS -----------------
export const createFeedbackSchema = z.object({
  deliverableId: z.string().uuid(),
  versionNumber: z.string().default('V1'),
  authorName: z.string().min(1),
  authorRole: z.enum(['freelancer', 'client']).default('client'),
  content: z.string().min(1, 'Feedback message is required'),
  timestampOrSection: z.string().optional().nullable(),
});

export const requestApprovalSchema = z.object({
  deliverableId: z.string().uuid(),
  versionNumber: z.string().default('V1'),
  notes: z.string().optional().nullable(),
});

export const decideApprovalSchema = z.object({
  status: z.enum(['approved', 'changes_requested']),
  decidedBy: z.string().min(1, 'Approver name is required'),
  comments: z.string().optional().nullable(),
});

// ----------------- INVOICES -----------------
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Line item description is required'),
  quantity: z.number().min(0.1, 'Quantity must be positive').default(1),
  unitPrice: z.number().min(0, 'Price must be positive'),
});

export const createInvoiceSchema = z.object({
  title: z.string().min(1, 'Invoice title is required').max(150),
  clientId: z.string().uuid('Client is required'),
  projectId: z.string().uuid().optional().nullable(),
  issueDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: currencyEnum.default('INR'),
  discountPercent: z.number().min(0).max(100).default(0),
  taxPercent: z.number().min(0).max(100).default(18),
  paymentTerms: z.string().default('Net 14'),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one line item'),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

// ----------------- PAYMENTS -----------------
export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid('Invoice is required'),
  amount: z.number().min(1, 'Payment amount must be greater than 0'),
  paymentMethod: z.enum(['bank_transfer', 'stripe', 'upi', 'card', 'cash', 'other']).default('bank_transfer'),
  paymentDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ----------------- EXPENSES -----------------
export const createExpenseSchema = z.object({
  vendor: z.string().min(1, 'Vendor name is required').max(100),
  category: z.enum(['software', 'travel', 'equipment', 'internet', 'office', 'marketing', 'contractors', 'other']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: currencyEnum.default('INR'),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
  projectId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isReimbursable: z.boolean().default(false),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// ----------------- RETAINERS -----------------
export const createRetainerSchema = z.object({
  clientId: z.string().uuid('Client is required'),
  monthlyAmount: z.number().min(1, 'Monthly retainer amount is required'),
  currency: currencyEnum.default('INR'),
  includedHours: z.number().min(1, 'Included hours must be at least 1').default(20),
  startDate: z.string().min(1, 'Start date is required'),
  renewalDate: z.string().min(1, 'Renewal date is required'),
});

export const updateRetainerSchema = createRetainerSchema.partial();
