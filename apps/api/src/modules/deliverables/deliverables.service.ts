import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  deliverables,
  deliverableVersions,
  projects,
  revisions,
} from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeliverablesService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async list(organizationId: string, projectId?: string) {
    let whereClause = eq(deliverables.organizationId, organizationId);
    if (projectId) {
      whereClause = and(eq(deliverables.organizationId, organizationId), eq(deliverables.projectId, projectId)) as any;
    }

    const delivs = await this.dbService.db.query.deliverables.findMany({
      where: whereClause,
      orderBy: [desc(deliverables.createdAt)],
    });

    const projectList = await this.dbService.db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
    });

    const allVersions = await this.dbService.db.query.deliverableVersions.findMany();
    const allRevs = await this.dbService.db.query.revisions.findMany({
      where: eq(revisions.organizationId, organizationId),
    });

    return delivs.map((d) => {
      const proj = projectList.find((p) => p.id === d.projectId);
      const versions = allVersions.filter((v) => v.deliverableId === d.id);
      const usedRevisions = allRevs.filter((r) => r.deliverableId === d.id).length;
      const isScopeExceeded = usedRevisions > d.includedRevisions;

      return {
        ...d,
        projectName: proj?.name || 'Project',
        versionsCount: versions.length,
        usedRevisions,
        isScopeExceeded,
        versions,
      };
    });
  }

  async get(organizationId: string, id: string) {
    const d = await this.dbService.db.query.deliverables.findFirst({
      where: and(eq(deliverables.id, id), eq(deliverables.organizationId, organizationId)),
    });

    if (!d) {
      throw new NotFoundException('Deliverable not found');
    }

    const proj = await this.dbService.db.query.projects.findFirst({
      where: eq(projects.id, d.projectId),
    });

    const versions = await this.dbService.db.query.deliverableVersions.findMany({
      where: eq(deliverableVersions.deliverableId, id),
      orderBy: [desc(deliverableVersions.uploadedAt)],
    });

    const revs = await this.dbService.db.query.revisions.findMany({
      where: and(eq(revisions.deliverableId, id), eq(revisions.organizationId, organizationId)),
    });
    const usedRevisions = revs.length;
    const isScopeExceeded = usedRevisions > d.includedRevisions;

    return {
      ...d,
      projectName: proj?.name || 'Project',
      versionsCount: versions.length,
      usedRevisions,
      isScopeExceeded,
      versions,
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(deliverables).values({
      id,
      organizationId,
      projectId: data.projectId,
      title: data.title,
      description: data.description || null,
      status: 'client_review',
      currentVersion: 'V1',
      includedRevisions: data.includedRevisions || 2,
      createdAt: now,
      updatedAt: now,
    });

    // Add initial version V1
    const versionId = uuidv4();
    await this.dbService.db.insert(deliverableVersions).values({
      id: versionId,
      deliverableId: id,
      versionNumber: 'V1',
      fileUrl: data.initialFileUrl || null,
      fileName: data.initialFileName || 'Initial Draft',
      fileSize: 1024 * 1024 * 12,
      notes: data.initialNotes || 'First delivery draft',
      status: 'client_review',
      uploadedAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'deliverable',
      entityId: id,
      action: 'created',
      description: `Uploaded deliverable "${data.title}" (V1)`,
    });

    return this.get(organizationId, id);
  }

  async addVersion(organizationId: string, deliverableId: string, data: any) {
    const d = await this.get(organizationId, deliverableId);
    const now = new Date().toISOString();
    const nextVersionNumber = `V${d.versionsCount + 1}`;

    const versionId = uuidv4();
    await this.dbService.db.insert(deliverableVersions).values({
      id: versionId,
      deliverableId,
      versionNumber: nextVersionNumber,
      fileUrl: data.fileUrl || null,
      fileName: data.fileName || `${d.title} ${nextVersionNumber}`,
      fileSize: data.fileSize || 1024 * 1024 * 15,
      notes: data.notes || null,
      status: 'client_review',
      uploadedAt: now,
    });

    await this.dbService.db
      .update(deliverables)
      .set({
        currentVersion: nextVersionNumber,
        status: 'client_review',
        updatedAt: now,
      })
      .where(eq(deliverables.id, deliverableId));

    await this.activityService.log({
      organizationId,
      entityType: 'deliverable',
      entityId: deliverableId,
      action: 'version_added',
      description: `Uploaded ${nextVersionNumber} for deliverable "${d.title}"`,
    });

    return this.get(organizationId, deliverableId);
  }
}
