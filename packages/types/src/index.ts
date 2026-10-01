// ==========================================
// FREELANCEROS DOMAIN TYPES & INTERFACES
// ==========================================

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED';

export type UserRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  currency: CurrencyCode;
  timezone: string;
  defaultPaymentTermsDays: number;
  taxRatePercent: number;
  plan: 'free' | 'pro' | 'studio';
  freelancerType?: string;
  hourlyRate: number;
  defaultHourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

// ----------------- CLIENTS -----------------
export type ClientStatus = 'active' | 'lead' | 'archived';

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  currency: CurrencyCode;
  notes?: string | null;
  status: ClientStatus;
  activeProjectsCount: number;
  totalRevenue: number;
  outstandingBalance: number;
  lastActivityAt?: string | null;
  projects?: Project[];
  invoices?: Invoice[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  isPrimary: boolean;
  createdAt: string;
}

// ----------------- LEADS -----------------
export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  organizationId: string;
  title: string;
  clientName: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  stage: LeadStage;
  value: number;
  currency: CurrencyCode;
  probabilityPercent: number;
  expectedCloseDate?: string | null;
  nextAction?: string | null;
  nextActionDate?: string | null;
  source?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------- PROPOSALS & QUOTES -----------------
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Proposal {
  id: string;
  organizationId: string;
  proposalNumber: string;
  title: string;
  clientId: string;
  clientName?: string;
  projectId?: string | null;
  status: ProposalStatus;
  validUntil: string;
  currency: CurrencyCode;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  total?: number;
  tax?: number;
  content?: string;
  terms?: string | null;
  notes?: string | null;
  items: ProposalItem[];
  sentAt?: string | null;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Quote {
  id: string;
  organizationId: string;
  quoteNumber: string;
  title: string;
  clientId: string;
  clientName?: string;
  projectId?: string | null;
  status: QuoteStatus;
  validUntil: string;
  currency: CurrencyCode;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  total?: number;
  tax?: number;
  paymentTerms?: string | null;
  notes?: string | null;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

// ----------------- CONTRACTS -----------------
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'terminated';

export interface Contract {
  id: string;
  organizationId: string;
  title: string;
  clientId: string;
  clientName?: string;
  projectId?: string | null;
  status: ContractStatus;
  startDate: string;
  endDate?: string | null;
  terms: string;
  content?: string;
  signedAt?: string | null;
  signedBy?: string | null;
  signerName?: string | null;
  attachmentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------- PROJECTS -----------------
export type ProjectStatus = 'planning' | 'active' | 'waiting' | 'review' | 'completed' | 'archived';
export type ProjectHealth = 'healthy' | 'at_risk' | 'blocked';

export interface Project {
  id: string;
  organizationId: string;
  clientId: string;
  clientName?: string;
  name: string;
  code: string;
  description?: string | null;
  status: ProjectStatus;
  health: ProjectHealth;
  healthReason?: string | null;
  startDate: string;
  deadline?: string | null;
  budget: number;
  currency: CurrencyCode;
  totalHoursTracked: number;
  totalInvoiced: number;
  totalPaid: number;
  totalExpenses: number;
  profit: number;
  effectiveHourlyRate: number;
  includedRevisions: number;
  completedRevisions: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

// ----------------- TASKS -----------------
export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string;
  clientId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  clientVisible: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ----------------- TIME TRACKING -----------------
export interface TimeEntry {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string;
  taskId?: string | null;
  taskTitle?: string | null;
  description?: string | null;
  startTime: string;
  endTime?: string | null;
  durationMinutes: number;
  durationSeconds?: number;
  billable: boolean;
  isBillable?: boolean;
  hourlyRate: number;
  revenueAmount: number;
  isRunning: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------- DELIVERABLES & REVISIONS & APPROVALS -----------------
export type DeliverableStatus = 'draft' | 'internal_review' | 'client_review' | 'revision' | 'approved' | 'delivered';

export interface DeliverableVersion {
  id: string;
  deliverableId: string;
  versionNumber: string; // "V1", "V2", "V3", "Final"
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  notes?: string | null;
  status: DeliverableStatus;
  feedbackCount: number;
  uploadedAt: string;
}

export interface Deliverable {
  id: string;
  organizationId: string;
  projectId: string;
  projectName?: string;
  title: string;
  description?: string | null;
  status: DeliverableStatus;
  currentVersion: string;
  versionsCount: number;
  includedRevisions: number;
  usedRevisions: number;
  isScopeExceeded: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  deliveredAt?: string | null;
  versions?: DeliverableVersion[];
  createdAt: string;
  updatedAt: string;
}

export type FeedbackStatus = 'open' | 'in_progress' | 'resolved';

export interface FeedbackItem {
  id: string;
  organizationId: string;
  deliverableId: string;
  versionNumber: string;
  authorName: string;
  authorRole: 'freelancer' | 'client';
  content: string;
  timestampOrSection?: string | null;
  status: FeedbackStatus;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface Revision {
  id: string;
  organizationId: string;
  projectId: string;
  deliverableId: string;
  deliverableTitle?: string;
  revisionNumber: number;
  maxIncluded: number;
  isScopeExceeded: boolean;
  requestDetails: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested';

export interface Approval {
  id: string;
  organizationId: string;
  projectId: string;
  deliverableId: string;
  deliverableTitle?: string;
  versionNumber: string;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string | null;
  decidedBy?: string | null;
  feedbackComments?: string | null;
}

// ----------------- INVOICES & PAYMENTS -----------------
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  title: string;
  clientId: string;
  clientName?: string;
  projectId?: string | null;
  projectName?: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  number?: string;
  total?: number;
  tax?: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms?: string | null;
  notes?: string | null;
  items: InvoiceItem[];
  sentAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'bank_transfer' | 'stripe' | 'upi' | 'card' | 'cash' | 'other';

export interface Payment {
  id: string;
  organizationId: string;
  invoiceId: string;
  invoiceNumber?: string;
  clientId: string;
  clientName?: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
}

// ----------------- EXPENSES -----------------
export type ExpenseCategory = 'software' | 'travel' | 'equipment' | 'internet' | 'office' | 'marketing' | 'contractors' | 'other';

export interface Expense {
  id: string;
  organizationId: string;
  date: string;
  expenseDate?: string;
  vendor: string;
  description?: string;
  category: ExpenseCategory;
  amount: number;
  currency: CurrencyCode;
  projectId?: string | null;
  projectName?: string | null;
  clientId?: string | null;
  receiptUrl?: string | null;
  notes?: string | null;
  isReimbursable: boolean;
  taxDeductible?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------- RETAINERS -----------------
export type RetainerStatus = 'active' | 'paused' | 'cancelled';

export interface Retainer {
  id: string;
  organizationId: string;
  clientId: string;
  clientName?: string;
  title?: string;
  monthlyAmount: number;
  monthlyRate?: number;
  currency: CurrencyCode;
  includedHours: number;
  usedHours: number;
  remainingHours: number;
  startDate: string;
  renewalDate: string;
  status: RetainerStatus;
  nextInvoiceDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------- NOTIFICATIONS & ACTIVITY -----------------
export type NotificationType =
  | 'invoice_overdue'
  | 'proposal_expiring'
  | 'project_deadline'
  | 'client_replied'
  | 'approval_received'
  | 'revision_limit'
  | 'retainer_renewing';

export interface Notification {
  id: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ----------------- NEEDS ATTENTION & DASHBOARD -----------------
export type AttentionSeverity = 'critical' | 'warning' | 'info';

export interface AttentionItem {
  id: string;
  title: string;
  description: string;
  severity: AttentionSeverity;
  category: 'invoice' | 'project' | 'proposal' | 'approval' | 'revision' | 'retainer';
  actionUrl: string;
  actionText: string;
  dueDate?: string;
}

export interface DashboardMetrics {
  monthlyRevenue: number;
  outstandingRevenue: number;
  overdueRevenue: number;
  trackedHoursThisMonth: number;
  activeProjectsCount: number;
  pendingApprovalsCount: number;
  currency: CurrencyCode;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  needsAttention: AttentionItem[];
  activeProjects: Project[];
  upcomingDates: {
    id: string;
    title: string;
    date: string;
    type: 'deadline' | 'invoice_due' | 'proposal_expire' | 'retainer_renewal';
    link: string;
  }[];
  recentActivity: ActivityLog[];
}

// ----------------- REPORTS & PROFITABILITY -----------------
export interface ProjectProfitabilityReport {
  projectId: string;
  projectName: string;
  clientName: string;
  revenue: number;
  expenses: number;
  profit: number;
  marginPercent: number;
  trackedHours: number;
  effectiveHourlyRate: number;
  currency: CurrencyCode;
}

export interface FinancialReportsData {
  totalRevenueYTD: number;
  totalExpensesYTD: number;
  netProfitYTD: number;
  outstandingBalance: number;
  averageHourlyRate: number;
  currency: CurrencyCode;
  monthlyCashFlow: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  revenueByClient: {
    clientId: string;
    clientName: string;
    revenue: number;
    percentage: number;
  }[];
  projectProfitability: ProjectProfitabilityReport[];
}
