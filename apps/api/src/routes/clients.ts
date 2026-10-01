import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const clientsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

clientsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const clientList = await db.query.clients.findMany({
    where: eq(schema.clients.organizationId, orgId),
    orderBy: [desc(schema.clients.createdAt)],
  });

  const allProjects = await db.query.projects.findMany({
    where: eq(schema.projects.organizationId, orgId),
  });

  const allInvoices = await db.query.invoices.findMany({
    where: eq(schema.invoices.organizationId, orgId),
  });

  const allPayments = await db.query.payments.findMany({
    where: eq(schema.payments.organizationId, orgId),
  });

  const enriched = clientList.map((client) => {
    const projs = allProjects.filter((p) => p.clientId === client.id);
    const activeProjectsCount = projs.filter((p) => p.status === 'active' || p.status === 'review').length;
    const invs = allInvoices.filter((i) => i.clientId === client.id);
    const outstandingBalance = invs.reduce((sum, i) => sum + (i.balanceDue || 0), 0);
    const pmts = allPayments.filter((p) => p.clientId === client.id);
    const totalRevenue = pmts.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      ...client,
      activeProjectsCount,
      totalRevenue,
      outstandingBalance,
      lastActivityAt: client.updatedAt,
    };
  });

  return c.json(enriched);
});

clientsRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const client = await db.query.clients.findFirst({
    where: and(eq(schema.clients.id, id), eq(schema.clients.organizationId, orgId)),
  });

  if (!client) {
    return c.json({ message: 'Client not found' }, 404);
  }

  const projs = await db.query.projects.findMany({
    where: and(eq(schema.projects.clientId, id), eq(schema.projects.organizationId, orgId)),
  });

  const invs = await db.query.invoices.findMany({
    where: and(eq(schema.invoices.clientId, id), eq(schema.invoices.organizationId, orgId)),
  });

  const contacts = await db.query.clientContacts.findMany({
    where: eq(schema.clientContacts.clientId, id),
  });

  const contractsList = await db.query.contracts.findMany({
    where: and(eq(schema.contracts.clientId, id), eq(schema.contracts.organizationId, orgId)),
  });

  return c.json({
    ...client,
    projects: projs,
    invoices: invs,
    contacts,
    contracts: contractsList,
  });
});

clientsRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.clients).values({
    id,
    organizationId: orgId,
    name: data.name,
    company: data.company || null,
    email: data.email,
    phone: data.phone || null,
    website: data.website || null,
    address: data.address || null,
    currency: data.currency || 'USD',
    notes: data.notes || null,
    status: data.status || 'active',
    createdAt: now,
    updatedAt: now,
  });

  if (data.primaryContactName) {
    await db.insert(schema.clientContacts).values({
      id: crypto.randomUUID(),
      clientId: id,
      name: data.primaryContactName,
      email: data.primaryContactEmail || data.email,
      phone: data.primaryContactPhone || data.phone || null,
      role: data.primaryContactRole || 'Primary Contact',
      isPrimary: 1,
      createdAt: now,
    });
  }

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'client',
    entityId: id,
    action: 'client_created',
    description: `Created client "${data.name}"`,
    metadata: '{}',
    createdAt: now,
  });

  const created = await db.query.clients.findFirst({
    where: eq(schema.clients.id, id),
  });
  return c.json(created, 201);
});

clientsRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();

  const client = await db.query.clients.findFirst({
    where: and(eq(schema.clients.id, id), eq(schema.clients.organizationId, orgId)),
  });
  if (!client) {
    return c.json({ message: 'Client not found' }, 404);
  }

  const updateData: any = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  delete updateData.id;
  delete updateData.organizationId;

  await db.update(schema.clients)
    .set(updateData)
    .where(eq(schema.clients.id, id));

  const updated = await db.query.clients.findFirst({
    where: eq(schema.clients.id, id),
  });
  return c.json(updated);
});

clientsRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.clients)
    .where(and(eq(schema.clients.id, id), eq(schema.clients.organizationId, orgId)));

  return c.body(null, 204);
});

clientsRouter.get('/:id/timeline', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const logs = await db.query.activityLogs.findMany({
    where: and(eq(schema.activityLogs.entityId, id), eq(schema.activityLogs.organizationId, orgId)),
    orderBy: [desc(schema.activityLogs.createdAt)],
  });

  return c.json(logs);
});
