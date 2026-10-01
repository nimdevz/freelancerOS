import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { notifications } from '../../database/schema';
import { desc, eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(params: {
    organizationId: string;
    type: string;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
  }) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(notifications).values({
      id,
      organizationId: params.organizationId,
      type: params.type,
      title: params.title,
      message: params.message,
      entityType: params.entityType,
      entityId: params.entityId,
      isRead: 0,
      createdAt: now,
    });
  }

  async list(organizationId: string) {
    const items = await this.dbService.db.query.notifications.findMany({
      where: eq(notifications.organizationId, organizationId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });

    return items.map((item) => ({
      ...item,
      isRead: Boolean(item.isRead),
    }));
  }

  async markAsRead(organizationId: string, id: string) {
    await this.dbService.db
      .update(notifications)
      .set({ isRead: 1 })
      .where(and(eq(notifications.id, id), eq(notifications.organizationId, organizationId)));
  }

  async markAllAsRead(organizationId: string) {
    await this.dbService.db
      .update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.organizationId, organizationId));
  }
}
