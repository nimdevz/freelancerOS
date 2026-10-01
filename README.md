# FreelancerOS

> **Your freelance business, in one place.**

FreelancerOS is a production-grade operating system designed for independent freelancers, creative directors, consultants, and boutique studios. It replaces scattered tools (Notion, Google Sheets, Trello, WhatsApp, manual invoicing, separate calendars) with a unified, high-performance platform.

---

## The Complete Client Lifecycle

FreelancerOS manages every stage of client engagement seamlessly:

```
Lead → Client → Proposal → Quote → Scope → Contract → Project → Tasks → Time → Feedback → Revisions → Approval → Delivery → Invoice → Payment → Follow-up → Retainer / Repeat Work
```

### Core Product Principle
> **A freelancer should always know what needs attention, what is waiting on someone else, and what money is coming in.**

---

## Architecture & Monorepo Structure

Built as a clean Turborepo monorepo with strict TypeScript typing across all boundaries:

```
freelanceros/
├── apps/
│   ├── web/               # Next.js 15 App Router frontend (23 pages, Tailwind CSS, shadcn/ui)
│   └── api/               # NestJS modular backend REST API & OpenAPI docs
└── packages/
    ├── types/             # Shared TypeScript domain models & DTOs
    ├── validation/        # Zod validation schemas shared across client & server
    ├── api-client/        # Type-safe API client for web & future mobile app
    ├── config/            # Shared configuration constants & environment definitions
    ├── ui/                # Shared UI primitives and components
    ├── tsconfig/          # Base TypeScript configurations
    └── eslint-config/     # Monorepo linting rules
```

---

## Tech Stack

### Web Application (`apps/web`)
- **Framework:** Next.js 15 (App Router, React 19, TypeScript strict mode)
- **Styling:** Tailwind CSS + Radix UI + Lucide Icons + Framer Motion
- **State & Data Fetching:** TanStack Query + Zustand
- **Theme:** Minimal editorial light mode with dark mode support

### Backend API (`apps/api`)
- **Framework:** NestJS 11 (Modular Domain Architecture, OpenAPI / Swagger 3.0)
- **Database ORM:** Drizzle ORM
- **Database Engine:** Embedded PostgreSQL via `@electric-sql/pglite` (zero external DB setup required)
- **Background Jobs:** BullMQ runner architecture
- **Storage & Payments:** Cloudflare R2 presigned URLs & Stripe payment integration patterns

---

## Backend Modules

The NestJS backend (`apps/api`) is organized into dedicated domain modules:

| Module | Description |
| :--- | :--- |
| **Auth & Organizations** | Multi-tenant organization scoping, role-based access (Owner, Admin, Member) |
| **Clients & Contacts** | Comprehensive client relationship management, lifetime revenue, health status |
| **Leads & Pipeline** | Kanban stage pipeline (New, Contacted, Qualified, Proposal, Negotiation, Won, Lost) |
| **Proposals & Quotes** | Interactive multi-item proposals and quotes with automatic tax/discount calculation |
| **Contracts** | Contract status tracking, terms, and e-signature preparation |
| **Projects & Tasks** | Project planning, phases, milestones, task assignments, and progress tracking |
| **Time Tracking** | Real-time stopwatch timer and manual billable time entries |
| **Deliverables & Revisions** | Versioned file delivery, client revision tracking, and scope-creep guard |
| **Feedback & Approvals** | Timecoded/itemized feedback and client formal sign-off flows |
| **Invoices & Payments** | Multi-item invoicing, partial/full payment reconciliation, overdue tracking |
| **Expenses & Retainers** | Business expense tracking and recurring retainer management |
| **Dashboard & Reports** | Action-oriented executive summary, revenue vs. expense financial reporting |

---

## Getting Started

### Prerequisites
- **Node.js** >= 20.x (Node 22 LTS recommended)
- **pnpm** >= 9.x / 10.x

### Installation & Build

```bash
# Clone the repository
git clone https://github.com/nimdevz/freelancerOS.git
cd freelancerOS

# Install dependencies across all monorepo packages
pnpm install

# Build all packages and applications
pnpm -r run build
```

### Running Locally

```bash
# 1. Start the backend API (Port 4000)
pnpm --filter=@freelanceros/api start

# 2. Start the web application (Port 3000)
pnpm --filter=@freelanceros/web start
# or for development mode with hot reloading:
pnpm --filter=@freelanceros/web dev
```

### URLs
- **Web App:** [http://localhost:3000](http://localhost:3000)
- **API Endpoints:** [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger Documentation:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## License
MIT
