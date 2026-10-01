import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { invoices, invoiceItems, clients, projects, payments } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(organizationId: string) {
    const list = await this.dbService.db.query.invoices.findMany({
      where: eq(invoices.organizationId, organizationId),
      orderBy: [desc(invoices.issueDate)],
    });

    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });

    const projectList = await this.dbService.db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
    });

    const allItems = await this.dbService.db.query.invoiceItems.findMany();

    return list.map((inv) => {
      const client = clientList.find((c) => c.id === inv.clientId);
      const proj = projectList.find((p) => p.id === inv.projectId);
      const items = allItems.filter((item) => item.invoiceId === inv.id);

      return {
        ...inv,
        clientName: client?.name || 'Client',
        projectName: proj?.name || null,
        items,
      };
    });
  }

  async get(organizationId: string, id: string) {
    const inv = await this.dbService.db.query.invoices.findFirst({
      where: and(eq(invoices.id, id), eq(invoices.organizationId, organizationId)),
    });

    if (!inv) {
      throw new NotFoundException('Invoice not found');
    }

    const client = await this.dbService.db.query.clients.findFirst({
      where: eq(clients.id, inv.clientId),
    });

    const proj = inv.projectId
      ? await this.dbService.db.query.projects.findFirst({ where: eq(projects.id, inv.projectId) })
      : null;

    const items = await this.dbService.db.query.invoiceItems.findMany({
      where: eq(invoiceItems.invoiceId, id),
    });

    const invPayments = await this.dbService.db.query.payments.findMany({
      where: and(eq(payments.invoiceId, id), eq(payments.organizationId, organizationId)),
      orderBy: [desc(payments.paymentDate)],
    });

    return {
      ...inv,
      clientName: client?.name || 'Client',
      projectName: proj?.name || null,
      client,
      project: proj,
      items,
      payments: invPayments,
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const items = data.items || [];
    let subtotal = 0;
    const computedItems = items.map((item: any) => {
      const qty = item.quantity || 1;
      const unit = item.unitPrice || 0;
      const amt = qty * unit;
      subtotal += amt;
      return {
        id: uuidv4(),
        invoiceId: id,
        description: item.description,
        quantity: qty,
        unitPrice: unit,
        amount: amt,
      };
    });

    const discountPercent = data.discountPercent || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxPercent = data.taxPercent || 18;
    const taxAmount = taxableAmount * (taxPercent / 100);
    const totalAmount = taxableAmount + taxAmount;
    const amountPaid = 0;
    const balanceDue = totalAmount;

    await this.dbService.db.insert(invoices).values({
      id,
      organizationId,
      clientId: data.clientId,
      projectId: data.projectId || null,
      invoiceNumber,
      title: data.title,
      status: 'draft',
      issueDate: data.issueDate || now.split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      currency: data.currency || 'INR',
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
      createdAt: now,
      updatedAt: now,
    });

    for (const item of computedItems) {
      await this.dbService.db.insert(invoiceItems).values(item);
    }

    await this.activityService.log({
      organizationId,
      entityType: 'invoice',
      entityId: id,
      action: 'created',
      description: `Created invoice ${invoiceNumber} (${data.title})`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();
    await this.dbService.db
      .update(invoices)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, organizationId)));

    return this.get(organizationId, id);
  }

  async send(organizationId: string, id: string) {
    const now = new Date().toISOString();
    const inv = await this.get(organizationId, id);

    await this.dbService.db
      .update(invoices)
      .set({
        status: 'sent',
        sentAt: now,
        updatedAt: now,
      })
      .where(eq(invoices.id, id));

    await this.activityService.log({
      organizationId,
      entityType: 'invoice',
      entityId: id,
      action: 'sent',
      description: `Invoice ${inv.invoiceNumber} sent to ${inv.clientName}`,
    });

    return this.get(organizationId, id);
  }

  async markOverdue(organizationId: string, id: string) {
    const now = new Date().toISOString();
    const inv = await this.get(organizationId, id);

    await this.dbService.db
      .update(invoices)
      .set({ status: 'overdue', updatedAt: now })
      .where(eq(invoices.id, id));

    await this.notificationsService.create({
      organizationId,
      type: 'invoice_overdue',
      title: 'Invoice Overdue',
      message: `Invoice ${inv.invoiceNumber} for ${inv.clientName} is overdue (${inv.currency} ${inv.balanceDue}).`,
      entityType: 'invoice',
      entityId: id,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'invoice',
      entityId: id,
      action: 'marked_overdue',
      description: `Invoice ${inv.invoiceNumber} marked overdue`,
    });

    return this.get(organizationId, id);
  }

  async delete(organizationId: string, id: string) {
    await this.dbService.db
      .delete(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    await this.dbService.db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, organizationId)));
  }
}
