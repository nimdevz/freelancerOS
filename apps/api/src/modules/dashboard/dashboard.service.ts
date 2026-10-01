import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  projects,
  invoices,
  clients,
  proposals,
  approvals,
  revisions,
  timeEntries,
  organizations,
} from '../../database/schema';
import { eq, desc } from 'drizzle-orm';
import { ActivityService } from '../activity/activity.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
    private readonly projectsService: ProjectsService,
  ) {}

  async getSummary(organizationId: string) {
    const org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });
    const currency = org?.currency || 'INR';

    const clientList = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });

    const projectList = await this.projectsService.list(organizationId);

    const invoiceList = await this.dbService.db.query.invoices.findMany({
      where: eq(invoices.organizationId, organizationId),
      orderBy: [desc(invoices.issueDate)],
    });

    const proposalList = await this.dbService.db.query.proposals.findMany({
      where: eq(proposals.organizationId, organizationId),
    });

    const approvalList = await this.dbService.db.query.approvals.findMany({
      where: eq(approvals.organizationId, organizationId),
    });

    const revList = await this.dbService.db.query.revisions.findMany({
      where: eq(revisions.organizationId, organizationId),
    });

    const timeList = await this.dbService.db.query.timeEntries.findMany({
      where: eq(timeEntries.organizationId, organizationId),
    });

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Calculate metrics
    const paidThisMonth = invoiceList
      .filter((i) => i.status === 'paid' && i.paidAt && i.paidAt.startsWith(currentYearMonth))
      .reduce((sum, i) => sum + (i.amountPaid || 0), 0);

    const outstandingRevenue = invoiceList
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled' && i.status !== 'draft')
      .reduce((sum, i) => sum + (i.balanceDue || 0), 0);

    const overdueRevenue = invoiceList
      .filter((i) => (i.status === 'overdue' || (i.dueDate < today && i.balanceDue > 0)) && i.status !== 'cancelled')
      .reduce((sum, i) => sum + (i.balanceDue || 0), 0);

    const trackedMinutesThisMonth = timeList
      .filter((t) => t.startTime.startsWith(currentYearMonth))
      .reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
    const trackedHoursThisMonth = Math.round((trackedMinutesThisMonth / 60) * 10) / 10;

    const activeProjects = projectList.filter((p) => p.status === 'active' || p.status === 'review');
    const pendingApprovals = approvalList.filter((a) => a.status === 'pending');

    // 1. Build "NEEDS ATTENTION" Unified Queue
    const needsAttention: any[] = [];

    // Overdue invoices
    invoiceList
      .filter((i) => (i.status === 'overdue' || (i.dueDate < today && i.balanceDue > 0)) && i.status !== 'cancelled')
      .forEach((inv) => {
        const client = clientList.find((c) => c.id === inv.clientId);
        needsAttention.push({
          id: `inv-${inv.id}`,
          title: `Overdue Invoice: ${inv.invoiceNumber}`,
          description: `${client?.name || 'Client'} owes ${inv.currency} ${inv.balanceDue}. Due on ${inv.dueDate}.`,
          severity: 'critical',
          category: 'invoice',
          actionUrl: `/invoices/${inv.id}`,
          actionText: 'View Invoice',
          dueDate: inv.dueDate,
        });
      });

    // Approvals waiting
    pendingApprovals.forEach((appr) => {
      needsAttention.push({
        id: `appr-${appr.id}`,
        title: `Approval Pending: Version ${appr.versionNumber}`,
        description: `Client review requested on ${appr.requestedAt.split('T')[0]}.`,
        severity: 'warning',
        category: 'approval',
        actionUrl: `/approvals`,
        actionText: 'Review Approval',
      });
    });

    // Proposals awaiting response
    proposalList
      .filter((p) => p.status === 'sent')
      .forEach((prop) => {
        const client = clientList.find((c) => c.id === prop.clientId);
        needsAttention.push({
          id: `prop-${prop.id}`,
          title: `Proposal Awaiting Decision: ${prop.proposalNumber}`,
          description: `Sent to ${client?.name || 'Client'} for ${prop.currency} ${prop.totalAmount}. Valid until ${prop.validUntil}.`,
          severity: 'info',
          category: 'proposal',
          actionUrl: `/proposals/${prop.id}`,
          actionText: 'Follow Up',
          dueDate: prop.validUntil,
        });
      });

    // Projects with scope exceeded or approaching deadline
    activeProjects.forEach((proj) => {
      if (proj.health === 'blocked' || proj.health === 'at_risk') {
        needsAttention.push({
          id: `proj-${proj.id}`,
          title: `Project ${proj.health === 'blocked' ? 'Blocked' : 'At Risk'}: ${proj.name}`,
          description: proj.healthReason || 'Project requires immediate attention',
          severity: proj.health === 'blocked' ? 'critical' : 'warning',
          category: 'project',
          actionUrl: `/projects/${proj.id}`,
          actionText: 'Manage Project',
          dueDate: proj.deadline || undefined,
        });
      }
    });

    // 2. Build Upcoming Dates Timeline
    const upcomingDates: any[] = [];
    activeProjects.forEach((p) => {
      if (p.deadline) {
        upcomingDates.push({
          id: `deadline-${p.id}`,
          title: `${p.name} - Deadline`,
          date: p.deadline,
          type: 'deadline',
          link: `/projects/${p.id}`,
        });
      }
    });

    invoiceList
      .filter((i) => i.balanceDue > 0 && i.status !== 'cancelled')
      .forEach((i) => {
        upcomingDates.push({
          id: `invdue-${i.id}`,
          title: `${i.invoiceNumber} Payment Due`,
          date: i.dueDate,
          type: 'invoice_due',
          link: `/invoices/${i.id}`,
        });
      });

    proposalList
      .filter((p) => p.status === 'sent')
      .forEach((p) => {
        upcomingDates.push({
          id: `propexp-${p.id}`,
          title: `Proposal ${p.proposalNumber} Expiry`,
          date: p.validUntil,
          type: 'proposal_expire',
          link: `/proposals/${p.id}`,
        });
      });

    upcomingDates.sort((a, b) => (a.date > b.date ? 1 : -1));

    // 3. Recent Activity
    const recentActivity = await this.activityService.list(organizationId, 15);

    return {
      metrics: {
        monthlyRevenue: paidThisMonth,
        outstandingRevenue,
        overdueRevenue,
        trackedHoursThisMonth,
        activeProjectsCount: activeProjects.length,
        pendingApprovalsCount: pendingApprovals.length,
        currency,
      },
      needsAttention,
      activeProjects,
      upcomingDates: upcomingDates.slice(0, 8),
      recentActivity,
    };
  }
}
