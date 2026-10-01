import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  projects,
  clients,
  timeEntries,
  invoices,
  payments,
  expenses,
  revisions,
} from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string) {
    const projectList = await this.dbService.db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
      orderBy: [desc(projects.createdAt)],
    });

    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });

    const allTime = await this.dbService.db.query.timeEntries.findMany({
      where: eq(timeEntries.organizationId, organizationId),
    });

    const allInvoices = await this.dbService.db.query.invoices.findMany({
      where: eq(invoices.organizationId, organizationId),
    });

    const allPayments = await this.dbService.db.query.payments.findMany({
      where: eq(payments.organizationId, organizationId),
    });

    const allExpenses = await this.dbService.db.query.expenses.findMany({
      where: eq(expenses.organizationId, organizationId),
    });

    const allRevisions = await this.dbService.db.query.revisions.findMany({
      where: eq(revisions.organizationId, organizationId),
    });

    const today = new Date().toISOString().split('T')[0];

    return projectList.map((project) => {
      const client = clientList.find((c) => c.id === project.clientId);
      const projTime = allTime.filter((t) => t.projectId === project.id);
      const totalMinutes = projTime.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
      const totalHoursTracked = Math.round((totalMinutes / 60) * 10) / 10;

      const projInvoices = allInvoices.filter((i) => i.projectId === project.id);
      const totalInvoiced = projInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

      const projInvoiceIds = new Set(projInvoices.map((i) => i.id));
      const projPayments = allPayments.filter((p) => projInvoiceIds.has(p.invoiceId));
      const totalPaid = projPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      const projExpenses = allExpenses.filter((e) => e.projectId === project.id);
      const totalExpenses = projExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      const profit = totalPaid - totalExpenses;
      const effectiveHourlyRate =
        totalHoursTracked > 0 ? Math.round(profit / totalHoursTracked) : 0;

      const projRevs = allRevisions.filter((r) => r.projectId === project.id);
      const completedRevisions = projRevs.length;

      // Dynamic health evaluation
      let health = project.health;
      let healthReason = project.healthReason;

      if (project.status !== 'completed' && project.deadline && project.deadline < today) {
        health = 'blocked';
        healthReason = 'Past agreed deadline';
      } else if (completedRevisions > project.includedRevisions) {
        health = 'at_risk';
        healthReason = 'Revisions exceed included scope';
      }

      return {
        ...project,
        clientName: client?.name || 'Unknown Client',
        totalHoursTracked,
        totalInvoiced,
        totalPaid,
        totalExpenses,
        profit,
        effectiveHourlyRate,
        completedRevisions,
        health,
        healthReason,
      };
    });
  }

  async get(organizationId: string, id: string) {
    const project = await this.dbService.db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.organizationId, organizationId)),
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const client = await this.dbService.db.query.clients.findFirst({
      where: eq(clients.id, project.clientId),
    });

    const projTime = await this.dbService.db.query.timeEntries.findMany({
      where: and(eq(timeEntries.projectId, id), eq(timeEntries.organizationId, organizationId)),
    });
    const totalMinutes = projTime.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
    const totalHoursTracked = Math.round((totalMinutes / 60) * 10) / 10;

    const projInvoices = await this.dbService.db.query.invoices.findMany({
      where: and(eq(invoices.projectId, id), eq(invoices.organizationId, organizationId)),
    });
    const totalInvoiced = projInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

    const projInvoiceIds = new Set(projInvoices.map((i) => i.id));
    const allPayments = await this.dbService.db.query.payments.findMany({
      where: eq(payments.organizationId, organizationId),
    });
    const projPayments = allPayments.filter((p) => projInvoiceIds.has(p.invoiceId));
    const totalPaid = projPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const projExpenses = await this.dbService.db.query.expenses.findMany({
      where: and(eq(expenses.projectId, id), eq(expenses.organizationId, organizationId)),
    });
    const totalExpenses = projExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const profit = totalPaid - totalExpenses;
    const effectiveHourlyRate =
      totalHoursTracked > 0 ? Math.round(profit / totalHoursTracked) : 0;

    const projRevs = await this.dbService.db.query.revisions.findMany({
      where: and(eq(revisions.projectId, id), eq(revisions.organizationId, organizationId)),
    });

    return {
      ...project,
      clientName: client?.name || 'Unknown Client',
      client,
      totalHoursTracked,
      totalInvoiced,
      totalPaid,
      totalExpenses,
      profit,
      effectiveHourlyRate,
      completedRevisions: projRevs.length,
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const code = `PRJ-${Math.floor(100 + Math.random() * 900)}`;

    await this.dbService.db.insert(projects).values({
      id,
      organizationId,
      clientId: data.clientId,
      name: data.name,
      code,
      description: data.description || null,
      status: data.status || 'active',
      health: data.health || 'healthy',
      healthReason: data.healthReason || null,
      startDate: data.startDate || now.split('T')[0],
      deadline: data.deadline || null,
      budget: data.budget || 0,
      currency: data.currency || 'USD',
      includedRevisions: data.includedRevisions || 2,
      progressPercent: data.progressPercent || 0,
      createdAt: now,
      updatedAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'project',
      entityId: id,
      action: 'created',
      description: `Created project "${data.name}" (${code})`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();

    await this.dbService.db
      .update(projects)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(projects.id, id), eq(projects.organizationId, organizationId)));

    await this.activityService.log({
      organizationId,
      entityType: 'project',
      entityId: id,
      action: 'updated',
      description: `Updated project "${data.name || id}"`,
    });

    return this.get(organizationId, id);
  }

  async delete(organizationId: string, id: string) {
    await this.dbService.db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.organizationId, organizationId)));
  }
}
