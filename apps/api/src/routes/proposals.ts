import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const proposalsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

proposalsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const [list, clientList, allItems] = await Promise.all([
    db.query.proposals.findMany({
      where: eq(schema.proposals.organizationId, orgId),
      orderBy: [desc(schema.proposals.createdAt)],
    }),
    db.query.clients.findMany({
      where: eq(schema.clients.organizationId, orgId),
    }),
    db.query.proposalItems.findMany(),
  ]);

  const enriched = list.map((p) => {
    const client = clientList.find((cl) => cl.id === p.clientId);
    const items = allItems.filter((i) => i.proposalId === p.id);
    return {
      ...p,
      clientName: client?.name || 'Client',
      items,
    };
  });

  return c.json(enriched);
});

proposalsRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const proposal = await db.query.proposals.findFirst({
    where: and(eq(schema.proposals.id, id), eq(schema.proposals.organizationId, orgId)),
  });

  if (!proposal) {
    return c.json({ message: 'Proposal not found' }, 404);
  }

  const [client, items] = await Promise.all([
    db.query.clients.findFirst({
      where: eq(schema.clients.id, proposal.clientId),
    }),
    db.query.proposalItems.findMany({
      where: eq(schema.proposalItems.proposalId, id),
    }),
  ]);

  return c.json({
    ...proposal,
    clientName: client?.name || 'Client',
    client,
    items,
  });
});

proposalsRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const proposalNumber = data.proposalNumber || `PROP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const items = data.items || [];
  let subtotal = 0;
  const computedItems = items.map((item: any) => {
    const qty = Number(item.quantity) || 1;
    const unit = Number(item.unitPrice) || 0;
    const amt = qty * unit;
    subtotal += amt;
    return {
      id: crypto.randomUUID(),
      proposalId: id,
      description: item.description,
      quantity: qty,
      unitPrice: unit,
      amount: amt,
    };
  });

  const discountPercent = Number(data.discountPercent) || 0;
  const discountAmount = data.discountAmount !== undefined ? Number(data.discountAmount) : (subtotal * discountPercent) / 100;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxPercent = Number(data.taxPercent) || 0;
  const taxAmount = data.taxAmount !== undefined ? Number(data.taxAmount) : (afterDiscount * taxPercent) / 100;
  const totalAmount = afterDiscount + taxAmount;

  await db.insert(schema.proposals).values({
    id,
    organizationId: orgId,
    clientId: data.clientId,
    projectId: data.projectId || null,
    proposalNumber,
    title: data.title,
    status: data.status || 'draft',
    validUntil: data.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency: data.currency || 'USD',
    subtotal,
    discountPercent,
    discountAmount,
    taxPercent,
    taxAmount,
    totalAmount,
    terms: data.terms || null,
    notes: data.notes || null,
    sentAt: data.sentAt || null,
    acceptedAt: data.acceptedAt || null,
    createdAt: now,
    updatedAt: now,
  });

  if (computedItems.length > 0) {
    await db.insert(schema.proposalItems).values(computedItems);
  }

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'proposal',
    entityId: id,
    action: 'created',
    description: `Created proposal "${data.title}" (${proposalNumber}) for ${totalAmount}`,
    createdAt: now,
  });

  const created = await db.query.proposals.findFirst({
    where: eq(schema.proposals.id, id),
  });

  return c.json({ ...created, items: computedItems }, 201);
});

proposalsRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.proposals.findFirst({
    where: and(eq(schema.proposals.id, id), eq(schema.proposals.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Proposal not found' }, 404);
  }

  const updateData: any = {
    updatedAt: now,
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.validUntil !== undefined) updateData.validUntil = data.validUntil;
  if (data.terms !== undefined) updateData.terms = data.terms;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.totalAmount !== undefined) updateData.totalAmount = Number(data.totalAmount);

  await db.update(schema.proposals)
    .set(updateData)
    .where(and(eq(schema.proposals.id, id), eq(schema.proposals.organizationId, orgId)));

  const updated = await db.query.proposals.findFirst({
    where: eq(schema.proposals.id, id),
  });

  return c.json(updated);
});

proposalsRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.proposals)
    .where(and(eq(schema.proposals.id, id), eq(schema.proposals.organizationId, orgId)));

  return c.body(null, 204);
});

proposalsRouter.post('/:id/send', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const proposal = await db.query.proposals.findFirst({
    where: and(eq(schema.proposals.id, id), eq(schema.proposals.organizationId, orgId)),
  });

  if (!proposal) {
    return c.json({ message: 'Proposal not found' }, 404);
  }

  await db.update(schema.proposals)
    .set({
      status: 'sent',
      sentAt: now,
      updatedAt: now,
    })
    .where(eq(schema.proposals.id, id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'proposal',
    entityId: id,
    action: 'sent',
    description: `Sent proposal "${proposal.title}" (${proposal.proposalNumber}) to client`,
    createdAt: now,
  });

  const updated = await db.query.proposals.findFirst({
    where: eq(schema.proposals.id, id),
  });

  return c.json(updated);
});

proposalsRouter.post('/:id/accept', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const proposal = await db.query.proposals.findFirst({
    where: and(eq(schema.proposals.id, id), eq(schema.proposals.organizationId, orgId)),
  });

  if (!proposal) {
    return c.json({ message: 'Proposal not found' }, 404);
  }

  await db.update(schema.proposals)
    .set({
      status: 'accepted',
      acceptedAt: now,
      updatedAt: now,
    })
    .where(eq(schema.proposals.id, id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'proposal',
    entityId: id,
    action: 'accepted',
    description: `Proposal "${proposal.title}" accepted!`,
    createdAt: now,
  });

  await db.insert(schema.notifications).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    type: 'proposal_accepted',
    title: 'Proposal Accepted',
    message: `Client accepted proposal "${proposal.title}" (${proposal.proposalNumber})`,
    entityType: 'proposal',
    entityId: id,
    isRead: 0,
    createdAt: now,
  });

  const updated = await db.query.proposals.findFirst({
    where: eq(schema.proposals.id, id),
  });

  return c.json(updated);
});

proposalsRouter.post('/:id/decline', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const proposal = await db.query.proposals.findFirst({
    where: and(eq(schema.proposals.id, id), eq(schema.proposals.organizationId, orgId)),
  });

  if (!proposal) {
    return c.json({ message: 'Proposal not found' }, 404);
  }

  await db.update(schema.proposals)
    .set({
      status: 'declined',
      updatedAt: now,
    })
    .where(eq(schema.proposals.id, id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'proposal',
    entityId: id,
    action: 'declined',
    description: `Proposal "${proposal.title}" was declined`,
    createdAt: now,
  });

  const updated = await db.query.proposals.findFirst({
    where: eq(schema.proposals.id, id),
  });

  return c.json(updated);
});
