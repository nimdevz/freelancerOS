import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';
import { clients } from './clients';

// 7. Projects
export const projects = sqliteTable(
  'projects',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code').notNull(),
    description: text('description'),
    status: text('status').notNull().default('active'),
    health: text('health').notNull().default('healthy'),
    healthReason: text('health_reason'),
    startDate: text('start_date').notNull(),
    deadline: text('deadline'),
    budget: real('budget').notNull().default(0),
    currency: text('currency').notNull().default('USD'),
    includedRevisions: integer('included_revisions').notNull().default(2),
    progressPercent: integer('progress_percent').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_projects_org').on(table.organizationId),
    index('idx_projects_client').on(table.clientId),
    index('idx_projects_status').on(table.status),
  ],
);

// 8. Tasks
export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    clientId: text('client_id').references(() => clients.id),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('todo'),
    priority: text('priority').notNull().default('medium'),
    dueDate: text('due_date'),
    estimatedHours: real('estimated_hours'),
    actualHours: real('actual_hours'),
    clientVisible: integer('client_visible').notNull().default(0),
    tags: text('tags').default('[]'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_tasks_project').on(table.projectId),
    index('idx_tasks_org').on(table.organizationId),
    index('idx_tasks_client').on(table.clientId),
    index('idx_tasks_status').on(table.status),
  ],
);

// 9. Time Entries
export const timeEntries = sqliteTable(
  'time_entries',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    taskId: text('task_id').references(() => tasks.id),
    description: text('description'),
    startTime: text('start_time').notNull(),
    endTime: text('end_time'),
    durationMinutes: integer('duration_minutes').notNull().default(0),
    billable: integer('billable').notNull().default(1),
    hourlyRate: real('hourly_rate').notNull().default(125),
    isRunning: integer('is_running').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_time_entries_project').on(table.projectId),
    index('idx_time_entries_org').on(table.organizationId),
    index('idx_time_entries_running').on(table.isRunning),
  ],
);
