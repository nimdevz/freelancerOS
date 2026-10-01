import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const leadsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

leadsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const list = await db.query.leads.findMany({
    where: eq(schema.leads.organizationId, orgId),
    orderBy: [desc(schema.leads.createdAt)],
  });

  return c.json(list);
});

leadsRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const lead = await db.query.leads.findFirst({
    where: and(eq(schema.leads.id, id), eq(schema.leads.organizationId, orgId)),
  });

  if (!lead) {
    return c.json({ message: 'Lead not found' }, 404);
  }

  return c.json(lead);
});

leadsRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.leads).values({
    id,
    organizationId: orgId,
    title: data.title,
    clientName: data.clientName || data.contactName || 'Lead Contact',
    company: data.company || null,
    email: data.email || null,
    phone: data.phone || null,
    stage: data.stage || 'new',
    value: data.value ?? data.estimatedValue ?? 0,
    currency: data.currency || 'USD',
    probabilityPercent: data.probabilityPercent || 50,
    expectedCloseDate: data.expectedCloseDate || null,
    nextAction: data.nextAction || null,
    nextActionDate: data.nextActionDate || null,
    source: data.source || null,
    notes: data.notes || null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'lead',
    entityId: id,
    action: 'created',
    description: `New lead created: "${data.title}" (${data.clientName || 'Lead'})`,
    createdAt: now,
  });

  const created = await db.query.leads.findFirst({
    where: eq(schema.leads.id, id),
  });

  return c.json(created, 201);
});

leadsRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.leads.findFirst({
    where: and(eq(schema.leads.id, id), eq(schema.leads.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Lead not found' }, 404);
  }

  const updateData: any = {
    updatedAt: now,
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.clientName !== undefined) updateData.clientName = data.clientName;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.stage !== undefined) updateData.stage = data.stage;
  if (data.value !== undefined) updateData.value = Number(data.value);
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.probabilityPercent !== undefined) updateData.probabilityPercent = Number(data.probabilityPercent);
  if (data.expectedCloseDate !== undefined) updateData.expectedCloseDate = data.expectedCloseDate;
  if (data.nextAction !== undefined) updateData.nextAction = data.nextAction;
  if (data.nextActionDate !== undefined) updateData.nextActionDate = data.nextActionDate;
  if (data.source !== undefined) updateData.source = data.source;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await db.update(schema.leads)
    .set(updateData)
    .where(and(eq(schema.leads.id, id), eq(schema.leads.organizationId, orgId)));

  if (data.stage && data.stage !== existing.stage) {
    await db.insert(schema.activityLogs).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      entityType: 'lead',
      entityId: id,
      action: 'stage_changed',
      description: `Lead "${existing.title}" moved to stage ${data.stage}`,
      createdAt: now,
    });
  }

  const updated = await db.query.leads.findFirst({
    where: eq(schema.leads.id, id),
  });

  return c.json(updated);
});

leadsRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.leads)
    .where(and(eq(schema.leads.id, id), eq(schema.leads.organizationId, orgId)));

  return c.body(null, 204);
});

leadsRouter.post('/:id/convert', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const lead = await db.query.leads.findFirst({
    where: and(eq(schema.leads.id, id), eq(schema.leads.organizationId, orgId)),
  });

  if (!lead) {
    return c.json({ message: 'Lead not found' }, 404);
  }

  // 1. Create client from lead
  const clientId = crypto.randomUUID();
  await db.insert(schema.clients).values({
    id: clientId,
    organizationId: orgId,
    name: lead.clientName,
    company: lead.company || lead.clientName,
    email: lead.email || `${lead.clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.com`,
    phone: lead.phone || null,
    currency: lead.currency,
    notes: `Converted from lead "${lead.title}". Source: ${lead.source || 'Direct'}.`,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });

  // 2. Create project from lead
  const projectId = crypto.randomUUID();
  await db.insert(schema.projects).values({
    id: projectId,
    organizationId: orgId,
    clientId,
    name: lead.title,
    code: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
    status: 'active',
    health: 'healthy',
    startDate: now.split('T')[0],
    deadline: lead.expectedCloseDate,
    budget: lead.value,
    currency: lead.currency,
    includedRevisions: 2,
    progressPercent: 0,
    createdAt: now,
    updatedAt: now,
  });

  // 3. Mark lead as won
  await db.update(schema.leads)
    .set({ stage: 'won', updatedAt: now })
    .where(eq(schema.leads.id, id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'lead',
    entityId: id,
    action: 'converted',
    description: `Lead "${lead.title}" converted to Client and Project!`,
    createdAt: now,
  });

  const client = await db.query.clients.findFirst({ where: eq(schema.clients.id, clientId) });
  const project = await db.query.projects.findFirst({ where: eq(schema.projects.id, projectId) });

  return c.json({ client, project });
});
