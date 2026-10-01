import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { leads, clients, projects } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LeadsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async list(organizationId: string) {
    return this.dbService.db.query.leads.findMany({
      where: eq(leads.organizationId, organizationId),
      orderBy: [desc(leads.createdAt)],
    });
  }

  async get(organizationId: string, id: string) {
    const lead = await this.dbService.db.query.leads.findFirst({
      where: and(eq(leads.id, id), eq(leads.organizationId, organizationId)),
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async create(organizationId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.dbService.db.insert(leads).values({
      id,
      organizationId,
      title: data.title,
      clientName: data.clientName || data.contactName || 'Lead Contact',
      company: data.company || null,
      email: data.email || null,
      phone: data.phone || null,
      stage: data.stage || 'new',
      value: data.value ?? data.estimatedValue ?? 0,
      currency: data.currency || 'USD',
      probabilityPercent: data.probabilityPercent || 50,
      expectedCloseDate: data.expectedCloseDate || null,
      nextAction: data.nextAction || null,
      nextActionDate: data.nextActionDate || null,
      source: data.source || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    });

    await this.activityService.log({
      organizationId,
      entityType: 'lead',
      entityId: id,
      action: 'created',
      description: `New lead created: "${data.title}" (${data.clientName})`,
    });

    return this.get(organizationId, id);
  }

  async update(organizationId: string, id: string, data: any) {
    const now = new Date().toISOString();
    const existing = await this.get(organizationId, id);

    await this.dbService.db
      .update(leads)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(leads.id, id), eq(leads.organizationId, organizationId)));

    if (data.stage && data.stage !== existing.stage) {
      await this.activityService.log({
        organizationId,
        entityType: 'lead',
        entityId: id,
        action: 'stage_changed',
        description: `Lead "${existing.title}" moved to stage ${data.stage}`,
      });
    }

    return this.get(organizationId, id);
  }

  async delete(organizationId: string, id: string) {
    await this.dbService.db
      .delete(leads)
      .where(and(eq(leads.id, id), eq(leads.organizationId, organizationId)));
  }

  async convert(organizationId: string, id: string) {
    const lead = await this.get(organizationId, id);
    const now = new Date().toISOString();

    // 1. Create client from lead
    const clientId = uuidv4();
    await this.dbService.db.insert(clients).values({
      id: clientId,
      organizationId,
      name: lead.clientName,
      company: lead.company || lead.clientName,
      email: lead.email || `${lead.clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@client.com`,
      phone: lead.phone || null,
      currency: lead.currency,
      notes: `Converted from lead "${lead.title}". Source: ${lead.source || 'Direct'}.`,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    // 2. Create project from lead
    const projectId = uuidv4();
    await this.dbService.db.insert(projects).values({
      id: projectId,
      organizationId,
      clientId,
      name: lead.title,
      code: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      status: 'active',
      health: 'healthy',
      startDate: now.split('T')[0],
      deadline: lead.expectedCloseDate,
      budget: lead.value,
      currency: lead.currency,
      includedRevisions: 2,
      progressPercent: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Mark lead as won
    await this.dbService.db
      .update(leads)
      .set({ stage: 'won', updatedAt: now })
      .where(eq(leads.id, id));

    await this.activityService.log({
      organizationId,
      entityType: 'lead',
      entityId: id,
      action: 'converted',
      description: `Lead "${lead.title}" converted to Client and Project!`,
    });

    const client = await this.dbService.db.query.clients.findFirst({ where: eq(clients.id, clientId) });
    const project = await this.dbService.db.query.projects.findFirst({ where: eq(projects.id, projectId) });

    return { client, project };
  }
}
