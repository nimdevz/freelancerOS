import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { payments, invoices, clients } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(organizationId: string, invoiceId?: string) {
    let whereClause = eq(payments.organizationId, organizationId);
    if (invoiceId) {
      whereClause = and(eq(payments.organizationId, organizationId), eq(payments.invoiceId, invoiceId)) as any;
    }

    const payList = await this.dbService.db.query.payments.findMany({
      where: whereClause,
      orderBy: [desc(payments.paymentDate)],
    });

    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });

    const invList = await this.dbService.db.query.invoices.findMany({
      where: eq(invoices.organizationId, organizationId),
    });

    return payList.map((p) => {
      const client = clientList.find((c) => c.id === p.clientId);
      const inv = invList.find((i) => i.id === p.invoiceId);
      return {
        ...p,
        clientName: client?.name || 'Client',
        invoiceNumber: inv?.invoiceNumber || 'INV',
      };
    });
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const inv = await this.dbService.db.query.invoices.findFirst({
      where: and(eq(invoices.id, data.invoiceId), eq(invoices.organizationId, organizationId)),
    });

    if (!inv) {
      throw new NotFoundException('Invoice not found');
    }

    const paymentAmount = Number(data.amount);
    const newAmountPaid = (inv.amountPaid || 0) + paymentAmount;
    const newBalanceDue = Math.max(0, (inv.totalAmount || 0) - newAmountPaid);
    const isFullyPaid = newBalanceDue <= 0.01;
    const newStatus = isFullyPaid ? 'paid' : 'partially_paid';

    await this.dbService.db.insert(payments).values({
      id,
      organizationId,
      invoiceId: inv.id,
      clientId: inv.clientId,
      amount: paymentAmount,
      currency: data.currency || inv.currency,
      paymentMethod: data.paymentMethod || 'bank_transfer',
      paymentDate: data.paymentDate || now.split('T')[0],
      reference: data.reference || null,
      notes: data.notes || null,
      createdAt: now,
    });

    await this.dbService.db
      .update(invoices)
      .set({
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        paidAt: isFullyPaid ? now : inv.paidAt,
        updatedAt: now,
      })
      .where(eq(invoices.id, inv.id));

    await this.notificationsService.create({
      organizationId,
      type: 'approval_received',
      title: 'Payment Received',
      message: `Recorded payment of ${inv.currency} ${paymentAmount} for invoice ${inv.invoiceNumber}.`,
      entityType: 'payment',
      entityId: id,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'payment',
      entityId: id,
      action: 'recorded',
      description: `Payment of ${inv.currency} ${paymentAmount} recorded for ${inv.invoiceNumber} (${
        isFullyPaid ? 'Invoice Marked Paid' : `Balance: ${inv.currency} ${newBalanceDue}`
      })`,
    });

    return this.dbService.db.query.payments.findFirst({ where: eq(payments.id, id) });
  }
}
