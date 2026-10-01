import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { organizations } from './users';

// 4. Clients
export const clients = sqliteTable(
  'clients',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    company: text('company'),
    email: text('email').notNull(),
    phone: text('phone'),
    website: text('website'),
    address: text('address'),
    currency: text('currency').notNull().default('USD'),
    notes: text('notes'),
    status: text('status').notNull().default('active'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_clients_org').on(table.organizationId),
    index('idx_clients_status').on(table.status),
  ],
);

// 5. Client Contacts
export const clientContacts = sqliteTable(
  'client_contacts',
  {
    id: text('id').primaryKey(),
    clientId: text('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    role: text('role'),
    isPrimary: integer('is_primary').notNull().default(0),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_client_contacts_client').on(table.clientId),
  ],
);
