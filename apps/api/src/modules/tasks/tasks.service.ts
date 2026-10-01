import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { tasks, projects } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TasksService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string, projectId?: string) {
    let whereClause = eq(tasks.organizationId, organizationId);
    if (projectId) {
      whereClause = and(eq(tasks.organizationId, organizationId), eq(tasks.projectId, projectId)) as any;
    }

    const taskList = await this.dbService.db.query.tasks.findMany({
      where: whereClause,
      orderBy: [desc(tasks.createdAt)],
    });

    const projectList = await this.dbService.db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
    });

    return taskList.map((t) => {
      const proj = projectList.find((p) => p.id === t.projectId);
      return {
        ...t,
        projectName: proj?.name || 'Project',
        tags: t.tags ? JSON.parse(t.tags) : [],
        clientVisible: Boolean(t.clientVisible),
      };
    });
  }

  async get(organizationId: string, id: string) {
    const task = await this.dbService.db.query.tasks.findFirst({
      where: and(eq(tasks.id, id), eq(tasks.organizationId, organizationId)),
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const proj = await this.dbService.db.query.projects.findFirst({
      where: eq(projects.id, task.projectId),
    });

    return {
      ...task,
      projectName: proj?.name || 'Project',
      tags: task.tags ? JSON.parse(task.tags) : [],
      clientVisible: Boolean(task.clientVisible),
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(tasks).values({
      id,
      organizationId,
      projectId: data.projectId,
      clientId: data.clientId || null,
      title: data.title,
      description: data.description || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      estimatedHours: data.estimatedHours || null,
      actualHours: data.actualHours || null,
      clientVisible: data.clientVisible ? 1 : 0,
      tags: JSON.stringify(data.tags || []),
      createdAt: now,
      updatedAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'task',
      entityId: id,
      action: 'created',
      description: `Created task "${data.title}"`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();
    const existing = await this.get(organizationId, id);

    const updatePayload: any = {
      ...data,
      updatedAt: now,
    };

    if (data.tags !== undefined) {
      updatePayload.tags = JSON.stringify(data.tags);
    }
    if (data.clientVisible !== undefined) {
      updatePayload.clientVisible = data.clientVisible ? 1 : 0;
    }

    await this.dbService.db
      .update(tasks)
      .set(updatePayload)
      .where(and(eq(tasks.id, id), eq(tasks.organizationId, organizationId)));

    if (data.status && data.status !== existing.status) {
      await this.activityService.log({
        organizationId,
        entityType: 'task',
        entityId: id,
        action: 'status_changed',
        description: `Task "${existing.title}" moved to ${data.status}`,
      });
    }

    return this.get(organizationId, id);
  }

  async delete(organizationId: string, id: string) {
    await this.dbService.db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.organizationId, organizationId)));
  }
}
