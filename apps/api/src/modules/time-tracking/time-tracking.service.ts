import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { timeEntries, projects, tasks, organizations } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TimeTrackingService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string, projectId?: string) {
    let whereClause = eq(timeEntries.organizationId, organizationId);
    if (projectId) {
      whereClause = and(eq(timeEntries.organizationId, organizationId), eq(timeEntries.projectId, projectId)) as any;
    }

    const entries = await this.dbService.db.query.timeEntries.findMany({
      where: whereClause,
      orderBy: [desc(timeEntries.startTime)],
    });

    const projectList = await this.dbService.db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
    });

    const taskList = await this.dbService.db.query.tasks.findMany({
      where: eq(tasks.organizationId, organizationId),
    });

    return entries.map((entry) => {
      const proj = projectList.find((p) => p.id === entry.projectId);
      const t = taskList.find((item) => item.id === entry.taskId);
      const hours = entry.durationMinutes / 60;
      const revenueAmount = entry.billable ? Math.round(hours * (entry.hourlyRate || 0)) : 0;

      return {
        ...entry,
        projectName: proj?.name || 'Project',
        taskTitle: t?.title || null,
        billable: Boolean(entry.billable),
        isRunning: Boolean(entry.isRunning),
        revenueAmount,
      };
    });
  }

  async getActive(organizationId: string) {
    const active = await this.dbService.db.query.timeEntries.findFirst({
      where: and(eq(timeEntries.organizationId, organizationId), eq(timeEntries.isRunning, 1)),
    });

    if (!active) return null;

    const proj = await this.dbService.db.query.projects.findFirst({
      where: eq(projects.id, active.projectId),
    });

    return {
      ...active,
      projectName: proj?.name || 'Project',
      billable: Boolean(active.billable),
      isRunning: true,
      revenueAmount: 0,
    };
  }

  async startTimer(organizationId: string, data: any) {
    // Check if a timer is already running
    const active = await this.getActive(organizationId);
    if (active) {
      await this.stopTimer(organizationId, active.id);
    }

    const org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(timeEntries).values({
      id,
      organizationId,
      projectId: data.projectId,
      taskId: data.taskId || null,
      description: data.description || 'Active Work Session',
      startTime: now,
      durationMinutes: 0,
      billable: data.billable !== false ? 1 : 0,
      hourlyRate: org?.hourlyRate || 125,
      isRunning: 1,
      createdAt: now,
      updatedAt: now,
    });

    return this.getActive(organizationId);
  }

  async stopTimer(organizationId: string, id: string) {
    const entry = await this.dbService.db.query.timeEntries.findFirst({
      where: and(eq(timeEntries.id, id), eq(timeEntries.organizationId, organizationId)),
    });

    if (!entry) {
      throw new NotFoundException('Timer not found');
    }

    const now = new Date().toISOString();
    const startMs = new Date(entry.startTime).getTime();
    const endMs = new Date(now).getTime();
    const durationMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));

    await this.dbService.db
      .update(timeEntries)
      .set({
        endTime: now,
        durationMinutes,
        isRunning: 0,
        updatedAt: now,
      })
      .where(eq(timeEntries.id, id));

    await this.activityService.log({
      organizationId,
      entityType: 'time_entry',
      entityId: id,
      action: 'timer_stopped',
      description: `Tracked ${durationMinutes} minutes on project`,
    });

    return {
      ...entry,
      endTime: now,
      durationMinutes,
      isRunning: false,
    };
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    const durationMinutes = data.durationMinutes || 60;
    const hourlyRate = data.hourlyRate || org?.hourlyRate || 125;

    await this.dbService.db.insert(timeEntries).values({
      id,
      organizationId,
      projectId: data.projectId,
      taskId: data.taskId || null,
      description: data.description || 'Logged session',
      startTime: data.startTime || now,
      endTime: data.endTime || now,
      durationMinutes,
      billable: data.billable !== false ? 1 : 0,
      hourlyRate,
      isRunning: 0,
      createdAt: now,
      updatedAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'time_entry',
      entityId: id,
      action: 'created',
      description: `Logged ${durationMinutes}m of time`,
    });

    const list = await this.list(organizationId);
    return list.find((e) => e.id === id);
  }
}
