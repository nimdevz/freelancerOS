import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, Client } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '../src/database/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

describe('Turso / libSQL Database Integration & Multi-Tenancy Tests', () => {
  let client: Client;
  let db: LibSQLDatabase<typeof schema>;

  beforeAll(async () => {
    // In-memory libSQL database for testing
    client = createClient({ url: ':memory:' });
    db = drizzle(client, { schema });

    // Initialize schema tables
    const ddl = [
      `CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE TABLE organizations (
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
      `CREATE TABLE clients (
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
      `CREATE TABLE projects (
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
      `CREATE TABLE tasks (
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
      `CREATE TABLE invoices (
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
      `CREATE TABLE payments (
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
      `CREATE TABLE expenses (
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
      );`
    ];

    for (const sql of ddl) {
      await client.execute(sql);
    }
  });

  afterAll(async () => {
    client.close();
  });

  it('performs CRUD operations for Workspaces, Clients, and Projects', async () => {
    const orgId = uuidv4();
    const now = new Date().toISOString();

    // Create Workspace
    await db.insert(schema.organizations).values({
      id: orgId,
      name: 'Test Design Studio',
      slug: `studio-${Date.now()}`,
      currency: 'USD',
      hourlyRate: 150,
      createdAt: now,
      updatedAt: now,
    });

    const org = await db.query.organizations.findFirst({
      where: eq(schema.organizations.id, orgId),
    });
    expect(org).toBeDefined();
    expect(org?.name).toBe('Test Design Studio');
    expect(org?.currency).toBe('USD');

    // Create Client
    const clientId = uuidv4();
    await db.insert(schema.clients).values({
      id: clientId,
      organizationId: orgId,
      name: 'Global Tech Corp',
      email: 'contact@globaltech.com',
      createdAt: now,
      updatedAt: now,
    });

    const clientRec = await db.query.clients.findFirst({
      where: eq(schema.clients.id, clientId),
    });
    expect(clientRec).toBeDefined();
    expect(clientRec?.name).toBe('Global Tech Corp');

    // Create Project
    const projectId = uuidv4();
    await db.insert(schema.projects).values({
      id: projectId,
      organizationId: orgId,
      clientId,
      name: 'Brand Refresh 2026',
      code: 'BR-26',
      startDate: '2026-10-01',
      budget: 15000,
      createdAt: now,
      updatedAt: now,
    });

    const projectRec = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    });
    expect(projectRec?.name).toBe('Brand Refresh 2026');
    expect(projectRec?.budget).toBe(15000);
  });

  it('strictly enforces workspace/tenant isolation', async () => {
    const orgA = uuidv4();
    const orgB = uuidv4();
    const now = new Date().toISOString();

    await db.insert(schema.organizations).values([
      { id: orgA, name: 'Org Alpha', slug: `alpha-${Date.now()}`, createdAt: now, updatedAt: now },
      { id: orgB, name: 'Org Beta', slug: `beta-${Date.now()}`, createdAt: now, updatedAt: now },
    ]);

    // Create client in Org A
    const clientAId = uuidv4();
    await db.insert(schema.clients).values({
      id: clientAId,
      organizationId: orgA,
      name: 'Secret Client of Alpha',
      email: 'secret@alpha.com',
      createdAt: now,
      updatedAt: now,
    });

    // Query from Org B scope
    const queryAsOrgB = await db.query.clients.findFirst({
      where: and(eq(schema.clients.id, clientAId), eq(schema.clients.organizationId, orgB)),
    });

    expect(queryAsOrgB).toBeUndefined();

    // Query from Org A scope
    const queryAsOrgA = await db.query.clients.findFirst({
      where: and(eq(schema.clients.id, clientAId), eq(schema.clients.organizationId, orgA)),
    });

    expect(queryAsOrgA).toBeDefined();
    expect(queryAsOrgA?.name).toBe('Secret Client of Alpha');
  });

  it('accurately maintains financial metrics and payment balances in Turso', async () => {
    const orgId = uuidv4();
    const clientId = uuidv4();
    const projectId = uuidv4();
    const now = new Date().toISOString();

    await db.insert(schema.organizations).values({
      id: orgId,
      name: 'Finance Studio',
      slug: `finance-${Date.now()}`,
      currency: 'USD',
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(schema.clients).values({
      id: clientId,
      organizationId: orgId,
      name: 'Enterprise Client',
      email: 'accounts@enterprise.com',
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(schema.projects).values({
      id: projectId,
      organizationId: orgId,
      clientId,
      name: 'Design System',
      code: 'DS-01',
      startDate: '2026-10-01',
      budget: 8000,
      createdAt: now,
      updatedAt: now,
    });

    // Create Invoice: $8,000 subtotal, 10% tax = $8,800 total
    const invoiceId = uuidv4();
    const totalAmount = 8800;
    await db.insert(schema.invoices).values({
      id: invoiceId,
      organizationId: orgId,
      clientId,
      projectId,
      invoiceNumber: 'INV-2026-001',
      title: 'Phase 1 Delivery',
      issueDate: '2026-10-01',
      dueDate: '2026-10-15',
      currency: 'USD',
      subtotal: 8000,
      taxPercent: 10,
      taxAmount: 800,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    });

    // Record Partial Payment of $5,000
    const paymentId = uuidv4();
    const paymentAmount = 5000;
    await db.insert(schema.payments).values({
      id: paymentId,
      organizationId: orgId,
      invoiceId,
      clientId,
      amount: paymentAmount,
      currency: 'USD',
      paymentMethod: 'stripe',
      paymentDate: '2026-10-02',
      createdAt: now,
    });

    // Update Invoice balance
    const newPaid = paymentAmount;
    const newBalance = totalAmount - newPaid;
    await db.update(schema.invoices)
      .set({
        amountPaid: newPaid,
        balanceDue: newBalance,
        status: newBalance <= 0 ? 'paid' : 'partially_paid',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.invoices.id, invoiceId));

    const updatedInvoice = await db.query.invoices.findFirst({
      where: eq(schema.invoices.id, invoiceId),
    });

    expect(updatedInvoice?.amountPaid).toBe(5000);
    expect(updatedInvoice?.balanceDue).toBe(3800);
    expect(updatedInvoice?.status).toBe('partially_paid');

    // Add Expense of $450
    const expenseId = uuidv4();
    await db.insert(schema.expenses).values({
      id: expenseId,
      organizationId: orgId,
      date: '2026-10-02',
      vendor: 'Figma Subscription',
      category: 'software',
      amount: 450,
      currency: 'USD',
      projectId,
      clientId,
      createdAt: now,
      updatedAt: now,
    });

    // Calculate Project Net Profit: Payment Received ($5,000) - Expense ($450) = $4,550
    const paymentsForProject = await db.query.payments.findMany({
      where: eq(schema.payments.organizationId, orgId),
    });
    const totalPayments = paymentsForProject.reduce((sum, p) => sum + p.amount, 0);

    const expensesForProject = await db.query.expenses.findMany({
      where: eq(schema.expenses.organizationId, orgId),
    });
    const totalExpenses = expensesForProject.reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalPayments - totalExpenses;
    expect(netProfit).toBe(4550);
  });
});
