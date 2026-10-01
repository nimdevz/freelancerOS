# FreelancerOS

> **Run your freelance business without the chaos.**

FreelancerOS is a production-grade business operating system designed for independent creative freelancers, consultants, agency directors, and boutique studios. It replaces scattered spreadsheets, Notion boards, Trello cards, manual invoices, and fragmented communication with an integrated, fast, keyboard-friendly operating system.

---

## 1. Core Architecture & Two-Phase Deployment

FreelancerOS features a resilient, dual-layer architecture built to support both **frictionless standalone beta testing** and **full-scale multi-tenant cloud production**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 15 Web Frontend                        │
│          (Statically exported to apps/web/out for Cloudflare CDN)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│     PHASE 1: BETA TESTING     │         │     PHASE 2: CLOUD PRODUCTION │
│  (Embedded In-Browser Engine) │         │       (NestJS + Turso Cloud)  │
│                               │         │                               │
│  • Runs 100% on Cloudflare CDN│         │  • NestJS 11 Modular REST API │
│  • $0 server maintenance / VPS│         │  • Drizzle ORM (libsql driver)│
│  • Client-side persistent DB  │         │  • Turso Serverless Database  │
│  • Private to each tester     │         │  • Multi-tenant isolation     │
└───────────────────────────────┘         └───────────────────────────────┘
```

### Phase 1: Standalone Beta Testing (Active Now)
- **Zero Backend Maintenance:** The web application is compiled as a static Single Page Application (`apps/web/out`) served directly from Cloudflare’s global edge network.
- **Embedded Client Store:** Features a complete client-side data engine (`localStorage`). Each tester gets an isolated, interactive workspace where they can create clients, log projects, track time, generate invoices, record payments, and test currency switching.
- **Zero Server Costs & 100% Uptime:** No servers can crash, time out, or sleep during your beta test period.

### Phase 2: Full-Stack Production (Ready Whenever You Are)
- **Database:** Hosted on **Turso / libSQL** serverless edge database.
- **Backend:** NestJS 11 modular API with Drizzle ORM connecting to Turso.
- **Data Model:** 26 relational tables with strict foreign keys, query indexes, and workspace isolation.

---

## 2. Product Hierarchy & Capabilities

The application navigation is organized around four clear operational workflows rather than raw database tables:

```text
HOME          Executive cockpit: Active timers, overdue invoices, pending deliverables, monthly cash flow

WORK
  ├── Projects      Health status (healthy/at-risk), budgets, timelines, revisions
  ├── Tasks         Priority kanban, client visibility toggle, time-logging
  └── Deliverables  Version tracking (V1, V2), timecoded feedback, client approvals

CLIENTS
  ├── Clients       Lifetime value, outstanding balance, active projects, contact details
  └── Leads         Sales pipeline (New, Contacted, Qualified, Proposal, Won, Lost)

MONEY
  ├── Invoices      Multi-item invoices, tax/discount engine, balance due, payment terms
  └── Expenses      Categorized business expenses, reimbursable flags, profit impact

BUSINESS
  ├── Proposals     Interactive client proposals with validity dates and auto-calculations
  ├── Time          Real-time live stopwatch timer, billable rates, time logs
  └── Reports       Cashflow reports, profit margins, effective hourly rate calculation

SETTINGS        Organization profile, commercial rates, tax ID, wire details
```

---

## 3. Tech Stack

### Frontend (`apps/web`)
- **Framework:** Next.js 15 (App Router, React 19, TypeScript strict mode)
- **Deployment:** Statically exported (`output: 'export'`) for Cloudflare Pages / Workers Static Assets
- **Styling:** Tailwind CSS, Radix UI primitives, Lucide Icons, Framer Motion
- **Currency Engine:** Real-time multi-currency switcher defaulting to **USD ($)**, with support for EUR (€), GBP (£), CAD (C$), AUD (A$), and INR (₹)
- **Authentication:** Integrated Google Identity Services (GIS) OAuth 2.0 with instant fallback

### Backend API (`apps/api`)
- **Framework:** NestJS 11 (Modular Domain Architecture, OpenAPI / Swagger 3.0)
- **Database Engine:** **Turso / libSQL** (Distributed SQLite at the edge)
- **ORM:** **Drizzle ORM** (`drizzle-orm/libsql` & `drizzle-orm/sqlite-core`)
- **Migrations:** Managed via **Drizzle Kit** (`drizzle-kit`)

### Monorepo Structure
```text
freelanceros/
├── apps/
│   ├── web/               # Next.js 15 static export frontend
│   └── api/               # NestJS 11 REST API with Drizzle ORM & Turso
├── packages/
│   ├── types/             # Shared TypeScript domain models & DTOs
│   ├── validation/        # Zod validation schemas shared across client & server
│   ├── api-client/        # Type-safe API client for web & future mobile apps
│   ├── config/            # Constants, currency definitions, pricing plans
│   ├── ui/                # Shared UI primitives and formatters
│   ├── tsconfig/          # Base TypeScript configurations
│   └── eslint-config/     # Workspace linting rules
├── wrangler.json          # Cloudflare Workers / Pages static assets configuration
└── package.json           # Monorepo scripts
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

# Seed realistic demo data into Turso (Nimish Studio, clients, projects, invoices)
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
NEXT_PUBLIC_GOOGLE_CLIENT_ID=362907268046-lvln83c11jc8ljqope283kgh9juj944u.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Networking
NEXT_PUBLIC_API_URL=http://localhost:4000/api
PORT=4000
```

> **Security Note:**  
> All `.env`, `.env.local`, and `.env.production` files are strictly ignored by `.gitignore`. Never commit private credentials or auth tokens to Git.

---

## 7. Cloudflare Deployment (Web Frontend)

FreelancerOS is optimized for zero-overhead static deployment on Cloudflare.

### Important: Why Cloudflare Secret Configuration is Not Required
When deploying the web app to Cloudflare:
- The web app is compiled to **100% static HTML, CSS, and JS** in `apps/web/out`.
- Cloudflare serves these assets directly from its global CDN without executing server-side Worker scripts.
- **You do not need to add any secrets or runtime environment variables in the Cloudflare dashboard.** Leave the Variables / Secrets section blank.
- Private database secrets (`TURSO_AUTH_TOKEN`, `GOOGLE_CLIENT_SECRET`) belong exclusively to your backend API server, protecting them from browser exposure.

### Deploying via Cloudflare Dashboard
1. Go to **Cloudflare Dashboard** &rarr; **Workers & Pages** &rarr; **Create** &rarr; **Pages** &rarr; **Connect to Git**.
2. Select `nimdevz/freelancerOS` (`main` branch).
3. Build Settings:
   - **Framework preset:** `None`
   - **Build command:** `pnpm run build`
   - **Build output directory:** `apps/web/out`
4. Leave environment variables blank and click **Save and Deploy**.

### Deploying via CLI (Wrangler)
```bash
# Build static assets
pnpm run build

# Deploy directly via Wrangler
pnpm run deploy
```

---

## 8. Google OAuth Portal Setup

To test Google Sign-In with your live Cloudflare deployment:

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

Includes:
- Multi-tenancy and workspace isolation verification.
- Financial calculation and tax reconciliation tests.
- Deliverable revision limits and scope-creep guards.
- Turso / libSQL integration tests.

---

## License
MIT
