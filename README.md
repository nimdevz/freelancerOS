# FreelancerOS

> **The all-in-one business operating system for independent professionals, consultants, and boutique creative studios.**

FreelancerOS is a production-grade business management platform designed to replace fragmented spreadsheets, Notion workspaces, Trello boards, disconnected invoice generators, and lost email threads with a single, ultra-fast, keyboard-friendly operating system.

Built from the ground up on a **100% serverless, Cloudflare-native architecture**, FreelancerOS scales down to zero idle costs while providing sub-millisecond global edge response times.

---

## 1. Core Architecture & Serverless Infrastructure

FreelancerOS eliminates persistent VPS, Railway, and always-on Node.js container dependencies in favor of a modern, edge-native Cloudflare stack:

```text
                              FREELANCEROS
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                  Next.js                    API Layer
                     │                           │
             Cloudflare Pages             Hono on Workers
                     │                           │
                     └─────────────┬─────────────┘
                                   │
                          Cloudflare Network
                                   │
               ┌───────────────────┼───────────────────┐
               │                   │                   │
               ▼                   ▼                   ▼
             Turso                 R2              Queues & Crons
           Database              Files            Background Jobs
               │                   │                   │
               │                   │                   ▼
               │                   │             Scheduled Sweep
               │                   │
               └───────────────────┴───────────────────
```

### Infrastructure Components
- **Frontend (`apps/web`):** Next.js 15 statically compiled (`output: 'export'`) to `apps/web/out` and served from Cloudflare's global edge network.
- **Serverless API (`apps/api`):** [Hono](https://hono.dev) running natively on Cloudflare Workers (`compatibility_flags: ["nodejs_compat"]`). Zero cold starts, sub-10ms global edge routing.
- **Edge Database:** Hosted on **Turso / libSQL** serverless edge database using HTTP web client (`@libsql/client/web`) and [Drizzle ORM](https://orm.drizzle.team).
- **Object Storage:** **Cloudflare R2** bucket (`R2_BUCKET`) for project deliverables, asset files, and attachments with direct pre-signed URLs.
- **Scheduled Jobs:** **Cloudflare Cron Triggers** (`0 * * * *`) for automated invoice reconciliation, overdue status sweeps, and retainer cycle resets.
- **Asynchronous Jobs:** **Cloudflare Queues** (`BACKGROUND_QUEUE`) for reliable asynchronous background processing without worker thread exhaustion.
- **$0 Idle Cost:** Scales to absolute zero when idle. No persistent VM, VPS, Docker daemon, or recurring server bills.

---

## 2. Product Modules & Feature Matrix

FreelancerOS organizes business operations into focused, interconnected operational workflows:

```text
HOME          Executive cockpit: Active timers, overdue invoices, pending deliverables, cash flow overview

WORK
  ├── Projects      Health status (healthy/at-risk), budgets, timelines, milestones, 4-gate closeout
  ├── Tasks         Priority kanban, client visibility toggle, time-logging, chained dependencies
  └── Deliverables  Version tracking (V1, V2+), revision limits, timecoded feedback, client approvals

CLIENTS
  ├── Clients       Multi-contact directories, communication timeline, lifetime value (LTV), inline creation
  └── Leads         7-stage sales pipeline (New → Contacted → Qualified → Proposal → Negotiation → Won/Lost)

MONEY
  ├── Invoices      Multi-item line item engine, tax/discount calculation, partial payments, payment reminders
  ├── Retainers     Monthly recurring retainers, capacity usage gauges, automated rollover tracking
  └── Expenses      Categorized business expenses, receipt attachments, reimbursable flags, profit impact

BUSINESS
  ├── Proposals     Interactive client proposals, custom packages, optional add-ons, validity windows
  ├── Quotes        Formal estimates, itemized line items, 1-click conversion to active projects
  ├── Contracts     Digital contract agreements, signing workflows, scope boundaries
  ├── Time          Real-time live stopwatch timer, project/task timers, billable rates, manual logging
  └── Reports       Cashflow reports, profit margins, effective hourly rate (EHR) calculations

SETTINGS        Organization profile, commercial rates, tax ID, wire details, tier management
```

### Detailed Module Capabilities

#### 📂 Projects & Execution
- **Milestones & Phasing:** Structure projects into sequential phases with target completion dates and progress tracking.
- **Project & Task Templates:** Spin up pre-configured workflows for recurring service offerings in seconds.
- **Subtasks & Chained Dependencies:** Define prerequisite tasks and subtask checklists to keep deliverables on schedule.
- **Project Scratchpad:** In-context markdown notes and reference links attached directly to active projects.
- **4-Gate Project Closeout:** Structured completion checklist ensuring deliverables are approved, time is billed, invoices are issued, and assets are archived before archive.
- **Cascade Deletion:** Delete projects cleanly with relational cleanup of associated tasks, milestones, deliverables, and logs.

#### 👥 CRM, Clients & Leads
- **Universal Inline Client Creation:** Add new clients directly from any dropdown or modal across the entire app without leaving the current workflow.
- **Multi-Contact Directory:** Store multiple points of contact per client organization with role tags and direct email links.
- **Activity & Communication Timeline:** Log meeting notes, calls, emails, and touchpoints chronologically.
- **7-Stage Lead Pipeline:** Manage prospective deals across `New`, `Contacted`, `Qualified`, `Proposal`, `Negotiation`, `Won`, and `Lost` with follow-up date alerts.
- **LTV & Profitability Analytics:** Real-time visibility into total billings, outstanding balances, and gross margins per client.

#### 📝 Proposals, Quotes & Contracts
- **Custom Packages & Add-ons:** Offer tiered proposals (e.g., Base, Pro, Studio) with optional add-on line items.
- **1-Click Project Conversion:** Instantly convert approved proposals or accepted quotes into active projects with pre-populated budgets and scopes.
- **Scope Guardianship:** Define clear scope boundaries (included vs. excluded items) and track client change requests with formal change order generation.
- **Digital Agreements:** Issue formal contracts with scope clauses, payment terms, and status tracking.

#### 📦 Deliverables & Review Hub
- **Multi-Version Tracking:** Organize assets across iterations (V1, V2, V3) with side-by-side review capabilities.
- **Revision Limit Guards:** Set contracted revision allowances per deliverable; warn when additional revision rounds require change orders.
- **Timecoded Feedback:** Capture precise, actionable feedback linked to timestamps or asset regions.
- **Approval Workflows:** Client sign-off and approval logging for indisputable audit trails.

#### 💳 Financials, Invoicing & Retainers
- **Comprehensive Invoicing Engine:** Multi-item invoices supporting itemized hours, fixed fees, custom tax rates, and percentage or flat discounts.
- **Partial Payments:** Record deposit payments and installments with dynamic balance-due tracking.
- **Automated Overdue Sweeps:** Hourly Cloudflare Cron triggers flag overdue accounts and prompt payment reminders.
- **Monthly Retainers:** Manage recurring client agreements with real-time capacity utilization gauges and monthly cycle resets.
- **Expense Tracking:** Log operational expenses by category, tag reimbursable client expenses, and factor expenditures into net profit metrics.

#### ⏱️ Time Tracking & Productivity
- **Global Live Stopwatch:** Persistent floating stopwatch timer that survives page navigation, reload, and view switching.
- **Granular Task Association:** Link recorded intervals directly to specific projects and individual tasks.
- **Billable Rate Multipliers:** Calculate project cost accurately using custom billable hourly rates or fixed-fee milestones.

#### 🗑️ Full-Spectrum Entity Deletion
- **Universal Deletion Coverage:** Native delete actions across all entities—Projects, Clients, Tasks, Time Entries, Invoices, Leads, Proposals, Quotes, Contracts, Retainers, Deliverables, and Expenses.
- **Relational Cascade Cleanup:** Server-side cascade deletion ensures database cleanliness with zero orphaned foreign key records.
- **Confirmation Protection:** Safety dialogs and confirmation states prevent accidental data loss.

---

## 3. Tech Stack

### Frontend (`apps/web`)
- **Framework:** Next.js 15 (App Router, React 19, TypeScript strict mode)
- **Export Strategy:** Static HTML/JS export (`output: 'export'`) optimized for Cloudflare Pages / Workers Static Assets
- **Styling & UI:** Tailwind CSS, Radix UI primitives, Lucide Icons, Framer Motion
- **Currency Engine:** Real-time multi-currency support defaulting to **USD ($)**, with instant switching to EUR (€), GBP (£), CAD (C$), AUD (A$), and INR (₹)
- **Authentication:** Google Identity Services (GIS) OAuth 2.0 with instant session handling and database profile synchronization

### Backend API (`apps/api`)
- **Framework:** [Hono](https://hono.dev) running on Cloudflare Workers
- **Database Engine:** [Turso / libSQL](https://turso.tech) (Distributed SQLite at the edge)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team) (`drizzle-orm/libsql` & `drizzle-orm/sqlite-core`)
- **Migrations & Studio:** Drizzle Kit (`drizzle-kit`)
- **Storage:** Cloudflare R2 object storage for project files and attachments
- **Queues & Crons:** Cloudflare Queues for async processing and Cron Triggers for scheduled tasks

### Monorepo Structure
```text
freelanceros/
├── apps/
│   ├── web/               # Next.js 15 static export frontend
│   └── api/               # Cloudflare Workers Serverless API (Hono + Drizzle + Turso)
├── packages/
│   ├── types/             # Shared TypeScript domain models & DTOs
│   ├── validation/        # Zod validation schemas shared across client & server
│   ├── api-client/        # Type-safe API client for web & integrations
│   ├── config/            # Constants, currency definitions, system configs
│   ├── ui/                # Shared UI primitives, formatters, and icons
│   └── tsconfig/          # Base TypeScript configurations
├── wrangler.json          # Cloudflare Workers / Pages configuration
└── package.json           # Monorepo scripts & workspaces
```

---

## 4. Local Development

### Prerequisites
- **Node.js** >= 20.x (Node 22 LTS recommended)
- **pnpm** >= 9.x / 10.x

### Quickstart
```bash
# 1. Clone repository
git clone https://github.com/nimdevz/freelancerOS.git
cd freelancerOS

# 2. Install dependencies
pnpm install

# 3. Build all packages and applications
pnpm run build

# 4. Start local development servers
pnpm dev
```

### URLs
- **Web App:** [http://localhost:3000](http://localhost:3000)
- **API Server:** [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger API Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 5. Database Commands (Turso / libSQL)

The database layer is managed through Drizzle Kit and libSQL:

```bash
# Push schema changes directly to your Turso cloud database
pnpm run db:push

# Generate a new SQL migration file
pnpm run db:generate

# Apply pending migrations
pnpm run db:migrate

# Seed realistic demo data into Turso (clients, projects, invoices, tasks)
pnpm run seed

# Open Drizzle Studio (Visual database browser in your browser)
pnpm run db:studio
```

---

## 6. Environment Variables Reference

A template is provided in [`.env.example`](.env.example):

```env
# Database (Server-only — Turso Cloud or local SQLite file)
TURSO_DATABASE_URL=libsql://freelanceros-nimdevz.aws-ap-southeast-2.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# Google OAuth Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Networking
NEXT_PUBLIC_API_URL=http://localhost:4000/api
PORT=4000
```

> **Security Note:**  
> All `.env`, `.env.local`, and `.env.production` files are strictly ignored by `.gitignore`. Never commit private credentials or auth tokens to Git.

---

## 7. Cloudflare Serverless Deployment

FreelancerOS is optimized for zero-overhead serverless deployment on Cloudflare:

### A. Deploying Serverless API Worker (`apps/api`)
The API runs as a Cloudflare Worker powered by Hono, Drizzle ORM, Turso, R2, and Cron triggers.

1. **Set Cloudflare Secrets for the Worker:**
   ```bash
   cd apps/api
   npx wrangler secret put TURSO_DATABASE_URL
   # Enter: libsql://freelanceros-nimdevz.aws-ap-southeast-2.turso.io

   npx wrangler secret put TURSO_AUTH_TOKEN
   # Enter your Turso Auth Token
   ```

2. **Deploy the Worker:**
   ```bash
   pnpm run deploy:worker
   ```
   Your Worker will deploy instantly to `https://freelanceros-api.<your-subdomain>.workers.dev`.

### B. Deploying Static Frontend (`apps/web`)
1. **Via Cloudflare Dashboard:**
   - Go to **Cloudflare Dashboard** &rarr; **Workers & Pages** &rarr; **Create** &rarr; **Pages** &rarr; **Connect to Git**.
   - Select `nimdevz/freelancerOS` (`main` branch).
   - Build Settings:
     - **Build command:** `pnpm run build`
     - **Build output directory:** `apps/web/out`
   - Leave environment variables blank and click **Save and Deploy**.

2. **Via Wrangler CLI:**
   ```bash
   pnpm run build
   pnpm run deploy:web
   ```

---

## 8. Google OAuth Portal Setup

To configure Google Sign-In with your live Cloudflare deployment:

1. Open **[Google Cloud Console](https://console.cloud.google.com/)** &rarr; **APIs & Services** &rarr; **Credentials**.
2. Select your **OAuth 2.0 Client ID**:
   - **Authorized JavaScript origins:**
     ```text
     http://localhost:3000
     https://<your-project>.pages.dev
     ```
   - **Authorized redirect URIs:**
     ```text
     http://localhost:3000
     http://localhost:3000/login
     https://<your-project>.pages.dev
     https://<your-project>.pages.dev/login
     ```
3. Under **OAuth consent screen**:
   - If publishing status is **Testing**, add your personal email to **Test users**.
   - When ready for public users, click **Publish App**.

---

## 9. Verification & Test Suite

Run the full monorepo test suite:

```bash
pnpm run test
```

Verification covers:
- Multi-tenancy and workspace isolation verification.
- Financial calculation and tax reconciliation tests.
- Deliverable revision limits and scope-creep guards.
- Universal cascade deletion integrity across all relational entities.
- Turso / libSQL integration tests.

---

## License
MIT
