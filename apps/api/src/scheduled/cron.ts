import { Env } from '../env';
import { getDb, schema } from '../db';
import { and, eq, lte } from 'drizzle-orm';

export async function handleScheduled(
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
) {
  console.log(`[Cron Trigger] Running scheduled task at ${new Date(controller.scheduledTime).toISOString()}`);

  const db = getDb(env);
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  // Sweep for overdue invoices
  const overdueList = await db.query.invoices.findMany({
    where: and(lte(schema.invoices.dueDate, today)),
  });

  for (const inv of overdueList) {
    if (inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'partially_paid') {
      await db.update(schema.invoices)
        .set({ status: 'overdue', updatedAt: now })
        .where(eq(schema.invoices.id, inv.id));

      await db.insert(schema.notifications).values({
        id: crypto.randomUUID(),
        organizationId: inv.organizationId,
        type: 'invoice_overdue',
        title: `Invoice Overdue: ${inv.invoiceNumber}`,
        message: `Invoice ${inv.invoiceNumber} (${inv.title}) of ${inv.currency} ${inv.balanceDue} was due on ${inv.dueDate}.`,
        entityType: 'invoice',
        entityId: inv.id,
        isRead: 0,
        createdAt: now,
      });

      await db.insert(schema.activityLogs).values({
        id: crypto.randomUUID(),
        organizationId: inv.organizationId,
        entityType: 'invoice',
        entityId: inv.id,
        action: 'invoice_overdue',
        description: `Invoice ${inv.invoiceNumber} automatically marked overdue by Cloudflare Cron Trigger.`,
        createdAt: now,
      });

      console.log(`[Cron Trigger] Marked invoice ${inv.invoiceNumber} overdue.`);
    }
  }
}
