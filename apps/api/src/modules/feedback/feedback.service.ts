import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { feedbackItems } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string, deliverableId: string) {
    return this.dbService.db.query.feedbackItems.findMany({
      where: and(
        eq(feedbackItems.organizationId, organizationId),
        eq(feedbackItems.deliverableId, deliverableId),
      ),
      orderBy: [desc(feedbackItems.createdAt)],
    });
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(feedbackItems).values({
      id,
      organizationId,
      deliverableId: data.deliverableId,
      versionNumber: data.versionNumber || 'V1',
      authorName: data.authorName,
      authorRole: data.authorRole || 'client',
      content: data.content,
      timestampOrSection: data.timestampOrSection || null,
      status: 'open',
      createdAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'feedback',
      entityId: id,
      action: 'created',
      description: `New feedback from ${data.authorName}: "${data.content.substring(0, 40)}..."`,
    });

    return this.dbService.db.query.feedbackItems.findFirst({ where: eq(feedbackItems.id, id) });
  }

  async resolve(organizationId: string, id: string) {
    const now = new Date().toISOString();
    await this.dbService.db
      .update(feedbackItems)
      .set({ status: 'resolved', resolvedAt: now })
      .where(and(eq(feedbackItems.id, id), eq(feedbackItems.organizationId, organizationId)));

    return this.dbService.db.query.feedbackItems.findFirst({ where: eq(feedbackItems.id, id) });
  }
}
