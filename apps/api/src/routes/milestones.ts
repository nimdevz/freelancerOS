import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, asc } from 'drizzle-orm';

export const milestonesRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

milestonesRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');

  const conditions = [eq(schema.projectMilestones.organizationId, orgId)];
  if (projectId) {
    conditions.push(eq(schema.projectMilestones.projectId, projectId));
  }

  const list = await db.query.projectMilestones.findMany({
    where: and(...conditions),
    orderBy: [asc(schema.projectMilestones.orderIndex), asc(schema.projectMilestones.dueDate)],
  });

  return c.json(list);
});

milestonesRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.projectMilestones).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    name: data.name,
    description: data.description || null,
    dueDate: data.dueDate,
    status: data.status || 'pending',
    paymentAmount: data.paymentAmount !== undefined ? Number(data.paymentAmount) : 0,
    invoiceId: data.invoiceId || null,
    orderIndex: data.orderIndex !== undefined ? Number(data.orderIndex) : 0,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'project',
    entityId: data.projectId,
    action: 'milestone_created',
    description: `Added milestone "${data.name}" due on ${data.dueDate}`,
    createdAt: now,
  });

  const created = await db.query.projectMilestones.findFirst({
    where: eq(schema.projectMilestones.id, id),
  });

  return c.json(created, 201);
});

milestonesRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.projectMilestones.findFirst({
    where: and(eq(schema.projectMilestones.id, id), eq(schema.projectMilestones.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Milestone not found' }, 404);
  }

  const updateData: any = { updatedAt: now };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.paymentAmount !== undefined) updateData.paymentAmount = Number(data.paymentAmount);
  if (data.orderIndex !== undefined) updateData.orderIndex = Number(data.orderIndex);

  await db.update(schema.projectMilestones)
    .set(updateData)
    .where(and(eq(schema.projectMilestones.id, id), eq(schema.projectMilestones.organizationId, orgId)));

  const updated = await db.query.projectMilestones.findFirst({
    where: eq(schema.projectMilestones.id, id),
  });

  return c.json(updated);
});

milestonesRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.projectMilestones)
    .where(and(eq(schema.projectMilestones.id, id), eq(schema.projectMilestones.organizationId, orgId)));

  return c.body(null, 204);
});
