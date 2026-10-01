import * as dotenv from 'dotenv';
dotenv.config();

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, Client } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public client!: Client;
  public db!: LibSQLDatabase<typeof schema>;

  async onModuleInit() {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

    let dbUrl: string;
    let authToken: string | undefined = tursoAuthToken;

    if (tursoUrl && tursoUrl.trim() !== '') {
      dbUrl = tursoUrl.trim();
      // Mask credentials for clean logging
      const safeLog = dbUrl.replace(/:\/\/.*@/, '://***@');
      this.logger.log(`Connecting to Turso / libSQL database at ${safeLog}...`);
    } else {
      // Local development SQLite file
      const dataDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dbPath = path.resolve(dataDir, 'freelanceros.db');
      dbUrl = `file:${dbPath}`;
      authToken = undefined;
      this.logger.log(`Using local libSQL database file at ${dbPath}...`);
    }

    try {
      this.client = createClient({
        url: dbUrl,
        authToken: authToken || undefined,
      });

      this.db = drizzle(this.client, { schema });

      await this.initTables();
      this.logger.log('Turso / libSQL database initialized and tables verified successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Turso / libSQL database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.close();
    }
  }

  private async initTables() {
    try {
      const existing = await this.client.execute(
        "SELECT count(*) as count FROM sqlite_master WHERE type = 'table' AND name = 'organizations';"
      );
      if (existing.rows[0]?.count && Number(existing.rows[0].count) > 0) {
        this.logger.log('Database tables already provisioned and verified.');
        return;
      }
    } catch {
      // Continue to create tables if check fails
    }

    const statements = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        currency TEXT NOT NULL DEFAULT 'USD',
        timezone TEXT NOT NULL DEFAULT 'America/New_York',
        default_payment_terms_days INTEGER NOT NULL DEFAULT 14,
        tax_rate_percent REAL NOT NULL DEFAULT 0,
        plan TEXT NOT NULL DEFAULT 'pro',
        freelancer_type TEXT,
        hourly_rate REAL NOT NULL DEFAULT 125,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS organization_members (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        company TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        website TEXT,
        address TEXT,
        currency TEXT NOT NULL DEFAULT 'USD',
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS client_contacts (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        role TEXT,
        is_primary INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        client_name TEXT NOT NULL,
        company TEXT,
        email TEXT,
        phone TEXT,
        stage TEXT NOT NULL DEFAULT 'new',
        value REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'USD',
        probability_percent INTEGER NOT NULL DEFAULT 50,
        expected_close_date TEXT,
        next_action TEXT,
        next_action_date TEXT,
        source TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        health TEXT NOT NULL DEFAULT 'healthy',
        health_reason TEXT,
        start_date TEXT NOT NULL,
        deadline TEXT,
        budget REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'USD',
        included_revisions INTEGER NOT NULL DEFAULT 2,
        progress_percent INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        client_id TEXT REFERENCES clients(id),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT NOT NULL DEFAULT 'medium',
        due_date TEXT,
        estimated_hours REAL,
        actual_hours REAL,
        client_visible INTEGER NOT NULL DEFAULT 0,
        tags TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS time_entries (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        task_id TEXT REFERENCES tasks(id),
        description TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration_minutes INTEGER NOT NULL DEFAULT 0,
        billable INTEGER NOT NULL DEFAULT 1,
        hourly_rate REAL NOT NULL DEFAULT 125,
        is_running INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS proposals (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        project_id TEXT REFERENCES projects(id),
        proposal_number TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        valid_until TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        subtotal REAL NOT NULL DEFAULT 0,
        discount_percent REAL NOT NULL DEFAULT 0,
        discount_amount REAL NOT NULL DEFAULT 0,
        tax_percent REAL NOT NULL DEFAULT 0,
        tax_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        terms TEXT,
        notes TEXT,
        sent_at TEXT,
        accepted_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS proposal_items (
        id TEXT PRIMARY KEY,
        proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        project_id TEXT REFERENCES projects(id),
        quote_number TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        valid_until TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        subtotal REAL NOT NULL DEFAULT 0,
        discount_amount REAL NOT NULL DEFAULT 0,
        tax_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        payment_terms TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS quote_items (
        id TEXT PRIMARY KEY,
        quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS contracts (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        project_id TEXT REFERENCES projects(id),
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        start_date TEXT NOT NULL,
        end_date TEXT,
        terms TEXT NOT NULL,
        signed_at TEXT,
        signed_by TEXT,
        attachment_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS deliverables (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'client_review',
        current_version TEXT NOT NULL DEFAULT 'V1',
        included_revisions INTEGER NOT NULL DEFAULT 2,
        approved_at TEXT,
        approved_by TEXT,
        delivered_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS deliverable_versions (
        id TEXT PRIMARY KEY,
        deliverable_id TEXT NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
        version_number TEXT NOT NULL,
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'client_review',
        uploaded_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS feedback_items (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        deliverable_id TEXT NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
        version_number TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL DEFAULT 'client',
        content TEXT NOT NULL,
        timestamp_or_section TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TEXT NOT NULL,
        resolved_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS revisions (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        deliverable_id TEXT NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
        revision_number INTEGER NOT NULL,
        max_included INTEGER NOT NULL,
        is_scope_exceeded INTEGER NOT NULL DEFAULT 0,
        request_details TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        requested_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
      );`,
      `CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        deliverable_id TEXT NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
        version_number TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        requested_at TEXT NOT NULL,
        decided_at TEXT,
        decided_by TEXT,
        feedback_comments TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        client_id TEXT NOT NULL REFERENCES clients(id),
        project_id TEXT REFERENCES projects(id),
        invoice_number TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        subtotal REAL NOT NULL DEFAULT 0,
        discount_percent REAL NOT NULL DEFAULT 0,
        discount_amount REAL NOT NULL DEFAULT 0,
        tax_percent REAL NOT NULL DEFAULT 0,
        tax_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        amount_paid REAL NOT NULL DEFAULT 0,
        balance_due REAL NOT NULL DEFAULT 0,
        payment_terms TEXT,
        notes TEXT,
        sent_at TEXT,
        paid_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        invoice_id TEXT NOT NULL REFERENCES invoices(id),
        client_id TEXT NOT NULL REFERENCES clients(id),
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
        payment_date TEXT NOT NULL,
        reference TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        vendor TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'software',
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        project_id TEXT REFERENCES projects(id),
        client_id TEXT REFERENCES clients(id),
        receipt_url TEXT,
        notes TEXT,
        is_reimbursable INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS retainers (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        monthly_amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        included_hours REAL NOT NULL DEFAULT 20,
        used_hours REAL NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        renewal_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        description TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at TEXT NOT NULL
      );`,
      // High-performance query indexes
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
      `CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);`,
      `CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);`,
      `CREATE INDEX IF NOT EXISTS idx_time_entries_org ON time_entries(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);`,
      `CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);`,
      `CREATE INDEX IF NOT EXISTS idx_expenses_org ON expenses(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_deliverables_project ON deliverables(project_id);`,
      `CREATE INDEX IF NOT EXISTS idx_deliverables_org ON deliverables(organization_id);`,
      `CREATE INDEX IF NOT EXISTS idx_activity_org ON activity_logs(organization_id);`,
    ];

    for (const sql of statements) {
      await this.client.execute(sql);
    }
  }
}
