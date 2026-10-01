import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { activityLogs } from '../../database/schema';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ActivityService {
  constructor(private readonly dbService: DatabaseService) {}

  async log(params: {
    organizationId: string;
    entityType: string;
    entityId: string;
    action: string;
    description: string;
    metadata?: Record<string, any>;
  }) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(activityLogs).values({
      id,
      organizationId: params.organizationId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      description: params.description,
      metadata: JSON.stringify(params.metadata || {}),
      createdAt: now,
    });
  }

  async list(organizationId: string, limit = 50) {
    const logs = await this.dbService.db.query.activityLogs.findMany({
      where: eq(activityLogs.organizationId, organizationId),
      orderBy: [desc(activityLogs.createdAt)],
      limit,
    });

    return logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : {},
    }));
  }

  async listForEntity(organizationId: string, entityId: string) {
    const logs = await this.dbService.db.query.activityLogs.findMany({
      where: eq(activityLogs.entityId, entityId),
      orderBy: [desc(activityLogs.createdAt)],
    });

    return logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : {},
    }));
  }
}
