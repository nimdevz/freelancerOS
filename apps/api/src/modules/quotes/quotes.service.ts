import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { quotes, quoteItems, clients, projects } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuotesService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string) {
    const list = await this.dbService.db.query.quotes.findMany({
      where: eq(quotes.organizationId, organizationId),
      orderBy: [desc(quotes.createdAt)],
    });

    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });

    const allItems = await this.dbService.db.query.quoteItems.findMany();

    return list.map((q) => {
      const client = clientList.find((c) => c.id === q.clientId);
      const items = allItems.filter((item) => item.quoteId === q.id);
      return {
        ...q,
        clientName: client?.name || 'Unknown Client',
        items,
      };
    });
  }

  async get(organizationId: string, id: string) {
    const quote = await this.dbService.db.query.quotes.findFirst({
      where: and(eq(quotes.id, id), eq(quotes.organizationId, organizationId)),
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    const client = await this.dbService.db.query.clients.findFirst({
      where: eq(clients.id, quote.clientId),
    });

    const items = await this.dbService.db.query.quoteItems.findMany({
      where: eq(quoteItems.quoteId, id),
    });

    return {
      ...quote,
      clientName: client?.name || 'Unknown Client',
      items,
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const quoteNumber = `QTE-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = data.items || [];
    let subtotal = 0;
    const computedItems = items.map((item: any) => {
      const qty = item.quantity || 1;
      const unit = item.unitPrice || 0;
      const amt = qty * unit;
      subtotal += amt;
      return {
        id: uuidv4(),
        quoteId: id,
        description: item.description,
        quantity: qty,
        unitPrice: unit,
        amount: amt,
      };
    });

    const discountAmount = data.discountAmount || 0;
    const taxAmount = data.taxAmount || 0;
    const totalAmount = subtotal - discountAmount + taxAmount;

    await this.dbService.db.insert(quotes).values({
      id,
      organizationId,
      clientId: data.clientId,
      projectId: data.projectId || null,
      quoteNumber,
      title: data.title,
      status: 'draft',
      validUntil: data.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      currency: data.currency || 'USD',
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paymentTerms: data.paymentTerms || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    });

    for (const item of computedItems) {
      await this.dbService.db.insert(quoteItems).values(item);
    }

    await this.activityService.log({
      organizationId,
      entityType: 'quote',
      entityId: id,
      action: 'created',
      description: `Created quote "${data.title}" (${quoteNumber})`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();
    await this.dbService.db
      .update(quotes)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(quotes.id, id), eq(quotes.organizationId, organizationId)));

    return this.get(organizationId, id);
  }

  async convertToProject(organizationId: string, id: string) {
    const quote = await this.get(organizationId, id);
    const now = new Date().toISOString();
    const projectId = uuidv4();

    await this.dbService.db.insert(projects).values({
      id: projectId,
      organizationId,
      clientId: quote.clientId,
      name: quote.title,
      code: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      status: 'active',
      health: 'healthy',
      startDate: now.split('T')[0],
      budget: quote.totalAmount,
      currency: quote.currency,
      includedRevisions: 2,
      progressPercent: 0,
      createdAt: now,
      updatedAt: now,
    });

    await this.dbService.db
      .update(quotes)
      .set({ status: 'converted', projectId, updatedAt: now })
      .where(eq(quotes.id, id));

    await this.activityService.log({
      organizationId,
      entityType: 'quote',
      entityId: id,
      action: 'converted',
      description: `Quote ${quote.quoteNumber} converted to Project`,
    });

    return this.dbService.db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  }
}
