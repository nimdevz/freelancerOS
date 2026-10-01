import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { expenses, projects, clients } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string, projectId?: string) {
    let whereClause = eq(expenses.organizationId, organizationId);
    if (projectId) {
      whereClause = and(eq(expenses.organizationId, organizationId), eq(expenses.projectId, projectId)) as any;
    }

    const expList = await this.dbService.db.query.expenses.findMany({
      where: whereClause,
      orderBy: [desc(expenses.date)],
    });

    const projectList = await this.dbService.db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
    });

    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });

    return expList.map((e) => {
      const proj = projectList.find((p) => p.id === e.projectId);
      const client = clientList.find((c) => c.id === e.clientId);
      return {
        ...e,
        projectName: proj?.name || null,
        clientName: client?.name || null,
        isReimbursable: Boolean(e.isReimbursable),
      };
    });
  }

  async get(organizationId: string, id: string) {
    const e = await this.dbService.db.query.expenses.findFirst({
      where: and(eq(expenses.id, id), eq(expenses.organizationId, organizationId)),
    });

    if (!e) {
      throw new NotFoundException('Expense not found');
    }

    return {
      ...e,
      isReimbursable: Boolean(e.isReimbursable),
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(expenses).values({
      id,
      organizationId,
      date: data.date || now.split('T')[0],
      vendor: data.vendor,
      category: data.category || 'software',
      amount: data.amount,
      currency: data.currency || 'INR',
      projectId: data.projectId || null,
      clientId: data.clientId || null,
      receiptUrl: data.receiptUrl || null,
      notes: data.notes || null,
      isReimbursable: data.isReimbursable ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'expense',
      entityId: id,
      action: 'created',
      description: `Logged expense of ${data.currency || 'INR'} ${data.amount} for "${data.vendor}"`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();
    await this.dbService.db
      .update(expenses)
      .set({
        ...data,
        isReimbursable: data.isReimbursable !== undefined ? (data.isReimbursable ? 1 : 0) : undefined,
        updatedAt: now,
      })
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, organizationId)));

    return this.get(organizationId, id);
  }

  async delete(organizationId: string, id: string) {
    await this.dbService.db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.organizationId, organizationId)));
  }
}
