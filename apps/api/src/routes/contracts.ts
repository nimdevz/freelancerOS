import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const contractsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

contractsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const list = await db.query.contracts.findMany({
    where: eq(schema.contracts.organizationId, orgId),
    orderBy: [desc(schema.contracts.createdAt)],
  });

  const clientList = await db.query.clients.findMany({
    where: eq(schema.clients.organizationId, orgId),
  });

  const projectList = await db.query.projects.findMany({
    where: eq(schema.projects.organizationId, orgId),
  });

  const enriched = list.map((con) => {
    const client = clientList.find((cl) => cl.id === con.clientId);
    const project = con.projectId ? projectList.find((p) => p.id === con.projectId) : null;
    return {
      ...con,
      clientName: client?.name || 'Client',
      projectName: project?.name || null,
    };
  });

  return c.json(enriched);
});

contractsRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const contract = await db.query.contracts.findFirst({
    where: and(eq(schema.contracts.id, id), eq(schema.contracts.organizationId, orgId)),
  });

  if (!contract) {
    return c.json({ message: 'Contract not found' }, 404);
  }

  const client = await db.query.clients.findFirst({
    where: eq(schema.clients.id, contract.clientId),
  });

  const project = contract.projectId
    ? await db.query.projects.findFirst({ where: eq(schema.projects.id, contract.projectId) })
    : null;

  return c.json({
    ...contract,
    clientName: client?.name || 'Client',
    projectName: project?.name || null,
    client,
    project,
  });
});

contractsRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.contracts).values({
    id,
    organizationId: orgId,
    clientId: data.clientId,
    projectId: data.projectId || null,
    title: data.title,
    status: data.status || 'draft',
    startDate: data.startDate || now.split('T')[0],
    endDate: data.endDate || null,
    terms: data.terms || 'Standard Master Services Agreement terms.',
    signedAt: data.signedAt || null,
    signedBy: data.signedBy || null,
    attachmentUrl: data.attachmentUrl || null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'contract',
    entityId: id,
    action: 'created',
    description: `Created contract "${data.title}"`,
    createdAt: now,
  });

  const created = await db.query.contracts.findFirst({
    where: eq(schema.contracts.id, id),
  });

  return c.json(created, 201);
});

contractsRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.contracts.findFirst({
    where: and(eq(schema.contracts.id, id), eq(schema.contracts.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Contract not found' }, 404);
  }

  const updateData: any = {
    updatedAt: now,
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.endDate !== undefined) updateData.endDate = data.endDate;
  if (data.terms !== undefined) updateData.terms = data.terms;
  if (data.attachmentUrl !== undefined) updateData.attachmentUrl = data.attachmentUrl;

  await db.update(schema.contracts)
    .set(updateData)
    .where(and(eq(schema.contracts.id, id), eq(schema.contracts.organizationId, orgId)));

  const updated = await db.query.contracts.findFirst({
    where: eq(schema.contracts.id, id),
  });

  return c.json(updated);
});

contractsRouter.post('/:id/sign', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const signerName = body.signerName || 'Client Signatory';
  const now = new Date().toISOString();

  const contract = await db.query.contracts.findFirst({
    where: and(eq(schema.contracts.id, id), eq(schema.contracts.organizationId, orgId)),
  });

  if (!contract) {
    return c.json({ message: 'Contract not found' }, 404);
  }

  await db.update(schema.contracts)
    .set({
      status: 'signed',
      signedAt: now,
      signedBy: signerName,
      updatedAt: now,
    })
    .where(eq(schema.contracts.id, id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'contract',
    entityId: id,
    action: 'signed',
    description: `Contract "${contract.title}" signed by ${signerName}`,
    createdAt: now,
  });

  const updated = await db.query.contracts.findFirst({
    where: eq(schema.contracts.id, id),
  });

  return c.json(updated);
});
