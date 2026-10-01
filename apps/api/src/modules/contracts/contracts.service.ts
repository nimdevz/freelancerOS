import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { contracts, clients, projects } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContractsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string) {
    const list = await this.dbService.db.query.contracts.findMany({
      where: eq(contracts.organizationId, organizationId),
      orderBy: [desc(contracts.createdAt)],
    });

    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });

    return list.map((c) => {
      const client = clientList.find((item) => item.id === c.clientId);
      return {
        ...c,
        clientName: client?.name || 'Unknown Client',
      };
    });
  }

  async get(organizationId: string, id: string) {
    const contract = await this.dbService.db.query.contracts.findFirst({
      where: and(eq(contracts.id, id), eq(contracts.organizationId, organizationId)),
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    const client = await this.dbService.db.query.clients.findFirst({
      where: eq(clients.id, contract.clientId),
    });

    return {
      ...contract,
      clientName: client?.name || 'Unknown Client',
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(contracts).values({
      id,
      organizationId,
      clientId: data.clientId,
      projectId: data.projectId || null,
      title: data.title,
      status: 'draft',
      startDate: data.startDate || now.split('T')[0],
      endDate: data.endDate || null,
      terms: data.terms,
      attachmentUrl: data.attachmentUrl || null,
      createdAt: now,
      updatedAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'contract',
      entityId: id,
      action: 'created',
      description: `Created contract "${data.title}"`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();
    await this.dbService.db
      .update(contracts)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(contracts.id, id), eq(contracts.organizationId, organizationId)));

    return this.get(organizationId, id);
  }

  async sign(organizationId: string, id: string, signerName: string) {
    const now = new Date().toISOString();
    const contract = await this.get(organizationId, id);

    await this.dbService.db
      .update(contracts)
      .set({
        status: 'signed',
        signedAt: now,
        signedBy: signerName,
        updatedAt: now,
      })
      .where(eq(contracts.id, id));

    await this.activityService.log({
      organizationId,
      entityType: 'contract',
      entityId: id,
      action: 'signed',
      description: `Contract "${contract.title}" signed by ${signerName}`,
    });

    return this.get(organizationId, id);
  }
}
