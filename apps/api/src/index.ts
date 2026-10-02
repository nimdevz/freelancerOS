import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, AppVariables } from './env';
import { authMiddleware } from './middleware/auth';

// Route imports
import { authRouter } from './routes/auth';
import { organizationsRouter } from './routes/organizations';
import { clientsRouter } from './routes/clients';
import { leadsRouter } from './routes/leads';
import { projectsRouter } from './routes/projects';
import { tasksRouter } from './routes/tasks';
import { timeTrackingRouter } from './routes/time-tracking';
import { proposalsRouter } from './routes/proposals';
import { quotesRouter } from './routes/quotes';
import { contractsRouter } from './routes/contracts';
import { deliverablesRouter } from './routes/deliverables';
import { feedbackRouter } from './routes/feedback';
import { revisionsRouter } from './routes/revisions';
import { approvalsRouter } from './routes/approvals';
import { invoicesRouter } from './routes/invoices';
import { paymentsRouter } from './routes/payments';
import { expensesRouter } from './routes/expenses';
import { retainersRouter } from './routes/retainers';
import { dashboardRouter } from './routes/dashboard';
import { reportsRouter } from './routes/reports';
import { searchRouter } from './routes/search';
import { notificationsRouter } from './routes/notifications';
import { activityRouter } from './routes/activity';
import { filesRouter } from './routes/files';
import { seedRouter } from './routes/seed';
import { milestonesRouter } from './routes/milestones';
import { scopeRouter } from './routes/scope';
import { assetRequestsRouter } from './routes/asset-requests';
import { creativeRouter } from './routes/creative';
import { portalRouter } from './routes/portal';
import { caseStudiesRouter } from './routes/case-studies';
import { calculatorsRouter } from './routes/calculators';
import { aiRouter } from './routes/ai';

// Scheduled & Queue handlers
import { handleScheduled } from './scheduled/cron';
import { handleQueue } from './queues/consumer';

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// Global CORS Middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-organization-id', 'Accept'],
    exposeHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400,
  }),
);

// Health Check
app.get('/', (c) => c.json({ service: 'FreelancerOS Serverless API', status: 'healthy', runtime: 'Cloudflare Workers' }));
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Apply Auth Middleware to all API routes (except public portal and health)
app.use('/api/*', authMiddleware);

// Mount Routers under /api
app.route('/api/auth', authRouter);
app.route('/api/organizations', organizationsRouter);
app.route('/api/clients', clientsRouter);
app.route('/api/leads', leadsRouter);
app.route('/api/projects', projectsRouter);
app.route('/api/tasks', tasksRouter);
app.route('/api/time-tracking', timeTrackingRouter);
app.route('/api/proposals', proposalsRouter);
app.route('/api/quotes', quotesRouter);
app.route('/api/contracts', contractsRouter);
app.route('/api/deliverables', deliverablesRouter);
app.route('/api/feedback', feedbackRouter);
app.route('/api/revisions', revisionsRouter);
app.route('/api/approvals', approvalsRouter);
app.route('/api/invoices', invoicesRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/expenses', expensesRouter);
app.route('/api/retainers', retainersRouter);
app.route('/api/dashboard', dashboardRouter);
app.route('/api/reports', reportsRouter);
app.route('/api/search', searchRouter);
app.route('/api/notifications', notificationsRouter);
app.route('/api/activity', activityRouter);
app.route('/api/files', filesRouter);
app.route('/api/seed', seedRouter);
app.route('/api/milestones', milestonesRouter);
app.route('/api/scope', scopeRouter);
app.route('/api/asset-requests', assetRequestsRouter);
app.route('/api/creative', creativeRouter);
app.route('/api/portal', portalRouter);
app.route('/api/case-studies', caseStudiesRouter);
app.route('/api/calculators', calculatorsRouter);
app.route('/api/ai', aiRouter);

// Export Cloudflare Worker entrypoint with fetch, scheduled, and queue handlers
export default {
  fetch: app.fetch,
  scheduled: handleScheduled,
  queue: handleQueue,
};
