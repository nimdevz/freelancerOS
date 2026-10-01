import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PGlite } from '@electric-sql/pglite';
import { drizzle, PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private client!: PGlite;
  public db!: PgliteDatabase<typeof schema>;

  async onModuleInit() {
    const dataDir = path.resolve(process.cwd(), 'data', 'freelanceros-pg');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.logger.log(`Initializing PGlite PostgreSQL database at ${dataDir}...`);
    this.client = new PGlite(dataDir);
    this.db = drizzle(this.client, { schema });

    await this.initTables();
    this.logger.log('Database initialized successfully.');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
    }
  }

  private async initTables() {
    // Create all tables if not exist
    const ddl = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        currency TEXT NOT NULL DEFAULT 'INR',
        timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
        default_payment_terms_days INTEGER NOT NULL DEFAULT 14,
        tax_rate_percent REAL NOT NULL DEFAULT 18,
        plan TEXT NOT NULL DEFAULT 'pro',
        freelancer_type TEXT,
        hourly_rate REAL NOT NULL DEFAULT 2000,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS organization_members (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        user_id UUID NOT NULL REFERENCES users(id),
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        name TEXT NOT NULL,
        company TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        website TEXT,
        address TEXT,
        currency TEXT NOT NULL DEFAULT 'INR',
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS client_contacts (
        id UUID PRIMARY KEY,
        client_id UUID NOT NULL REFERENCES clients(id),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        role TEXT,
        is_primary INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        title TEXT NOT NULL,
        client_name TEXT NOT NULL,
        company TEXT,
        email TEXT,
        phone TEXT,
        stage TEXT NOT NULL DEFAULT 'new',
        value REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        probability_percent INTEGER NOT NULL DEFAULT 50,
        expected_close_date TEXT,
        next_action TEXT,
        next_action_date TEXT,
        source TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        client_id UUID NOT NULL REFERENCES clients(id),
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        health TEXT NOT NULL DEFAULT 'healthy',
        health_reason TEXT,
        start_date TEXT NOT NULL,
        deadline TEXT,
        budget REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        included_revisions INTEGER NOT NULL DEFAULT 2,
        progress_percent INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        client_id UUID REFERENCES clients(id),
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
      );

      CREATE TABLE IF NOT EXISTS time_entries (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        task_id UUID REFERENCES tasks(id),
        description TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration_minutes INTEGER NOT NULL DEFAULT 0,
        billable INTEGER NOT NULL DEFAULT 1,
        hourly_rate REAL NOT NULL DEFAULT 2000,
        is_running INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS proposals (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        client_id UUID NOT NULL REFERENCES clients(id),
        project_id UUID REFERENCES projects(id),
        proposal_number TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        valid_until TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        subtotal REAL NOT NULL DEFAULT 0,
        discount_percent REAL NOT NULL DEFAULT 0,
        discount_amount REAL NOT NULL DEFAULT 0,
        tax_percent REAL NOT NULL DEFAULT 18,
        tax_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        terms TEXT,
        notes TEXT,
        sent_at TEXT,
        accepted_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS proposal_items (
        id UUID PRIMARY KEY,
        proposal_id UUID NOT NULL REFERENCES proposals(id),
        description TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS quotes (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        client_id UUID NOT NULL REFERENCES clients(id),
        project_id UUID REFERENCES projects(id),
        quote_number TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        valid_until TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        subtotal REAL NOT NULL DEFAULT 0,
        discount_amount REAL NOT NULL DEFAULT 0,
        tax_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        payment_terms TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quote_items (
        id UUID PRIMARY KEY,
        quote_id UUID NOT NULL REFERENCES quotes(id),
        description TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        client_id UUID NOT NULL REFERENCES clients(id),
        project_id UUID REFERENCES projects(id),
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
      );

      CREATE TABLE IF NOT EXISTS deliverables (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        project_id UUID NOT NULL REFERENCES projects(id),
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
      );

      CREATE TABLE IF NOT EXISTS deliverable_versions (
        id UUID PRIMARY KEY,
        deliverable_id UUID NOT NULL REFERENCES deliverables(id),
        version_number TEXT NOT NULL,
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'client_review',
        uploaded_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS feedback_items (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        deliverable_id UUID NOT NULL REFERENCES deliverables(id),
        version_number TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL DEFAULT 'client',
        content TEXT NOT NULL,
        timestamp_or_section TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TEXT NOT NULL,
        resolved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS revisions (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        deliverable_id UUID NOT NULL REFERENCES deliverables(id),
        revision_number INTEGER NOT NULL,
        max_included INTEGER NOT NULL,
        is_scope_exceeded INTEGER NOT NULL DEFAULT 0,
        request_details TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        requested_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS approvals (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        project_id UUID NOT NULL REFERENCES projects(id),
        deliverable_id UUID NOT NULL REFERENCES deliverables(id),
        version_number TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        requested_at TEXT NOT NULL,
        decided_at TEXT,
        decided_by TEXT,
        feedback_comments TEXT
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        client_id UUID NOT NULL REFERENCES clients(id),
        project_id UUID REFERENCES projects(id),
        invoice_number TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        subtotal REAL NOT NULL DEFAULT 0,
        discount_percent REAL NOT NULL DEFAULT 0,
        discount_amount REAL NOT NULL DEFAULT 0,
        tax_percent REAL NOT NULL DEFAULT 18,
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
      );

      CREATE TABLE IF NOT EXISTS invoice_items (
        id UUID PRIMARY KEY,
        invoice_id UUID NOT NULL REFERENCES invoices(id),
        description TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        invoice_id UUID NOT NULL REFERENCES invoices(id),
        client_id UUID NOT NULL REFERENCES clients(id),
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
        payment_date TEXT NOT NULL,
        reference TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        date TEXT NOT NULL,
        vendor TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'software',
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        project_id UUID REFERENCES projects(id),
        client_id UUID REFERENCES clients(id),
        receipt_url TEXT,
        notes TEXT,
        is_reimbursable INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS retainers (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        client_id UUID NOT NULL REFERENCES clients(id),
        monthly_amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        included_hours REAL NOT NULL DEFAULT 20,
        used_hours REAL NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        renewal_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY,
        organization_id UUID NOT NULL REFERENCES organizations(id),
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        description TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at TEXT NOT NULL
      );
    `;

    await this.client.exec(ddl);
  }
}
