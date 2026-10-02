import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const portalRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// Client Portal Public Inspection
portalRouter.get('/:clientId', async (c) => {
  const db = getDb(c.env);
  const clientId = c.req.param('clientId');

  const client = await db.query.clients.findFirst({
    where: eq(schema.clients.id, clientId),
  });

  if (!client) {
    return c.json({ message: 'Client workspace portal not found' }, 404);
  }

  const orgId = client.organizationId;

  // Fetch projects for this client (only public fields)
  const clientProjects = await db.query.projects.findMany({
    where: and(eq(schema.projects.clientId, clientId), eq(schema.projects.organizationId, orgId)),
  });

  const projectIds = clientProjects.map((p) => p.id);

  // Deliverables
  const allDeliverables = await db.query.deliverables.findMany({
    where: eq(schema.deliverables.organizationId, orgId),
    orderBy: [desc(schema.deliverables.createdAt)],
  });
  const clientDeliverables = allDeliverables.filter((d) => projectIds.includes(d.projectId));

  // Invoices
  const allInvoices = await db.query.invoices.findMany({
    where: and(eq(schema.invoices.clientId, clientId), eq(schema.invoices.organizationId, orgId)),
    orderBy: [desc(schema.invoices.issueDate)],
  });

  // Asset Requests
  const allAssetRequests = await db.query.assetRequests.findMany({
    where: and(eq(schema.assetRequests.clientId, clientId), eq(schema.assetRequests.organizationId, orgId)),
  });

  // Contracts
  const allContracts = await db.query.contracts.findMany({
    where: and(eq(schema.contracts.clientId, clientId), eq(schema.contracts.organizationId, orgId)),
  });

  return c.json({
    client: {
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email,
      currency: client.currency,
    },
    projects: clientProjects.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      status: p.status,
      deadline: p.deadline,
      progressPercent: p.progressPercent,
    })),
    deliverables: clientDeliverables,
    invoices: allInvoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      title: inv.title,
      status: inv.status,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      currency: inv.currency,
      totalAmount: inv.totalAmount,
      balanceDue: inv.balanceDue,
      amountPaid: inv.amountPaid,
    })),
    assetRequests: allAssetRequests,
    contracts: allContracts.map((con) => ({
      id: con.id,
      title: con.title,
      status: con.status,
      startDate: con.startDate,
      endDate: con.endDate,
      terms: con.terms,
      signedAt: con.signedAt,
      signedBy: con.signedBy,
    })),
  });
});

portalRouter.post('/:clientId/feedback', async (c) => {
  const db = getDb(c.env);
  const clientId = c.req.param('clientId');
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const client = await db.query.clients.findFirst({
    where: eq(schema.clients.id, clientId),
  });

  if (!client) {
    return c.json({ message: 'Client portal not found' }, 404);
  }

  await db.insert(schema.feedbackItems).values({
    id,
    organizationId: client.organizationId,
    deliverableId: data.deliverableId,
    versionNumber: data.versionNumber || 'V1',
    authorName: data.authorName || client.name,
    authorRole: 'client',
    content: data.content,
    timestampOrSection: data.timestampOrSection || null,
    status: 'open',
    createdAt: now,
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: client.organizationId,
    entityType: 'feedback',
    entityId: id,
    action: 'client_feedback_submitted',
    description: `Feedback submitted by ${client.name} on deliverable`,
    createdAt: now,
  });

  return c.json({ success: true, id }, 201);
});
