import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { clients, projects, invoices, payments } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClientsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string) {
    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
      orderBy: [desc(clients.createdAt)],
    });

    const allProjects = await this.dbService.db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
    });

    const allInvoices = await this.dbService.db.query.invoices.findMany({
      where: eq(invoices.organizationId, organizationId),
    });

    const allPayments = await this.dbService.db.query.payments.findMany({
      where: eq(payments.organizationId, organizationId),
    });

    return clientList.map((client) => {
      const clientProjs = allProjects.filter((p) => p.clientId === client.id);
      const activeProjectsCount = clientProjs.filter((p) => p.status === 'active' || p.status === 'review').length;
      const clientInvoices = allInvoices.filter((i) => i.clientId === client.id);
      const outstandingBalance = clientInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);
      const clientPayments = allPayments.filter((p) => p.clientId === client.id);
      const totalRevenue = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      return {
        ...client,
        activeProjectsCount,
        totalRevenue,
        outstandingBalance,
        lastActivityAt: client.updatedAt,
      };
    });
  }

  async get(organizationId: string, id: string) {
    const client = await this.dbService.db.query.clients.findFirst({
      where: and(eq(clients.id, id), eq(clients.organizationId, organizationId)),
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const clientProjects = await this.dbService.db.query.projects.findMany({
      where: and(eq(projects.clientId, id), eq(projects.organizationId, organizationId)),
      orderBy: [desc(projects.createdAt)],
    });

    const clientInvoices = await this.dbService.db.query.invoices.findMany({
      where: and(eq(invoices.clientId, id), eq(invoices.organizationId, organizationId)),
      orderBy: [desc(invoices.createdAt)],
    });

    const clientPayments = await this.dbService.db.query.payments.findMany({
      where: and(eq(payments.clientId, id), eq(payments.organizationId, organizationId)),
      orderBy: [desc(payments.createdAt)],
    });

    const activeProjectsCount = clientProjects.filter((p) => p.status === 'active' || p.status === 'review').length;
    const outstandingBalance = clientInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);
    const totalRevenue = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      ...client,
      activeProjectsCount,
      totalRevenue,
      outstandingBalance,
      projects: clientProjects,
      invoices: clientInvoices,
      payments: clientPayments,
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(clients).values({
      id,
      organizationId,
      name: data.name,
      company: data.company || null,
      email: data.email,
      phone: data.phone || null,
      website: data.website || null,
      address: data.address || null,
      currency: data.currency || 'USD',
      notes: data.notes || null,
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'client',
      entityId: id,
      action: 'created',
      description: `Added client "${data.name}"`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();
    await this.dbService.db
      .update(clients)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)));

    await this.activityService.log({
      organizationId,
      entityType: 'client',
      entityId: id,
      action: 'updated',
      description: `Updated client "${data.name || id}"`,
    });

    return this.get(organizationId, id);
  }

  async delete(organizationId: string, id: string) {
    await this.dbService.db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)));

    await this.activityService.log({
      organizationId,
      entityType: 'client',
      entityId: id,
      action: 'deleted',
      description: `Deleted client`,
    });
  }

  async getTimeline(organizationId: string, clientId: string) {
    return this.activityService.listForEntity(organizationId, clientId);
  }
}
