import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';

// 25. Notifications
export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    isRead: integer('is_read').notNull().default(0),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_notifications_org').on(table.organizationId),
    index('idx_notifications_read').on(table.isRead),
  ],
);

// 26. Activity Logs
export const activityLogs = sqliteTable(
  'activity_logs',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    action: text('action').notNull(),
    description: text('description').notNull(),
    metadata: text('metadata').default('{}'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_activity_org').on(table.organizationId),
    index('idx_activity_created').on(table.createdAt),
  ],
);
