import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const paymentsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

paymentsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const invoiceId = c.req.query('invoiceId');

  const conditions = [eq(schema.payments.organizationId, orgId)];
  if (invoiceId) {
    conditions.push(eq(schema.payments.invoiceId, invoiceId));
  }

  const list = await db.query.payments.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.payments.paymentDate)],
  });

  const clientList = await db.query.clients.findMany({
    where: eq(schema.clients.organizationId, orgId),
  });

  const invoiceList = await db.query.invoices.findMany({
    where: eq(schema.invoices.organizationId, orgId),
  });

  const enriched = list.map((pmt) => {
    const client = clientList.find((cl) => cl.id === pmt.clientId);
    const invoice = invoiceList.find((inv) => inv.id === pmt.invoiceId);
    return {
      ...pmt,
      clientName: client?.name || 'Client',
      invoiceNumber: invoice?.invoiceNumber || 'Invoice',
    };
  });

  return c.json(enriched);
});

paymentsRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const amount = Number(data.amount) || 0;

  const invoice = await db.query.invoices.findFirst({
    where: and(eq(schema.invoices.id, data.invoiceId), eq(schema.invoices.organizationId, orgId)),
  });

  if (!invoice) {
    return c.json({ message: 'Invoice not found' }, 404);
  }

  const clientId = data.clientId || invoice.clientId;

  await db.insert(schema.payments).values({
    id,
    organizationId: orgId,
    invoiceId: data.invoiceId,
    clientId,
    amount,
    currency: data.currency || invoice.currency || 'USD',
    paymentMethod: data.paymentMethod || 'bank_transfer',
    paymentDate: data.paymentDate || now.split('T')[0],
    reference: data.reference || null,
    notes: data.notes || null,
    createdAt: now,
  });

  // Update invoice balance and status
  const currentPaid = invoice.amountPaid || 0;
  const newAmountPaid = currentPaid + amount;
  const newBalanceDue = Math.max(0, invoice.totalAmount - newAmountPaid);
  const newStatus = newBalanceDue <= 0 ? 'paid' : 'partially_paid';

  await db.update(schema.invoices)
    .set({
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue,
      status: newStatus,
      paidAt: newStatus === 'paid' ? now : invoice.paidAt,
      updatedAt: now,
    })
    .where(eq(schema.invoices.id, invoice.id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'payment',
    entityId: id,
    action: 'received',
    description: `Payment of ${invoice.currency} ${amount} received for invoice ${invoice.invoiceNumber}`,
    createdAt: now,
  });

  await db.insert(schema.notifications).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Received ${invoice.currency} ${amount} for invoice ${invoice.invoiceNumber}. New balance: ${invoice.currency} ${newBalanceDue}.`,
    entityType: 'payment',
    entityId: id,
    isRead: 0,
    createdAt: now,
  });

  const created = await db.query.payments.findFirst({
    where: eq(schema.payments.id, id),
  });

  return c.json(created, 201);
});
