import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const expensesRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

expensesRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');

  const conditions = [eq(schema.expenses.organizationId, orgId)];
  if (projectId) {
    conditions.push(eq(schema.expenses.projectId, projectId));
  }

  const list = await db.query.expenses.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.expenses.date)],
  });

  const allProjects = await db.query.projects.findMany({
    where: eq(schema.projects.organizationId, orgId),
  });

  const allClients = await db.query.clients.findMany({
    where: eq(schema.clients.organizationId, orgId),
  });

  const enriched = list.map((exp) => {
    const proj = allProjects.find((p) => p.id === exp.projectId);
    const client = allClients.find((cl) => cl.id === exp.clientId);
    return {
      ...exp,
      projectName: proj?.name || null,
      clientName: client?.name || null,
    };
  });

  return c.json(enriched);
});

expensesRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const exp = await db.query.expenses.findFirst({
    where: and(eq(schema.expenses.id, id), eq(schema.expenses.organizationId, orgId)),
  });

  if (!exp) {
    return c.json({ message: 'Expense not found' }, 404);
  }

  return c.json(exp);
});

expensesRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.expenses).values({
    id,
    organizationId: orgId,
    date: data.date || now.split('T')[0],
    vendor: data.vendor,
    category: data.category || 'software',
    amount: Number(data.amount) || 0,
    currency: data.currency || 'USD',
    projectId: data.projectId || null,
    clientId: data.clientId || null,
    receiptUrl: data.receiptUrl || null,
    notes: data.notes || null,
    isReimbursable: data.isReimbursable ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  });

  const created = await db.query.expenses.findFirst({
    where: eq(schema.expenses.id, id),
  });

  return c.json(created, 201);
});

expensesRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.expenses.findFirst({
    where: and(eq(schema.expenses.id, id), eq(schema.expenses.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Expense not found' }, 404);
  }

  const updateData: any = {
    updatedAt: now,
  };

  if (data.vendor !== undefined) updateData.vendor = data.vendor;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.amount !== undefined) updateData.amount = Number(data.amount);
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.date !== undefined) updateData.date = data.date;
  if (data.projectId !== undefined) updateData.projectId = data.projectId;
  if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.isReimbursable !== undefined) updateData.isReimbursable = data.isReimbursable ? 1 : 0;

  await db.update(schema.expenses)
    .set(updateData)
    .where(and(eq(schema.expenses.id, id), eq(schema.expenses.organizationId, orgId)));

  const updated = await db.query.expenses.findFirst({
    where: eq(schema.expenses.id, id),
  });

  return c.json(updated);
});

expensesRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.expenses)
    .where(and(eq(schema.expenses.id, id), eq(schema.expenses.organizationId, orgId)));

  return c.body(null, 204);
});
