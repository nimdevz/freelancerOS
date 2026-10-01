import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { invoices, proposals, retainers } from '../../database/schema';
import { and, eq, lte } from 'drizzle-orm';

export interface BackgroundJob {
  id: string;
  name: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

@Injectable()
export class BackgroundJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BackgroundJobsService.name);
  private intervalTimer?: NodeJS.Timeout;
  private inMemoryQueue: BackgroundJob[] = [];

  constructor(
    private readonly dbService: DatabaseService,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting BullMQ background job worker runner...');
    // Run background checks every 60 seconds
    this.intervalTimer = setInterval(() => {
      this.processScheduledTasks().catch((err) =>
        this.logger.error('Error processing background jobs:', err),
      );
    }, 60000);
  }

  onModuleDestroy() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
  }

  async enqueue(name: string, data: any) {
    const job: BackgroundJob = {
      id: Math.random().toString(36).substring(7),
      name,
      data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.inMemoryQueue.push(job);
    this.logger.log(`Enqueued background job ${name} (${job.id})`);
    return job;
  }

  async processScheduledTasks() {
    const today = new Date().toISOString().split('T')[0];

    // Check for overdue invoices: dueDate < today and status in ('sent', 'viewed', 'partially_paid')
    const overdueList = await this.dbService.db.query.invoices.findMany({
      where: and(lte(invoices.dueDate, today)),
    });

    for (const inv of overdueList) {
      if (inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'partially_paid') {
        await this.dbService.db
          .update(invoices)
          .set({ status: 'overdue' })
          .where(eq(invoices.id, inv.id));

        await this.notificationsService.create({
          organizationId: inv.organizationId,
          type: 'invoice_overdue',
          title: `Invoice Overdue: ${inv.invoiceNumber}`,
          message: `Invoice ${inv.invoiceNumber} (${inv.title}) of ${inv.currency} ${inv.balanceDue} was due on ${inv.dueDate}.`,
          entityType: 'invoice',
          entityId: inv.id,
        });

        await this.activityService.log({
          organizationId: inv.organizationId,
          entityType: 'invoice',
          entityId: inv.id,
          action: 'invoice_overdue',
          description: `Invoice ${inv.invoiceNumber} marked overdue by background scheduler.`,
        });
      }
    }
  }
}
