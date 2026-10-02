# FreelancerOS

> **Run your freelance business without the chaos.**

FreelancerOS is a production-grade business operating system designed for independent creative freelancers, consultants, agency directors, and boutique studios. It replaces scattered spreadsheets, Notion boards, Trello cards, manual invoices, and fragmented communication with an integrated, fast, keyboard-friendly operating system.

---

## 1. Core Architecture & Serverless Infrastructure

FreelancerOS is built on a **100% serverless, Cloudflare-native architecture** designed to eliminate all persistent VPS, Railway, and always-running Node.js server dependencies:

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
- **Serverless API (`apps/api`):** Hono running natively on Cloudflare Workers (`compatibility_flags: ["nodejs_compat"]`). Zero cold starts, global edge latency.
- **Database:** Hosted on **Turso / libSQL** serverless edge database using HTTP web client (`@libsql/client/web`) and Drizzle ORM.
- **File Storage:** **Cloudflare R2** bucket (`R2_BUCKET`) for deliverables, version previews, and invoice attachments without hitting Worker memory limits.
- **Scheduled Jobs:** **Cloudflare Cron Triggers** (`0 * * * *`) for automated overdue invoice detection and sweep.
- **Asynchronous Jobs:** **Cloudflare Queues** (`BACKGROUND_QUEUE`) for reliable background processing.
- **$0 Idle Cost:** Scales to zero when not in use. No persistent VM, VPS, Docker daemon, or Railway instance required.

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
- **Framework:** **Hono** running on **Cloudflare Workers** (Edge-native, sub-millisecond cold starts, serverless-first)
- **Database Engine:** **Turso / libSQL** (Distributed SQLite at the edge)
- **ORM:** **Drizzle ORM** (`drizzle-orm/libsql` & `drizzle-orm/sqlite-core`)
- **Migrations:** Managed via **Drizzle Kit** (`drizzle-kit`)

### Monorepo Structure
```text
freelanceros/
├── apps/
│   ├── web/               # Next.js 15 static export frontend
│   └── api/               # Cloudflare Workers Serverless API (Hono + Drizzle + Turso)
├── packages/
│   ├── types/             # Shared TypeScript domain models & DTOs
│   ├── validation/        # Zod validation schemas shared across client & server
│   ├── api-client/        # Type-safe API client for web & future mobile apps
│   ├── config/            # Constants, currency definitions, pricing plans
│   ├── ui/                # Shared UI primitives and formatters
│   └── tsconfig/          # Base TypeScript configurations
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
3. Your Worker will deploy instantly to `https://freelanceros-api.<your-subdomain>.workers.dev`.

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
