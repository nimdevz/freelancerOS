import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { retainers, clients } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RetainersService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string) {
    const list = await this.dbService.db.query.retainers.findMany({
      where: eq(retainers.organizationId, organizationId),
      orderBy: [desc(retainers.createdAt)],
    });

    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });

    return list.map((r) => {
      const client = clientList.find((c) => c.id === r.clientId);
      const remainingHours = Math.max(0, (r.includedHours || 0) - (r.usedHours || 0));

      return {
        ...r,
        clientName: client?.name || 'Client',
        remainingHours,
      };
    });
  }

  async get(organizationId: string, id: string) {
    const r = await this.dbService.db.query.retainers.findFirst({
      where: and(eq(retainers.id, id), eq(retainers.organizationId, organizationId)),
    });

    if (!r) {
      throw new NotFoundException('Retainer not found');
    }

    const client = await this.dbService.db.query.clients.findFirst({
      where: eq(clients.id, r.clientId),
    });

    const remainingHours = Math.max(0, (r.includedHours || 0) - (r.usedHours || 0));

    return {
      ...r,
      clientName: client?.name || 'Client',
      remainingHours,
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(retainers).values({
      id,
      organizationId,
      clientId: data.clientId,
      monthlyAmount: data.monthlyAmount,
      currency: data.currency || 'INR',
      includedHours: data.includedHours || 20,
      usedHours: 0,
      startDate: data.startDate || now.split('T')[0],
      renewalDate: data.renewalDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'retainer',
      entityId: id,
      action: 'created',
      description: `Created monthly retainer of ${data.currency || 'INR'} ${data.monthlyAmount}`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();
    await this.dbService.db
      .update(retainers)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(retainers.id, id), eq(retainers.organizationId, organizationId)));

    return this.get(organizationId, id);
  }
}
