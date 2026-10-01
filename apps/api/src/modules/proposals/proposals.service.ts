import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { proposals, proposalItems, clients, projects } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(organizationId: string) {
    const list = await this.dbService.db.query.proposals.findMany({
      where: eq(proposals.organizationId, organizationId),
      orderBy: [desc(proposals.createdAt)],
    });

    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });

    const allItems = await this.dbService.db.query.proposalItems.findMany();

    return list.map((p) => {
      const client = clientList.find((c) => c.id === p.clientId);
      const items = allItems.filter((item) => item.proposalId === p.id);
      return {
        ...p,
        clientName: client?.name || 'Unknown Client',
        items,
      };
    });
  }

  async get(organizationId: string, id: string) {
    const proposal = await this.dbService.db.query.proposals.findFirst({
      where: and(eq(proposals.id, id), eq(proposals.organizationId, organizationId)),
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const client = await this.dbService.db.query.clients.findFirst({
      where: eq(clients.id, proposal.clientId),
    });

    const items = await this.dbService.db.query.proposalItems.findMany({
      where: eq(proposalItems.proposalId, id),
    });

    return {
      ...proposal,
      clientName: client?.name || 'Unknown Client',
      items,
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const proposalNumber = `PROP-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = data.items || [];
    let subtotal = 0;
    const computedItems = items.map((item: any) => {
      const qty = item.quantity || 1;
      const unit = item.unitPrice || 0;
      const amt = qty * unit;
      subtotal += amt;
      return {
        id: uuidv4(),
        proposalId: id,
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

    await this.dbService.db.insert(proposals).values({
      id,
      organizationId,
      clientId: data.clientId,
      projectId: data.projectId || null,
      proposalNumber,
      title: data.title,
      status: 'draft',
      validUntil: data.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      currency: data.currency || 'INR',
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      totalAmount,
      terms: data.terms || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    });

    for (const item of computedItems) {
      await this.dbService.db.insert(proposalItems).values(item);
    }

    await this.activityService.log({
      organizationId,
      entityType: 'proposal',
      entityId: id,
      action: 'created',
      description: `Created proposal "${data.title}" (${proposalNumber})`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();

    await this.dbService.db
      .update(proposals)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(proposals.id, id), eq(proposals.organizationId, organizationId)));

    return this.get(organizationId, id);
  }

  async send(organizationId: string, id: string) {
    const now = new Date().toISOString();
    const proposal = await this.get(organizationId, id);

    await this.dbService.db
      .update(proposals)
      .set({
        status: 'sent',
        sentAt: now,
        updatedAt: now,
      })
      .where(eq(proposals.id, id));

    await this.activityService.log({
      organizationId,
      entityType: 'proposal',
      entityId: id,
      action: 'sent',
      description: `Proposal ${proposal.proposalNumber} sent to ${proposal.clientName}`,
    });

    return this.get(organizationId, id);
  }

  async accept(organizationId: string, id: string) {
    const now = new Date().toISOString();
    const proposal = await this.get(organizationId, id);

    await this.dbService.db
      .update(proposals)
      .set({
        status: 'accepted',
        acceptedAt: now,
        updatedAt: now,
      })
      .where(eq(proposals.id, id));

    await this.notificationsService.create({
      organizationId,
      type: 'approval_received',
      title: 'Proposal Accepted',
      message: `${proposal.clientName} accepted proposal ${proposal.proposalNumber} (${proposal.currency} ${proposal.totalAmount})!`,
      entityType: 'proposal',
      entityId: id,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'proposal',
      entityId: id,
      action: 'accepted',
      description: `Proposal ${proposal.proposalNumber} accepted by ${proposal.clientName}`,
    });

    // If proposal doesn't have an associated project yet, automatically create one!
    if (!proposal.projectId) {
      const projId = uuidv4();
      await this.dbService.db.insert(projects).values({
        id: projId,
        organizationId,
        clientId: proposal.clientId,
        name: proposal.title,
        code: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        status: 'active',
        health: 'healthy',
        startDate: now.split('T')[0],
        deadline: proposal.validUntil,
        budget: proposal.totalAmount,
        currency: proposal.currency,
        includedRevisions: 2,
        progressPercent: 0,
        createdAt: now,
        updatedAt: now,
      });

      await this.dbService.db
        .update(proposals)
        .set({ projectId: projId })
        .where(eq(proposals.id, id));
    }

    return this.get(organizationId, id);
  }

  async decline(organizationId: string, id: string) {
    const now = new Date().toISOString();
    await this.dbService.db
      .update(proposals)
      .set({ status: 'declined', updatedAt: now })
      .where(eq(proposals.id, id));
    return this.get(organizationId, id);
  }

  async delete(organizationId: string, id: string) {
    await this.dbService.db
      .delete(proposalItems)
      .where(eq(proposalItems.proposalId, id));

    await this.dbService.db
      .delete(proposals)
      .where(and(eq(proposals.id, id), eq(proposals.organizationId, organizationId)));
  }
}
