import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';
import { projects } from './projects';
import { clients } from './clients';

// 30. Asset Requests
export const assetRequests = sqliteTable(
  'asset_requests',
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
    status: text('status').notNull().default('requested'), // 'requested' | 'partially_received' | 'received' | 'approved'
    dueDate: text('due_date'),
    fileUrl: text('file_url'),
    fileName: text('file_name'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_asset_requests_org').on(table.organizationId),
    index('idx_asset_requests_project').on(table.projectId),
  ],
);

// 31. Production Call Sheets
export const productionCallSheets = sqliteTable(
  'production_call_sheets',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    shootDate: text('shoot_date').notNull(),
    location: text('location').notNull(),
    callTimes: text('call_times'),
    crew: text('crew'),
    talent: text('talent'),
    equipment: text('equipment'),
    notes: text('notes'),
    emergencyContact: text('emergency_contact'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_call_sheets_org').on(table.organizationId),
    index('idx_call_sheets_project').on(table.projectId),
  ],
);

// 32. Production Shots
export const productionShots = sqliteTable(
  'production_shots',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    shotNumber: text('shot_number').notNull(),
    description: text('description').notNull(),
    location: text('location'),
    framing: text('framing'),
    movement: text('movement'),
    lens: text('lens'),
    talent: text('talent'),
    notes: text('notes'),
    status: text('status').notNull().default('planned'), // 'planned' | 'shot' | 'skipped'
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_shots_org').on(table.organizationId),
    index('idx_shots_project').on(table.projectId),
  ],
);

// 33. Equipment Items
export const equipmentItems = sqliteTable(
  'equipment_items',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    item: text('item').notNull(),
    category: text('category').notNull().default('Camera'),
    quantity: integer('quantity').notNull().default(1),
    status: text('status').notNull().default('needed'), // 'needed' | 'packed' | 'on_set' | 'returned'
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_equipment_org').on(table.organizationId),
    index('idx_equipment_project').on(table.projectId),
  ],
);

// 34. Case Studies & Testimonials
export const caseStudies = sqliteTable(
  'case_studies',
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
    challenge: text('challenge').notNull(),
    solution: text('solution').notNull(),
    result: text('result').notNull(),
    services: text('services').default('[]'),
    testimonialText: text('testimonial_text'),
    testimonialAuthor: text('testimonial_author'),
    published: integer('published').notNull().default(0),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_case_studies_org').on(table.organizationId),
    index('idx_case_studies_project').on(table.projectId),
  ],
);

// 35. Business Goals
export const businessGoals = sqliteTable(
  'business_goals',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    period: text('period').notNull(), // e.g. '2026-Q4' or '2026-10'
    monthlyRevenueTarget: real('monthly_revenue_target').notNull().default(10000),
    targetClients: integer('target_clients').notNull().default(3),
    targetHours: real('target_hours').notNull().default(120),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_goals_org').on(table.organizationId),
    index('idx_goals_period').on(table.period),
  ],
);
