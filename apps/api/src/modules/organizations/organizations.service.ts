import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { organizations, clients, projects, users, organizationMembers } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
  ) {}

  async getCurrent(orgId: string) {
    let org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) {
      org = await this.dbService.db.query.organizations.findFirst();
    }

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async update(orgId: string, data: any) {
    const now = new Date().toISOString();
    await this.dbService.db
      .update(organizations)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(organizations.id, orgId));

    await this.activityService.log({
      organizationId: orgId,
      entityType: 'organization',
      entityId: orgId,
      action: 'updated',
      description: 'Workspace settings updated',
    });

    return this.getCurrent(orgId);
  }

  async onboard(userId: string, data: any) {
    const now = new Date().toISOString();
    let org = await this.dbService.db.query.organizations.findFirst();

    const orgId = org ? org.id : uuidv4();
    const slug = (data.workspaceName || 'workspace')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');

    if (org) {
      await this.dbService.db
        .update(organizations)
        .set({
          name: data.workspaceName,
          slug,
          currency: data.currency || 'INR',
          defaultPaymentTermsDays: data.defaultPaymentTermsDays || 14,
          freelancerType: data.freelancerType,
          updatedAt: now,
        })
        .where(eq(organizations.id, org.id));
    } else {
      await this.dbService.db.insert(organizations).values({
        id: orgId,
        name: data.workspaceName,
        slug,
        currency: data.currency || 'INR',
        timezone: 'Asia/Kolkata',
        defaultPaymentTermsDays: data.defaultPaymentTermsDays || 14,
        taxRatePercent: 18,
        plan: 'pro',
        freelancerType: data.freelancerType,
        hourlyRate: 2000,
        createdAt: now,
        updatedAt: now,
      });

      // Ensure user membership
      await this.dbService.db.insert(organizationMembers).values({
        id: uuidv4(),
        organizationId: orgId,
        userId,
        role: 'owner',
        createdAt: now,
      });
    }

    // Create first client
    const clientId = uuidv4();
    await this.dbService.db.insert(clients).values({
      id: clientId,
      organizationId: orgId,
      name: data.firstClientName,
      company: data.firstClientName,
      email: data.firstClientEmail,
      currency: data.currency || 'INR',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    // Create first project
    const projectId = uuidv4();
    await this.dbService.db.insert(projects).values({
      id: projectId,
      organizationId: orgId,
      clientId,
      name: data.firstProjectName,
      code: 'PRJ-001',
      status: 'active',
      health: 'healthy',
      startDate: now.split('T')[0],
      budget: data.firstProjectBudget || 50000,
      currency: data.currency || 'INR',
      includedRevisions: 2,
      progressPercent: 10,
      createdAt: now,
      updatedAt: now,
    });

    await this.activityService.log({
      organizationId: orgId,
      entityType: 'organization',
      entityId: orgId,
      action: 'onboarded',
      description: `Completed onboarding for ${data.workspaceName}`,
    });

    const updatedOrg = await this.getCurrent(orgId);
    const client = await this.dbService.db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });
    const project = await this.dbService.db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    return {
      organization: updatedOrg,
      client,
      project,
    };
  }
}
