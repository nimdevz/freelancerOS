import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ActivityModule } from './modules/activity/activity.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BackgroundJobsModule } from './modules/background-jobs/background-jobs.module';
import { FilesModule } from './modules/files/files.module';
import { BillingModule } from './modules/billing/billing.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ClientsModule } from './modules/clients/clients.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TimeTrackingModule } from './modules/time-tracking/time-tracking.module';
import { DeliverablesModule } from './modules/deliverables/deliverables.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { RevisionsModule } from './modules/revisions/revisions.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { RetainersModule } from './modules/retainers/retainers.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SearchModule } from './modules/search/search.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    DatabaseModule,
    ActivityModule,
    NotificationsModule,
    BackgroundJobsModule,
    FilesModule,
    BillingModule,
    AuthModule,
    OrganizationsModule,
    ClientsModule,
    LeadsModule,
    ProjectsModule,
    TasksModule,
    TimeTrackingModule,
    DeliverablesModule,
    FeedbackModule,
    RevisionsModule,
    ApprovalsModule,
    InvoicesModule,
    PaymentsModule,
    ExpensesModule,
    RetainersModule,
    ProposalsModule,
    QuotesModule,
    ContractsModule,
    DashboardModule,
    ReportsModule,
    SearchModule,
    SeedModule,
  ],
})
export class AppModule {}
