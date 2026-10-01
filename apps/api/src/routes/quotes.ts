import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const quotesRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

quotesRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const list = await db.query.quotes.findMany({
    where: eq(schema.quotes.organizationId, orgId),
    orderBy: [desc(schema.quotes.createdAt)],
  });

  const clientList = await db.query.clients.findMany({
    where: eq(schema.clients.organizationId, orgId),
  });

  const allItems = await db.query.quoteItems.findMany();

  const enriched = list.map((q) => {
    const client = clientList.find((cl) => cl.id === q.clientId);
    const items = allItems.filter((i) => i.quoteId === q.id);
    return {
      ...q,
      clientName: client?.name || 'Client',
      items,
    };
  });

  return c.json(enriched);
});

quotesRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const quote = await db.query.quotes.findFirst({
    where: and(eq(schema.quotes.id, id), eq(schema.quotes.organizationId, orgId)),
  });

  if (!quote) {
    return c.json({ message: 'Quote not found' }, 404);
  }

  const client = await db.query.clients.findFirst({
    where: eq(schema.clients.id, quote.clientId),
  });

  const items = await db.query.quoteItems.findMany({
    where: eq(schema.quoteItems.quoteId, id),
  });

  return c.json({
    ...quote,
    clientName: client?.name || 'Client',
    client,
    items,
  });
});

quotesRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const quoteNumber = data.quoteNumber || `QUO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const items = data.items || [];
  let subtotal = 0;
  const computedItems = items.map((item: any) => {
    const qty = Number(item.quantity) || 1;
    const unit = Number(item.unitPrice) || 0;
    const amt = qty * unit;
    subtotal += amt;
    return {
      id: crypto.randomUUID(),
      quoteId: id,
      description: item.description,
      quantity: qty,
      unitPrice: unit,
      amount: amt,
    };
  });

  const discountAmount = data.discountAmount !== undefined ? Number(data.discountAmount) : 0;
  const taxAmount = data.taxAmount !== undefined ? Number(data.taxAmount) : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount) + taxAmount;

  await db.insert(schema.quotes).values({
    id,
    organizationId: orgId,
    clientId: data.clientId,
    projectId: data.projectId || null,
    quoteNumber,
    title: data.title,
    status: data.status || 'draft',
    validUntil: data.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: data.currency || 'USD',
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    paymentTerms: data.paymentTerms || null,
    notes: data.notes || null,
    createdAt: now,
    updatedAt: now,
  });

  if (computedItems.length > 0) {
    await db.insert(schema.quoteItems).values(computedItems);
  }

  const created = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, id),
  });

  return c.json({ ...created, items: computedItems }, 201);
});

quotesRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.quotes.findFirst({
    where: and(eq(schema.quotes.id, id), eq(schema.quotes.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Quote not found' }, 404);
  }

  const updateData: any = {
    updatedAt: now,
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.validUntil !== undefined) updateData.validUntil = data.validUntil;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.totalAmount !== undefined) updateData.totalAmount = Number(data.totalAmount);

  await db.update(schema.quotes)
    .set(updateData)
    .where(and(eq(schema.quotes.id, id), eq(schema.quotes.organizationId, orgId)));

  const updated = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, id),
  });

  return c.json(updated);
});

quotesRouter.post('/:id/convert', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const quote = await db.query.quotes.findFirst({
    where: and(eq(schema.quotes.id, id), eq(schema.quotes.organizationId, orgId)),
  });

  if (!quote) {
    return c.json({ message: 'Quote not found' }, 404);
  }

  const projectId = crypto.randomUUID();
  const code = `PRJ-${Math.floor(100 + Math.random() * 900)}`;

  await db.insert(schema.projects).values({
    id: projectId,
    organizationId: orgId,
    clientId: quote.clientId,
    name: quote.title,
    code,
    status: 'active',
    health: 'healthy',
    startDate: now.split('T')[0],
    deadline: quote.validUntil,
    budget: quote.totalAmount,
    currency: quote.currency,
    includedRevisions: 2,
    progressPercent: 0,
    createdAt: now,
    updatedAt: now,
  });

  await db.update(schema.quotes)
    .set({
      status: 'accepted',
      projectId,
      updatedAt: now,
    })
    .where(eq(schema.quotes.id, id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'project',
    entityId: projectId,
    action: 'created_from_quote',
    description: `Project "${quote.title}" created from accepted quote ${quote.quoteNumber}`,
    createdAt: now,
  });

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
  });

  return c.json(project);
});
