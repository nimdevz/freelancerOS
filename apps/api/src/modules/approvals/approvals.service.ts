import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { approvals, deliverables, projects } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(organizationId: string) {
    const list = await this.dbService.db.query.approvals.findMany({
      where: eq(approvals.organizationId, organizationId),
      orderBy: [desc(approvals.requestedAt)],
    });

    const delivList = await this.dbService.db.query.deliverables.findMany({
      where: eq(deliverables.organizationId, organizationId),
    });

    return list.map((a) => {
      const deliv = delivList.find((d) => d.id === a.deliverableId);
      return {
        ...a,
        deliverableTitle: deliv?.title || 'Deliverable',
      };
    });
  }

  async request(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const deliv = await this.dbService.db.query.deliverables.findFirst({
      where: and(eq(deliverables.id, data.deliverableId), eq(deliverables.organizationId, organizationId)),
    });

    if (!deliv) {
      throw new NotFoundException('Deliverable not found');
    }

    await this.dbService.db.insert(approvals).values({
      id,
      organizationId,
      projectId: deliv.projectId,
      deliverableId: deliv.id,
      versionNumber: data.versionNumber || deliv.currentVersion,
      status: 'pending',
      requestedAt: now,
    });

    await this.dbService.db
      .update(deliverables)
      .set({ status: 'client_review', updatedAt: now })
      .where(eq(deliverables.id, deliv.id));

    await this.activityService.log({
      organizationId,
      entityType: 'approval',
      entityId: id,
      action: 'requested',
      description: `Approval requested for "${deliv.title}" (${data.versionNumber || deliv.currentVersion})`,
    });

    return this.dbService.db.query.approvals.findFirst({ where: eq(approvals.id, id) });
  }

  async decide(
    organizationId: string,
    id: string,
    data: { status: 'approved' | 'changes_requested'; decidedBy: string; comments?: string },
  ) {
    const now = new Date().toISOString();
    const approval = await this.dbService.db.query.approvals.findFirst({
      where: and(eq(approvals.id, id), eq(approvals.organizationId, organizationId)),
    });

    if (!approval) {
      throw new NotFoundException('Approval request not found');
    }

    await this.dbService.db
      .update(approvals)
      .set({
        status: data.status,
        decidedAt: now,
        decidedBy: data.decidedBy,
        feedbackComments: data.comments || null,
      })
      .where(eq(approvals.id, id));

    const isApproved = data.status === 'approved';
    await this.dbService.db
      .update(deliverables)
      .set({
        status: isApproved ? 'approved' : 'revision',
        approvedAt: isApproved ? now : null,
        approvedBy: isApproved ? data.decidedBy : null,
        updatedAt: now,
      })
      .where(eq(deliverables.id, approval.deliverableId));

    await this.notificationsService.create({
      organizationId,
      type: 'approval_received',
      title: isApproved ? 'Deliverable Approved!' : 'Changes Requested',
      message: `${data.decidedBy} ${isApproved ? 'approved' : 'requested changes for'} version ${approval.versionNumber}.`,
      entityType: 'approval',
      entityId: id,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'approval',
      entityId: id,
      action: data.status,
      description: `${data.decidedBy} marked ${data.status} for version ${approval.versionNumber}`,
    });

    return this.dbService.db.query.approvals.findFirst({ where: eq(approvals.id, id) });
  }
}
