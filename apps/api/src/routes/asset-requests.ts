import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const assetRequestsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

assetRequestsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');
  const clientId = c.req.query('clientId');

  const conditions = [eq(schema.assetRequests.organizationId, orgId)];
  if (projectId) conditions.push(eq(schema.assetRequests.projectId, projectId));
  if (clientId) conditions.push(eq(schema.assetRequests.clientId, clientId));

  const list = await db.query.assetRequests.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.assetRequests.createdAt)],
  });

  const allProjects = await db.query.projects.findMany({
    where: eq(schema.projects.organizationId, orgId),
  });

  const allClients = await db.query.clients.findMany({
    where: eq(schema.clients.organizationId, orgId),
  });

  const enriched = list.map((req) => {
    const proj = allProjects.find((p) => p.id === req.projectId);
    const client = allClients.find((cl) => cl.id === req.clientId);
    return {
      ...req,
      projectName: proj?.name || 'Project',
      clientName: client?.name || 'Client',
    };
  });

  return c.json(enriched);
});

assetRequestsRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.assetRequests).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    clientId: data.clientId || null,
    title: data.title,
    description: data.description || null,
    status: data.status || 'requested',
    dueDate: data.dueDate || null,
    fileUrl: data.fileUrl || null,
    fileName: data.fileName || null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'asset_request',
    entityId: id,
    action: 'created',
    description: `Created asset request "${data.title}"`,
    createdAt: now,
  });

  const created = await db.query.assetRequests.findFirst({
    where: eq(schema.assetRequests.id, id),
  });

  return c.json(created, 201);
});

assetRequestsRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.assetRequests.findFirst({
    where: and(eq(schema.assetRequests.id, id), eq(schema.assetRequests.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Asset request not found' }, 404);
  }

  const updateData: any = { updatedAt: now };
  if (data.status !== undefined) updateData.status = data.status;
  if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
  if (data.fileName !== undefined) updateData.fileName = data.fileName;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

  await db.update(schema.assetRequests)
    .set(updateData)
    .where(and(eq(schema.assetRequests.id, id), eq(schema.assetRequests.organizationId, orgId)));

  const updated = await db.query.assetRequests.findFirst({
    where: eq(schema.assetRequests.id, id),
  });

  return c.json(updated);
});

assetRequestsRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.assetRequests)
    .where(and(eq(schema.assetRequests.id, id), eq(schema.assetRequests.organizationId, orgId)));

  return c.body(null, 204);
});
