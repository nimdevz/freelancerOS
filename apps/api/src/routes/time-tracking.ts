import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const timeTrackingRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

timeTrackingRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');

  const conditions = [eq(schema.timeEntries.organizationId, orgId)];
  if (projectId) {
    conditions.push(eq(schema.timeEntries.projectId, projectId));
  }

  const list = await db.query.timeEntries.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.timeEntries.startTime)],
  });

  return c.json(list);
});

timeTrackingRouter.get('/active', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const active = await db.query.timeEntries.findFirst({
    where: and(
      eq(schema.timeEntries.organizationId, orgId),
      eq(schema.timeEntries.isRunning, 1),
    ),
  });

  return c.json(active || null);
});

timeTrackingRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.timeEntries).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    taskId: data.taskId || null,
    description: data.description || null,
    startTime: data.startTime || now,
    endTime: data.endTime || null,
    durationMinutes: data.durationMinutes !== undefined ? Number(data.durationMinutes) : 0,
    billable: data.billable !== undefined ? (data.billable ? 1 : 0) : 1,
    hourlyRate: data.hourlyRate !== undefined ? Number(data.hourlyRate) : 125,
    isRunning: data.isRunning ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  });

  const created = await db.query.timeEntries.findFirst({
    where: eq(schema.timeEntries.id, id),
  });

  return c.json(created, 201);
});

timeTrackingRouter.post('/start', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();

  // Stop any currently running timer in this organization
  const running = await db.query.timeEntries.findMany({
    where: and(
      eq(schema.timeEntries.organizationId, orgId),
      eq(schema.timeEntries.isRunning, 1),
    ),
  });

  for (const entry of running) {
    const startMs = new Date(entry.startTime).getTime();
    const endMs = new Date(now).getTime();
    const duration = Math.max(0, Math.round((endMs - startMs) / 60000));
    await db.update(schema.timeEntries)
      .set({
        isRunning: 0,
        endTime: now,
        durationMinutes: duration,
        updatedAt: now,
      })
      .where(eq(schema.timeEntries.id, entry.id));
  }

  const id = crypto.randomUUID();
  await db.insert(schema.timeEntries).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    taskId: data.taskId || null,
    description: data.description || 'Active Timer Session',
    startTime: now,
    endTime: null,
    durationMinutes: 0,
    billable: data.billable !== undefined ? (data.billable ? 1 : 0) : 1,
    hourlyRate: data.hourlyRate !== undefined ? Number(data.hourlyRate) : 125,
    isRunning: 1,
    createdAt: now,
    updatedAt: now,
  });

  const created = await db.query.timeEntries.findFirst({
    where: eq(schema.timeEntries.id, id),
  });

  return c.json(created, 201);
});

timeTrackingRouter.post('/:id/stop', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const entry = await db.query.timeEntries.findFirst({
    where: and(eq(schema.timeEntries.id, id), eq(schema.timeEntries.organizationId, orgId)),
  });

  if (!entry) {
    return c.json({ message: 'Time entry not found' }, 404);
  }

  const startMs = new Date(entry.startTime).getTime();
  const endMs = new Date(now).getTime();
  const duration = Math.max(0, Math.round((endMs - startMs) / 60000));

  await db.update(schema.timeEntries)
    .set({
      isRunning: 0,
      endTime: now,
      durationMinutes: duration,
      updatedAt: now,
    })
    .where(and(eq(schema.timeEntries.id, id), eq(schema.timeEntries.organizationId, orgId)));

  const updated = await db.query.timeEntries.findFirst({
    where: eq(schema.timeEntries.id, id),
  });

  return c.json(updated);
});
