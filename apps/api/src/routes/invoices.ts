import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const invoicesRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

invoicesRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const [list, clientList, projectList, allItems] = await Promise.all([
    db.query.invoices.findMany({
      where: eq(schema.invoices.organizationId, orgId),
      orderBy: [desc(schema.invoices.issueDate)],
    }),
    db.query.clients.findMany({
      where: eq(schema.clients.organizationId, orgId),
    }),
    db.query.projects.findMany({
      where: eq(schema.projects.organizationId, orgId),
    }),
    db.query.invoiceItems.findMany(),
  ]);

  const enriched = list.map((inv) => {
    const client = clientList.find((cl) => cl.id === inv.clientId);
    const proj = projectList.find((p) => p.id === inv.projectId);
    const items = allItems.filter((item) => item.invoiceId === inv.id);

    return {
      ...inv,
      clientName: client?.name || 'Client',
      projectName: proj?.name || null,
      items,
    };
  });

  return c.json(enriched);
});

invoicesRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const inv = await db.query.invoices.findFirst({
    where: and(eq(schema.invoices.id, id), eq(schema.invoices.organizationId, orgId)),
  });

  if (!inv) {
    return c.json({ message: 'Invoice not found' }, 404);
  }

  const [client, proj, items, invPayments] = await Promise.all([
    db.query.clients.findFirst({
      where: eq(schema.clients.id, inv.clientId),
    }),
    inv.projectId
      ? db.query.projects.findFirst({ where: eq(schema.projects.id, inv.projectId) })
      : Promise.resolve(null),
    db.query.invoiceItems.findMany({
      where: eq(schema.invoiceItems.invoiceId, id),
    }),
    db.query.payments.findMany({
      where: and(eq(schema.payments.invoiceId, id), eq(schema.payments.organizationId, orgId)),
      orderBy: [desc(schema.payments.paymentDate)],
    }),
  ]);

  return c.json({
    ...inv,
    clientName: client?.name || 'Client',
    projectName: proj?.name || null,
    client,
    project: proj,
    items,
    payments: invPayments,
  });
});

invoicesRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const invoiceNumber = data.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const items = data.items || [];
  let subtotal = 0;
  const computedItems = items.map((item: any) => {
    const qty = Number(item.quantity) || 1;
    const unit = Number(item.unitPrice) || 0;
    const amt = qty * unit;
    subtotal += amt;
    return {
      id: crypto.randomUUID(),
      invoiceId: id,
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
  const amountPaid = Number(data.amountPaid) || 0;
  const balanceDue = Math.max(0, totalAmount - amountPaid);

  await db.insert(schema.invoices).values({
    id,
    organizationId: orgId,
    clientId: data.clientId,
    projectId: data.projectId || null,
    invoiceNumber,
    title: data.title || `Invoice ${invoiceNumber}`,
    status: data.status || (amountPaid >= totalAmount && totalAmount > 0 ? 'paid' : 'draft'),
    issueDate: data.issueDate || now.split('T')[0],
    dueDate: data.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: data.currency || 'USD',
    subtotal,
    discountPercent,
    discountAmount,
    taxPercent,
    taxAmount,
    totalAmount,
    amountPaid,
    balanceDue,
    paymentTerms: data.paymentTerms || 'Net 14',
    notes: data.notes || null,
    sentAt: data.sentAt || null,
    paidAt: amountPaid >= totalAmount && totalAmount > 0 ? now : null,
    createdAt: now,
    updatedAt: now,
  });

  if (computedItems.length > 0) {
    await db.insert(schema.invoiceItems).values(computedItems);
  }

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'invoice',
    entityId: id,
    action: 'created',
    description: `Created invoice ${invoiceNumber} for ${totalAmount}`,
    createdAt: now,
  });

  const created = await db.query.invoices.findFirst({
    where: eq(schema.invoices.id, id),
  });

  return c.json({ ...created, items: computedItems }, 201);
});

invoicesRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.invoices.findFirst({
    where: and(eq(schema.invoices.id, id), eq(schema.invoices.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Invoice not found' }, 404);
  }

  const updateData: any = {
    updatedAt: now,
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.issueDate !== undefined) updateData.issueDate = data.issueDate;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
  if (data.totalAmount !== undefined) updateData.totalAmount = Number(data.totalAmount);
  if (data.balanceDue !== undefined) updateData.balanceDue = Number(data.balanceDue);
  if (data.amountPaid !== undefined) updateData.amountPaid = Number(data.amountPaid);

  await db.update(schema.invoices)
    .set(updateData)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.organizationId, orgId)));

  const updated = await db.query.invoices.findFirst({
    where: eq(schema.invoices.id, id),
  });

  return c.json(updated);
});

invoicesRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.invoices)
    .where(and(eq(schema.invoices.id, id), eq(schema.invoices.organizationId, orgId)));

  return c.body(null, 204);
});

invoicesRouter.post('/:id/send', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const inv = await db.query.invoices.findFirst({
    where: and(eq(schema.invoices.id, id), eq(schema.invoices.organizationId, orgId)),
  });

  if (!inv) {
    return c.json({ message: 'Invoice not found' }, 404);
  }

  await db.update(schema.invoices)
    .set({
      status: 'sent',
      sentAt: now,
      updatedAt: now,
    })
    .where(eq(schema.invoices.id, id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'invoice',
    entityId: id,
    action: 'sent',
    description: `Sent invoice ${inv.invoiceNumber} to client`,
    createdAt: now,
  });

  const updated = await db.query.invoices.findFirst({
    where: eq(schema.invoices.id, id),
  });

  return c.json(updated);
});

invoicesRouter.post('/:id/mark-overdue', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const inv = await db.query.invoices.findFirst({
    where: and(eq(schema.invoices.id, id), eq(schema.invoices.organizationId, orgId)),
  });

  if (!inv) {
    return c.json({ message: 'Invoice not found' }, 404);
  }

  await db.update(schema.invoices)
    .set({
      status: 'overdue',
      updatedAt: now,
    })
    .where(eq(schema.invoices.id, id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'invoice',
    entityId: id,
    action: 'marked_overdue',
    description: `Invoice ${inv.invoiceNumber} marked as overdue`,
    createdAt: now,
  });

  await db.insert(schema.notifications).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    type: 'invoice_overdue',
    title: `Invoice Overdue: ${inv.invoiceNumber}`,
    message: `Invoice ${inv.invoiceNumber} for ${inv.currency} ${inv.balanceDue} is past its due date (${inv.dueDate}).`,
    entityType: 'invoice',
    entityId: id,
    isRead: 0,
    createdAt: now,
  });

  const updated = await db.query.invoices.findFirst({
    where: eq(schema.invoices.id, id),
  });

  return c.json(updated);
});
