import { FreelancerOsClient } from '@freelanceros/api-client';
import { mockStorage } from './mock-store';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const customUrl = localStorage.getItem('freelanceros_api_url');
      if (customUrl) return customUrl;
    } catch {
      // ignore
    }

    // If loaded from a local IP on phone (e.g. 192.168.1.15:3000), default to port 4000 on that host
    const host = window.location.hostname;
    if (
      host &&
      host !== 'localhost' &&
      host !== '127.0.0.1' &&
      !host.includes('pages.dev') &&
      !host.includes('workers.dev')
    ) {
      return `${window.location.protocol}//${host}:4000/api`;
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
}

const rawClient = new FreelancerOsClient({
  baseUrl: getApiBaseUrl(),
  getToken: () => {
    if (typeof window !== 'undefined') {
      try {
        return (
          localStorage.getItem('freelanceros_token') ||
          localStorage.getItem('freelanceros_auth_token') ||
          'demo-token'
        );
      } catch {
        return 'demo-token';
      }
    }
    return 'demo-token';
  },
});

// Resilient wrapper: tries live API first; if unavailable (offline / mobile on different network / Cloudflare Pages), seamlessly falls back to mockStorage
async function tryWithFallback<T>(apiFn: () => Promise<T>, fallbackFn: () => T | Promise<T>): Promise<T> {
  // If running on an HTTPS page (like cloudflare pages) and baseUrl is HTTP localhost, skip network to prevent mixed-content browser block
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const baseUrl = getApiBaseUrl();
    if (isHttps && baseUrl.startsWith('http://localhost')) {
      return fallbackFn();
    }
  }

  try {
    // 2-second timeout so mobile devices don't hang on unreachable ports
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), 2000)
    );
    const result = await Promise.race([apiFn(), timeoutPromise]);
    return result;
  } catch (err) {
    // Network error or timeout -> graceful offline execution
    return fallbackFn();
  }
}

export const api = {
  auth: {
    getMe: () => tryWithFallback(() => rawClient.auth.getMe(), () => mockStorage.getMe()),
    login: (data: { email: string; password?: string }) =>
      tryWithFallback(
        async () => {
          const res = await rawClient.auth.login(data);
          if (typeof window !== 'undefined' && res) {
            if (res.token) {
              localStorage.setItem('freelanceros_token', res.token);
              localStorage.setItem('freelanceros_auth_token', res.token);
            }
            if (res.user) {
              localStorage.setItem('freelanceros_current_user', JSON.stringify(res.user));
            }
          }
          return res;
        },
        () => mockStorage.login(data.email, data.password)
      ),
    signup: (data: { email: string; password?: string; fullName?: string; studioName?: string; freelancerType?: string }) =>
      tryWithFallback(
        async () => {
          const res = await rawClient.auth.signup(data);
          if (typeof window !== 'undefined' && res) {
            if (res.token) {
              localStorage.setItem('freelanceros_token', res.token);
              localStorage.setItem('freelanceros_auth_token', res.token);
            }
            if (res.user) {
              localStorage.setItem('freelanceros_current_user', JSON.stringify(res.user));
            }
          }
          return res;
        },
        () => mockStorage.signup(data)
      ),
    google: (data: { credential?: string; email?: string; name?: string; picture?: string }) =>
      tryWithFallback(
        async () => {
          const res = await rawClient.auth.google(data);
          if (typeof window !== 'undefined' && res) {
            if (res.token) {
              localStorage.setItem('freelanceros_token', res.token);
              localStorage.setItem('freelanceros_auth_token', res.token);
            }
            if (res.user) {
              localStorage.setItem('freelanceros_current_user', JSON.stringify(res.user));
            }
          }
          return res;
        },
        () => mockStorage.loginWithGoogle(data)
      ),
    logout: () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('freelanceros_token');
          localStorage.removeItem('freelanceros_auth_token');
          localStorage.removeItem('freelanceros_current_user');
        } catch {}
      }
      return mockStorage.logout();
    },
  },

  organizations: {
    getCurrent: () => tryWithFallback(() => rawClient.organizations.getCurrent(), () => mockStorage.getCurrentOrg()),
    update: (data: any) => tryWithFallback(() => rawClient.organizations.update(data), () => mockStorage.updateOrg(data)),
    onboard: (data: any) => tryWithFallback(() => rawClient.organizations.onboard(data), () => mockStorage.onboard(data)),
  },

  dashboard: {
    getSummary: () => tryWithFallback(() => rawClient.dashboard.getSummary(), () => mockStorage.getDashboardSummary()),
  },

  reports: {
    getFinancials: () => tryWithFallback(() => rawClient.reports.getFinancials(), () => mockStorage.getFinancialReports()),
  },

  clients: {
    list: () => tryWithFallback(() => rawClient.clients.list(), () => mockStorage.listClients()),
    get: (id: string) => tryWithFallback(() => rawClient.clients.get(id), () => mockStorage.getClient(id) as any),
    create: (data: any) => tryWithFallback(() => rawClient.clients.create(data), () => mockStorage.createClient(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.clients.update(id, data), () => mockStorage.updateClient(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.clients.delete(id), () => mockStorage.deleteClient(id)),
    getTimeline: (id: string) => tryWithFallback(() => rawClient.clients.getTimeline(id), () => mockStorage.getClientTimeline(id)),
    addContact: (clientId: string, data: any) => tryWithFallback(() => rawClient.clients.addContact(clientId, data), () => mockStorage.addClientContact(clientId, data)),
    deleteContact: (clientId: string, contactId: string) => tryWithFallback(() => rawClient.clients.deleteContact(clientId, contactId), () => mockStorage.deleteClientContact(clientId, contactId)),
  },

  leads: {
    list: () => tryWithFallback(() => rawClient.leads.list(), () => mockStorage.listLeads()),
    get: (id: string) => tryWithFallback(() => rawClient.leads.get(id), () => mockStorage.getLead(id) as any),
    create: (data: any) => tryWithFallback(() => rawClient.leads.create(data), () => mockStorage.createLead(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.leads.update(id, data), () => mockStorage.updateLead(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.leads.delete(id), () => mockStorage.deleteLead(id)),
    convert: (id: string) => tryWithFallback(() => rawClient.leads.convert(id), () => mockStorage.convertLead(id) as any),
  },

  projects: {
    list: () => tryWithFallback(() => rawClient.projects.list(), () => mockStorage.listProjects()),
    get: (id: string) => tryWithFallback(() => rawClient.projects.get(id), () => mockStorage.getProject(id) as any),
    create: (data: any) => tryWithFallback(() => rawClient.projects.create(data), () => mockStorage.createProject(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.projects.update(id, data), () => mockStorage.updateProject(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.projects.delete(id), () => mockStorage.deleteProject(id)),
  },

  tasks: {
    list: (projectId?: string) => tryWithFallback(() => rawClient.tasks.list(projectId), () => mockStorage.listTasks(projectId)),
    get: (id: string) => tryWithFallback(() => rawClient.tasks.get(id), () => mockStorage.getTask(id) as any),
    create: (data: any) => tryWithFallback(() => rawClient.tasks.create(data), () => mockStorage.createTask(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.tasks.update(id, data), () => mockStorage.updateTask(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.tasks.delete(id), () => mockStorage.deleteTask(id)),
  },

  proposals: {
    list: () => tryWithFallback(() => rawClient.proposals.list(), () => mockStorage.listProposals()),
    get: (id: string) => tryWithFallback(() => rawClient.proposals.get(id), () => (mockStorage.getProposal(id) || mockStorage.listProposals()[0]) as any),
    create: (data: any) => tryWithFallback(() => rawClient.proposals.create(data), () => mockStorage.createProposal(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.proposals.update(id, data), () => mockStorage.updateProposal(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.proposals.delete(id), () => mockStorage.deleteProposal(id)),
    send: (id: string) => tryWithFallback(() => rawClient.proposals.send(id), () => mockStorage.listProposals()[0]),
    accept: (id: string) => tryWithFallback(() => rawClient.proposals.accept(id), () => mockStorage.listProposals()[0]),
    decline: (id: string) => tryWithFallback(() => rawClient.proposals.decline(id), () => mockStorage.listProposals()[0]),
  },

  quotes: {
    list: () => tryWithFallback(() => rawClient.quotes.list(), () => mockStorage.listQuotes()),
    get: (id: string) => tryWithFallback(() => rawClient.quotes.get(id), () => (mockStorage.getQuote(id) || mockStorage.listQuotes()[0]) as any),
    create: (data: any) => tryWithFallback(() => rawClient.quotes.create(data), () => mockStorage.createQuote(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.quotes.update(id, data), () => mockStorage.updateQuote(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.quotes.delete(id), () => mockStorage.deleteQuote(id)),
    convertToProject: (id: string) => tryWithFallback(() => rawClient.quotes.convertToProject(id), () => mockStorage.listProjects()[0]),
  },

  contracts: {
    list: () => tryWithFallback(() => rawClient.contracts.list(), () => mockStorage.listContracts()),
    get: (id: string) => tryWithFallback(() => rawClient.contracts.get(id), () => (mockStorage.getContract(id) || mockStorage.listContracts()[0]) as any),
    create: (data: any) => tryWithFallback(() => rawClient.contracts.create(data), () => mockStorage.createContract(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.contracts.update(id, data), () => mockStorage.updateContract(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.contracts.delete(id), () => mockStorage.deleteContract(id)),
    sign: (id: string, signerName: string) => tryWithFallback(() => rawClient.contracts.sign(id, signerName), () => mockStorage.signContract(id, signerName) as any),
  },

  time: {
    list: (projectId?: string) => tryWithFallback(() => rawClient.time.list(projectId), () => mockStorage.listTime(projectId)),
    create: (data: any) => tryWithFallback(() => rawClient.time.create(data), () => mockStorage.createTime(data)),
    startTimer: (data: any) => tryWithFallback(() => rawClient.time.startTimer(data), () => mockStorage.startTimer(data) as any),
    stopTimer: (id: string) => tryWithFallback(() => rawClient.time.stopTimer(id), () => mockStorage.stopTimer(id) as any),
    getActiveTimer: () => tryWithFallback(() => rawClient.time.getActiveTimer(), () => mockStorage.getActiveTimer()),
    delete: (id: string) => tryWithFallback(() => rawClient.time.delete(id), () => mockStorage.deleteTime(id)),
  },

  deliverables: {
    list: (projectId?: string) => tryWithFallback(() => rawClient.deliverables.list(projectId), () => mockStorage.listDeliverables(projectId)),
    get: (id: string) => tryWithFallback(() => rawClient.deliverables.get(id), () => mockStorage.getDeliverable(id) as any),
    create: (data: any) => tryWithFallback(() => rawClient.deliverables.create(data), () => mockStorage.createDeliverable(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.deliverables.update(id, data), () => mockStorage.updateDeliverable(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.deliverables.delete(id), () => mockStorage.deleteDeliverable(id)),
    addVersion: (id: string, data: any) => tryWithFallback(() => rawClient.deliverables.addVersion(id, data), () => mockStorage.addDeliverableVersion(id, data) as any),
  },

  feedback: {
    list: (deliverableId: string) => tryWithFallback(() => rawClient.feedback.list(deliverableId), () => mockStorage.listFeedback(deliverableId)),
    create: (data: any) => tryWithFallback(() => rawClient.feedback.create(data), () => mockStorage.createFeedback(data)),
    resolve: (id: string) => tryWithFallback(() => rawClient.feedback.resolve(id), () => mockStorage.resolveFeedback(id) as any),
  },

  revisions: {
    list: (projectId?: string) => tryWithFallback(() => rawClient.revisions.list(projectId), () => mockStorage.listRevisions(projectId)),
    create: (data: any) => tryWithFallback(() => rawClient.revisions.create(data), () => mockStorage.createRevision(data)),
  },

  approvals: {
    list: () => tryWithFallback(() => rawClient.approvals.list(), () => mockStorage.listApprovals()),
    request: (data: any) => tryWithFallback(() => rawClient.approvals.request(data), () => mockStorage.requestApproval(data)),
    decide: (id: string, data: any) => tryWithFallback(() => rawClient.approvals.decide(id, data), () => mockStorage.decideApproval(id, data) as any),
  },

  retainers: {
    list: () => tryWithFallback(() => rawClient.retainers.list(), () => mockStorage.listRetainers()),
    create: (data: any) => tryWithFallback(() => rawClient.retainers.create(data), () => mockStorage.createRetainer(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.retainers.update(id, data), () => mockStorage.updateRetainer(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.retainers.delete(id), () => mockStorage.deleteRetainer(id)),
  },

  invoices: {
    list: () => tryWithFallback(() => rawClient.invoices.list(), () => mockStorage.listInvoices()),
    get: (id: string) => tryWithFallback(() => rawClient.invoices.get(id), () => mockStorage.getInvoice(id) as any),
    create: (data: any) => tryWithFallback(() => rawClient.invoices.create(data), () => mockStorage.createInvoice(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.invoices.update(id, data), () => mockStorage.updateInvoice(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.invoices.delete(id), () => mockStorage.deleteInvoice(id)),
    send: (id: string) => tryWithFallback(() => rawClient.invoices.send(id), () => mockStorage.sendInvoice(id) as any),
    markOverdue: (id: string) => tryWithFallback(() => rawClient.invoices.markOverdue(id), () => mockStorage.markInvoiceOverdue(id) as any),
  },

  payments: {
    list: (invoiceId?: string) => tryWithFallback(() => rawClient.payments.list(invoiceId), () => mockStorage.listPayments(invoiceId)),
    create: (data: any) => tryWithFallback(() => rawClient.payments.create(data), () => mockStorage.createPayment(data)),
  },

  expenses: {
    list: (projectId?: string) => tryWithFallback(() => rawClient.expenses.list(projectId), () => mockStorage.listExpenses(projectId)),
    create: (data: any) => tryWithFallback(() => rawClient.expenses.create(data), () => mockStorage.createExpense(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.expenses.update(id, data), () => mockStorage.updateExpense(id, data) as any),
    delete: (id: string) => tryWithFallback(() => rawClient.expenses.delete(id), () => mockStorage.deleteExpense(id)),
  },

  notifications: {
    list: () => tryWithFallback(() => rawClient.notifications.list(), () => mockStorage.listNotifications()),
    markRead: (id: string) => tryWithFallback(() => rawClient.notifications.markRead(id), () => {}),
    markAllRead: () => tryWithFallback(() => rawClient.notifications.markAllRead(), () => {}),
  },

  activity: {
    list: (limit = 30) => tryWithFallback(() => rawClient.activity.list(limit), () => mockStorage.listActivity(limit)),
  },

  search: {
    query: (q: string) => tryWithFallback(() => rawClient.search.query(q), () => mockStorage.search(q)),
  },

  seed: {
    resetDemo: () => tryWithFallback(() => rawClient.seed.resetDemo(), () => mockStorage.resetDemo()),
    enterDemo: () => mockStorage.enterDemo(),
    exitDemo: () => mockStorage.exitDemo(),
    getDemoStatus: () => mockStorage.getDemoStatus(),
  },

  milestones: {
    list: (projectId?: string) => tryWithFallback(() => rawClient.milestones.list(projectId), () => mockStorage.listMilestones(projectId)),
    create: (data: any) => tryWithFallback(() => rawClient.milestones.create(data), () => mockStorage.createMilestone(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.milestones.update(id, data), () => mockStorage.updateMilestone(id, data)),
    delete: (id: string) => tryWithFallback(() => rawClient.milestones.delete(id), () => mockStorage.deleteMilestone(id)),
  },

  scope: {
    get: (projectId: string) => tryWithFallback(() => rawClient.scope.get(projectId), () => mockStorage.getScope(projectId)),
    save: (data: any) => tryWithFallback(() => rawClient.scope.save(data), () => mockStorage.saveScope(data)),
    listChanges: (projectId?: string) =>
      tryWithFallback(
        () => rawClient.scope.get(projectId || '').then((r) => r.changes || []),
        () => mockStorage.listScopeChanges(projectId)
      ),
    requestChange: (data: any) => tryWithFallback(() => rawClient.scope.requestChange(data), () => mockStorage.createScopeChange(data)),
    updateChange: (id: string, data: any) => tryWithFallback(() => rawClient.scope.updateChange(id, data), () => mockStorage.updateScopeChange(id, data)),
  },

  assetRequests: {
    list: (params?: { projectId?: string; clientId?: string } | string) =>
      tryWithFallback(
        () => rawClient.assetRequests.list(typeof params === 'string' ? { projectId: params } : params),
        () => mockStorage.listAssetRequests(params)
      ),
    create: (data: any) => tryWithFallback(() => rawClient.assetRequests.create(data), () => mockStorage.createAssetRequest(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.assetRequests.update(id, data), () => mockStorage.updateAssetRequest(id, data)),
    delete: (id: string) => tryWithFallback(() => rawClient.assetRequests.delete(id), () => mockStorage.deleteAssetRequest(id)),
  },

  files: {
    list: (projectId?: string) =>
      tryWithFallback(
        () => rawClient.files.list(projectId),
        () => mockStorage.listProjectFiles(projectId)
      ),
    upload: (data: any) =>
      tryWithFallback(
        async () => mockStorage.uploadProjectFile(data),
        () => mockStorage.uploadProjectFile(data)
      ),
    delete: (id: string) =>
      tryWithFallback(
        async () => mockStorage.deleteProjectFile(id),
        () => mockStorage.deleteProjectFile(id)
      ),
    generateShareLink: (fileId: string, hours = 24) =>
      tryWithFallback(
        async () => mockStorage.generateShareLink(fileId, hours),
        () => mockStorage.generateShareLink(fileId, hours)
      ),
  },

  creative: {
    callSheets: {
      list: (projectId?: string) => tryWithFallback(() => rawClient.creative.listCallSheets(projectId), () => mockStorage.listCallSheets(projectId)),
      create: (data: any) => tryWithFallback(() => rawClient.creative.createCallSheet(data), () => mockStorage.createCallSheet(data)),
      update: (id: string, data: any) => tryWithFallback(async () => mockStorage.updateCallSheet(id, data), () => mockStorage.updateCallSheet(id, data)),
      delete: (id: string) => tryWithFallback(async () => {}, () => mockStorage.deleteCallSheet(id)),
    },
    shots: {
      list: (projectId?: string) => tryWithFallback(() => rawClient.creative.listShots(projectId), () => mockStorage.listShots(projectId)),
      create: (data: any) => tryWithFallback(() => rawClient.creative.createShot(data), () => mockStorage.createShot(data)),
      update: (id: string, data: any) => tryWithFallback(() => rawClient.creative.updateShot(id, data), () => mockStorage.updateShot(id, data)),
      delete: (id: string) => tryWithFallback(async () => {}, () => mockStorage.deleteShot(id)),
    },
    equipment: {
      list: (projectId?: string) => tryWithFallback(() => rawClient.creative.listEquipment(projectId), () => mockStorage.listEquipment(projectId)),
      create: (data: any) => tryWithFallback(() => rawClient.creative.createEquipment(data), () => mockStorage.createEquipment(data)),
      update: (id: string, data: any) => tryWithFallback(() => rawClient.creative.updateEquipment(id, data), () => mockStorage.updateEquipment(id, data)),
      delete: (id: string) => tryWithFallback(async () => {}, () => mockStorage.deleteEquipment(id)),
    },
  },

  portal: {
    get: (clientId: string) => tryWithFallback(() => rawClient.portal.get(clientId), () => mockStorage.getPortalData(clientId)),
    submitFeedback: (clientId: string, data: any) => tryWithFallback(() => rawClient.portal.submitFeedback(clientId, data), () => mockStorage.submitPortalFeedback(clientId, data)),
  },

  caseStudies: {
    list: (projectId?: string) => tryWithFallback(() => rawClient.caseStudies.list(), () => mockStorage.listCaseStudies(projectId)),
    get: (id: string) => tryWithFallback(async () => mockStorage.getCaseStudy(id), () => mockStorage.getCaseStudy(id)),
    create: (data: any) => tryWithFallback(() => rawClient.caseStudies.create(data), () => mockStorage.createCaseStudy(data)),
    update: (id: string, data: any) => tryWithFallback(() => rawClient.caseStudies.update(id, data), () => mockStorage.updateCaseStudy(id, data)),
    delete: (id: string) => tryWithFallback(async () => {}, () => mockStorage.deleteCaseStudy(id)),
  },

  calculators: {
    calculateRate: (data: any) => tryWithFallback(() => rawClient.calculators.calculateRate(data), () => mockStorage.calculateRate(data)),
    calculateRunway: (data: any) => tryWithFallback(() => rawClient.calculators.calculateRunway(data), () => mockStorage.calculateRunway(data)),
    getGoal: () => tryWithFallback(() => rawClient.calculators.listGoals().then((g) => g[0] || null), () => mockStorage.getGoal()),
    setGoal: (data: any) => tryWithFallback(() => rawClient.calculators.createGoal(data), () => mockStorage.setGoal(data)),
  },

  ai: {
    summarizeProject: (projectId: string) => tryWithFallback(() => rawClient.ai.projectSummary(projectId), () => mockStorage.aiSummarizeProject(projectId)),
    extractTasks: (text: string, projectId?: string) => tryWithFallback(() => rawClient.ai.taskExtraction(text), () => mockStorage.aiExtractTasks(text, projectId)),
    draftProposal: (data: any) => tryWithFallback(() => rawClient.ai.proposalDraft(data), () => mockStorage.aiDraftProposal(data)),
    draftFollowUp: (type: string, entityId: string) => tryWithFallback(() => rawClient.ai.followUpDraft(type, entityId), () => mockStorage.aiDraftFollowUp({ type, entityId })),
    businessQuery: (query: string) => tryWithFallback(() => rawClient.ai.businessQuery(query), () => mockStorage.aiBusinessQuery(query)),
  },
};
