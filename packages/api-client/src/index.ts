import type {
  Client,
  Lead,
  Project,
  Task,
  TimeEntry,
  Proposal,
  Quote,
  Contract,
  Deliverable,
  DeliverableVersion,
  FeedbackItem,
  Revision,
  Approval,
  Invoice,
  Payment,
  Expense,
  Retainer,
  Notification,
  ActivityLog,
  DashboardData,
  FinancialReportsData,
  Organization,
  User,
} from '@freelanceros/types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientConfig {
  baseUrl?: string;
  getToken?: () => string | null | Promise<string | null>;
  organizationId?: string;
}

export class FreelancerOsClient {
  private baseUrl: string;
  private getToken?: () => string | null | Promise<string | null>;
  private organizationId?: string;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = (config.baseUrl || 'http://localhost:4000/api').replace(/\/$/, '');
    this.getToken = config.getToken;
    this.organizationId = config.organizationId;
  }

  public setOrganizationId(orgId: string) {
    this.organizationId = orgId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = new Headers(options.headers);

    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (this.organizationId) {
      headers.set('x-organization-id', this.organizationId);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(response.status, errorData?.message || `Request failed with status ${response.status}`, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth & Workspace
  auth = {
    getMe: () => this.request<{ user: User; organization: Organization }>('/auth/me'),
    login: (data: { email: string; password?: string }) =>
      this.request<{ token: string; user: User; organization: Organization }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    signup: (data: { email: string; password?: string; fullName?: string; studioName?: string; freelancerType?: string }) =>
      this.request<{ token: string; user: User; organization: Organization }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    google: (data: { credential?: string; email?: string; name?: string; picture?: string }) =>
      this.request<{ token: string; user: User; organization: Organization }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  organizations = {
    getCurrent: () => this.request<Organization>('/organizations/current'),
    update: (data: Partial<Organization>) => this.request<Organization>('/organizations/current', { method: 'PATCH', body: JSON.stringify(data) }),
    onboard: (data: any) => this.request<{ organization: Organization; client: Client; project: Project }>('/organizations/onboard', { method: 'POST', body: JSON.stringify(data) }),
  };

  // Dashboard & Insights
  dashboard = {
    getSummary: () => this.request<DashboardData>('/dashboard/summary'),
  };

  reports = {
    getFinancials: () => this.request<FinancialReportsData>('/reports/financials'),
  };

  // Work
  clients = {
    list: () => this.request<Client[]>('/clients'),
    get: (id: string) => this.request<Client>(`/clients/${id}`),
    create: (data: any) => this.request<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Client>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<void>(`/clients/${id}`, { method: 'DELETE' }),
    getTimeline: (id: string) => this.request<ActivityLog[]>(`/clients/${id}/timeline`),
  };

  leads = {
    list: () => this.request<Lead[]>('/leads'),
    get: (id: string) => this.request<Lead>(`/leads/${id}`),
    create: (data: any) => this.request<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Lead>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<void>(`/leads/${id}`, { method: 'DELETE' }),
    convert: (id: string) => this.request<{ client: Client; project?: Project }>(`/leads/${id}/convert`, { method: 'POST' }),
  };

  projects = {
    list: () => this.request<Project[]>('/projects'),
    get: (id: string) => this.request<Project>(`/projects/${id}`),
    create: (data: any) => this.request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<void>(`/projects/${id}`, { method: 'DELETE' }),
  };

  tasks = {
    list: (projectId?: string) => this.request<Task[]>(projectId ? `/tasks?projectId=${projectId}` : '/tasks'),
    get: (id: string) => this.request<Task>(`/tasks/${id}`),
    create: (data: any) => this.request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  };

  // Sales
  proposals = {
    list: () => this.request<Proposal[]>('/proposals'),
    get: (id: string) => this.request<Proposal>(`/proposals/${id}`),
    create: (data: any) => this.request<Proposal>('/proposals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Proposal>(`/proposals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<void>(`/proposals/${id}`, { method: 'DELETE' }),
    send: (id: string) => this.request<Proposal>(`/proposals/${id}/send`, { method: 'POST' }),
    accept: (id: string) => this.request<Proposal>(`/proposals/${id}/accept`, { method: 'POST' }),
    decline: (id: string) => this.request<Proposal>(`/proposals/${id}/decline`, { method: 'POST' }),
  };

  quotes = {
    list: () => this.request<Quote[]>('/quotes'),
    get: (id: string) => this.request<Quote>(`/quotes/${id}`),
    create: (data: any) => this.request<Quote>('/quotes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Quote>(`/quotes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    convertToProject: (id: string) => this.request<Project>(`/quotes/${id}/convert`, { method: 'POST' }),
  };

  contracts = {
    list: () => this.request<Contract[]>('/contracts'),
    get: (id: string) => this.request<Contract>(`/contracts/${id}`),
    create: (data: any) => this.request<Contract>('/contracts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Contract>(`/contracts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    sign: (id: string, signerName: string) => this.request<Contract>(`/contracts/${id}/sign`, { method: 'POST', body: JSON.stringify({ signerName }) }),
  };

  // Operations
  time = {
    list: (projectId?: string) => this.request<TimeEntry[]>(projectId ? `/time-tracking?projectId=${projectId}` : '/time-tracking'),
    create: (data: any) => this.request<TimeEntry>('/time-tracking', { method: 'POST', body: JSON.stringify(data) }),
    startTimer: (data: any) => this.request<TimeEntry>('/time-tracking/start', { method: 'POST', body: JSON.stringify(data) }),
    stopTimer: (id: string) => this.request<TimeEntry>(`/time-tracking/${id}/stop`, { method: 'POST' }),
    getActiveTimer: () => this.request<TimeEntry | null>('/time-tracking/active'),
  };

  deliverables = {
    list: (projectId?: string) => this.request<Deliverable[]>(projectId ? `/deliverables?projectId=${projectId}` : '/deliverables'),
    get: (id: string) => this.request<Deliverable>(`/deliverables/${id}`),
    create: (data: any) => this.request<Deliverable>('/deliverables', { method: 'POST', body: JSON.stringify(data) }),
    addVersion: (id: string, data: any) => this.request<DeliverableVersion>(`/deliverables/${id}/versions`, { method: 'POST', body: JSON.stringify(data) }),
  };

  feedback = {
    list: (deliverableId: string) => this.request<FeedbackItem[]>(`/feedback?deliverableId=${deliverableId}`),
    create: (data: any) => this.request<FeedbackItem>('/feedback', { method: 'POST', body: JSON.stringify(data) }),
    resolve: (id: string) => this.request<FeedbackItem>(`/feedback/${id}/resolve`, { method: 'PATCH' }),
  };

  revisions = {
    list: (projectId?: string) => this.request<Revision[]>(projectId ? `/revisions?projectId=${projectId}` : '/revisions'),
    create: (data: any) => this.request<Revision>('/revisions', { method: 'POST', body: JSON.stringify(data) }),
  };

  approvals = {
    list: () => this.request<Approval[]>('/approvals'),
    request: (data: any) => this.request<Approval>('/approvals', { method: 'POST', body: JSON.stringify(data) }),
    decide: (id: string, data: { status: 'approved' | 'changes_requested'; decidedBy: string; comments?: string }) =>
      this.request<Approval>(`/approvals/${id}/decide`, { method: 'POST', body: JSON.stringify(data) }),
  };

  retainers = {
    list: () => this.request<Retainer[]>('/retainers'),
    create: (data: any) => this.request<Retainer>('/retainers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Retainer>(`/retainers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  };

  // Money
  invoices = {
    list: () => this.request<Invoice[]>('/invoices'),
    get: (id: string) => this.request<Invoice>(`/invoices/${id}`),
    create: (data: any) => this.request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Invoice>(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<void>(`/invoices/${id}`, { method: 'DELETE' }),
    send: (id: string) => this.request<Invoice>(`/invoices/${id}/send`, { method: 'POST' }),
    markOverdue: (id: string) => this.request<Invoice>(`/invoices/${id}/mark-overdue`, { method: 'POST' }),
  };

  payments = {
    list: (invoiceId?: string) => this.request<Payment[]>(invoiceId ? `/payments?invoiceId=${invoiceId}` : '/payments'),
    create: (data: any) => this.request<Payment>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  };

  expenses = {
    list: (projectId?: string) => this.request<Expense[]>(projectId ? `/expenses?projectId=${projectId}` : '/expenses'),
    create: (data: any) => this.request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => this.request<Expense>(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => this.request<void>(`/expenses/${id}`, { method: 'DELETE' }),
  };

  // Utilities
  notifications = {
    list: () => this.request<Notification[]>('/notifications'),
    markRead: (id: string) => this.request<void>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => this.request<void>('/notifications/read-all', { method: 'POST' }),
  };

  activity = {
    list: (limit = 30) => this.request<ActivityLog[]>(`/activity?limit=${limit}`),
  };

  search = {
    query: (q: string) => this.request<{
      clients: Client[];
      projects: Project[];
      invoices: Invoice[];
      tasks: Task[];
      leads: Lead[];
    }>(`/search?q=${encodeURIComponent(q)}`),
  };

  seed = {
    resetDemo: () => this.request<{ message: string; workspace: string }>('/seed/demo', { method: 'POST' }),
  };
}
