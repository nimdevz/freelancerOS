import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const tasksRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

tasksRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');

  const conditions = [eq(schema.tasks.organizationId, orgId)];
  if (projectId) {
    conditions.push(eq(schema.tasks.projectId, projectId));
  }

  const list = await db.query.tasks.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.tasks.createdAt)],
  });

  return c.json(list);
});

tasksRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const task = await db.query.tasks.findFirst({
    where: and(eq(schema.tasks.id, id), eq(schema.tasks.organizationId, orgId)),
  });

  if (!task) {
    return c.json({ message: 'Task not found' }, 404);
  }

  return c.json(task);
});

tasksRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.tasks).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    clientId: data.clientId || null,
    title: data.title,
    description: data.description || null,
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    dueDate: data.dueDate || null,
    estimatedHours: data.estimatedHours !== undefined ? Number(data.estimatedHours) : null,
    actualHours: data.actualHours !== undefined ? Number(data.actualHours) : null,
    clientVisible: data.clientVisible ? 1 : 0,
    tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : typeof data.tags === 'string' ? data.tags : '[]',
    createdAt: now,
    updatedAt: now,
  });

  const created = await db.query.tasks.findFirst({
    where: eq(schema.tasks.id, id),
  });

  return c.json(created, 201);
});

tasksRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.tasks.findFirst({
    where: and(eq(schema.tasks.id, id), eq(schema.tasks.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Task not found' }, 404);
  }

  const updateData: any = {
    updatedAt: now,
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.estimatedHours !== undefined) updateData.estimatedHours = Number(data.estimatedHours);
  if (data.actualHours !== undefined) updateData.actualHours = Number(data.actualHours);
  if (data.clientVisible !== undefined) updateData.clientVisible = data.clientVisible ? 1 : 0;
  if (data.tags !== undefined) {
    updateData.tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : String(data.tags);
  }

  await db.update(schema.tasks)
    .set(updateData)
    .where(and(eq(schema.tasks.id, id), eq(schema.tasks.organizationId, orgId)));

  const updated = await db.query.tasks.findFirst({
    where: eq(schema.tasks.id, id),
  });

  return c.json(updated);
});

tasksRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.tasks)
    .where(and(eq(schema.tasks.id, id), eq(schema.tasks.organizationId, orgId)));

  return c.body(null, 204);
});
