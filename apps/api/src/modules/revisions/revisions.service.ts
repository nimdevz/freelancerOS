import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { revisions, deliverables, projects } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RevisionsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(organizationId: string, projectId?: string) {
    let whereClause = eq(revisions.organizationId, organizationId);
    if (projectId) {
      whereClause = and(eq(revisions.organizationId, organizationId), eq(revisions.projectId, projectId)) as any;
    }

    const revList = await this.dbService.db.query.revisions.findMany({
      where: whereClause,
      orderBy: [desc(revisions.requestedAt)],
    });

    const delivList = await this.dbService.db.query.deliverables.findMany({
      where: eq(deliverables.organizationId, organizationId),
    });

    return revList.map((r) => {
      const deliv = delivList.find((d) => d.id === r.deliverableId);
      return {
        ...r,
        deliverableTitle: deliv?.title || 'Deliverable',
        isScopeExceeded: Boolean(r.isScopeExceeded),
      };
    });
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const deliv = await this.dbService.db.query.deliverables.findFirst({
      where: and(eq(deliverables.id, data.deliverableId), eq(deliverables.organizationId, organizationId)),
    });

    if (!deliv) {
      throw new NotFoundException('Deliverable not found');
    }

    const existingRevs = await this.dbService.db.query.revisions.findMany({
      where: and(eq(revisions.deliverableId, data.deliverableId), eq(revisions.organizationId, organizationId)),
    });

    const revisionNumber = existingRevs.length + 1;
    const maxIncluded = deliv.includedRevisions;
    const isScopeExceeded = revisionNumber > maxIncluded;

    await this.dbService.db.insert(revisions).values({
      id,
      organizationId,
      projectId: deliv.projectId,
      deliverableId: deliv.id,
      revisionNumber,
      maxIncluded,
      isScopeExceeded: isScopeExceeded ? 1 : 0,
      requestDetails: data.requestDetails,
      requestedBy: data.requestedBy || 'Client',
      requestedAt: now,
      status: 'pending',
    });

    // Update deliverable status to 'revision'
    await this.dbService.db
      .update(deliverables)
      .set({ status: 'revision', updatedAt: now })
      .where(eq(deliverables.id, deliv.id));

    if (isScopeExceeded) {
      await this.notificationsService.create({
        organizationId,
        type: 'revision_limit',
        title: 'Revision Limit Exceeded',
        message: `Revision ${revisionNumber} of ${maxIncluded} requested for "${deliv.title}" (Outside agreed scope).`,
        entityType: 'deliverable',
        entityId: deliv.id,
      });
    }

    await this.activityService.log({
      organizationId,
      entityType: 'revision',
      entityId: id,
      action: 'requested',
      description: `Revision ${revisionNumber} of ${maxIncluded} requested for "${deliv.title}"${
        isScopeExceeded ? ' (Outside agreed scope)' : ''
      }`,
    });

    return this.dbService.db.query.revisions.findFirst({ where: eq(revisions.id, id) });
  }
}
