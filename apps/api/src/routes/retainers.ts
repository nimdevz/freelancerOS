import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const retainersRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

retainersRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const list = await db.query.retainers.findMany({
    where: eq(schema.retainers.organizationId, orgId),
    orderBy: [desc(schema.retainers.createdAt)],
  });

  const clientList = await db.query.clients.findMany({
    where: eq(schema.clients.organizationId, orgId),
  });

  const enriched = list.map((ret) => {
    const client = clientList.find((cl) => cl.id === ret.clientId);
    return {
      ...ret,
      clientName: client?.name || 'Client',
    };
  });

  return c.json(enriched);
});

retainersRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.retainers).values({
    id,
    organizationId: orgId,
    clientId: data.clientId,
    monthlyAmount: Number(data.monthlyAmount) || 0,
    currency: data.currency || 'USD',
    includedHours: Number(data.includedHours) || 20,
    usedHours: Number(data.usedHours) || 0,
    startDate: data.startDate || now.split('T')[0],
    renewalDate: data.renewalDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: data.status || 'active',
    createdAt: now,
    updatedAt: now,
  });

  const created = await db.query.retainers.findFirst({
    where: eq(schema.retainers.id, id),
  });

  return c.json(created, 201);
});

retainersRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.retainers.findFirst({
    where: and(eq(schema.retainers.id, id), eq(schema.retainers.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Retainer not found' }, 404);
  }

  const updateData: any = {
    updatedAt: now,
  };

  if (data.monthlyAmount !== undefined) updateData.monthlyAmount = Number(data.monthlyAmount);
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.includedHours !== undefined) updateData.includedHours = Number(data.includedHours);
  if (data.usedHours !== undefined) updateData.usedHours = Number(data.usedHours);
  if (data.renewalDate !== undefined) updateData.renewalDate = data.renewalDate;
  if (data.status !== undefined) updateData.status = data.status;

  await db.update(schema.retainers)
    .set(updateData)
    .where(and(eq(schema.retainers.id, id), eq(schema.retainers.organizationId, orgId)));

  const updated = await db.query.retainers.findFirst({
    where: eq(schema.retainers.id, id),
  });

  return c.json(updated);
});

retainersRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.retainers)
    .where(and(eq(schema.retainers.id, id), eq(schema.retainers.organizationId, orgId)));

  return c.body(null, 204);
});

