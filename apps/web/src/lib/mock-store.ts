import type {
  Client,
  ClientContact,
  Lead,
  Project,
  Task,
  TimeEntry,
  Proposal,
  Quote,
  Contract,
  Deliverable,
  DeliverableVersion,
  FeedbackItem,
  Revision,
  Approval,
  Invoice,
  Payment,
  Expense,
  Retainer,
  Notification,
  ActivityLog,
  DashboardData,
  FinancialReportsData,
  Organization,
  User,
  ProjectMilestone,
  ProjectScope,
  ScopeChange,
  AssetRequest,
  ProductionCallSheet,
  ProductionShot,
  EquipmentItem,
  RateCalculatorInput,
  RateCalculatorResult,
  RunwayCalculatorInput,
  RunwayCalculatorResult,
  BusinessGoal,
  CaseStudy,
  ClientPortalData,
  ProjectFile,
} from '@freelanceros/types';
import { resolveUserTier } from '@freelanceros/config';

const STORAGE_KEY = 'freelanceros_mock_db_v3';

const INITIAL_USER: User = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'nimish@freelanceros.com',
  firstName: 'Nimish',
  lastName: 'Prabhu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  role: 'owner',
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
};

const INITIAL_ORG: Organization = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'Nimish Studio',
  slug: 'nimish-studio',
  currency: 'USD',
  timezone: 'America/New_York',
  defaultPaymentTermsDays: 14,
  taxRatePercent: 0,
  plan: resolveUserTier(INITIAL_USER.email),
  freelancerType: 'video_editor',
  hourlyRate: 125,
  defaultHourlyRate: 125,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
};

const INITIAL_CLIENTS: Client[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    organizationId: INITIAL_ORG.id,
    name: 'Nike India',
    company: 'Nike, Inc.',
    email: 'campaigns@nike.com',
    phone: '+1 (503) 671-6453',
    currency: 'USD',
    address: 'One Bowerman Drive, Beaverton, OR 97005',
    notes: 'High priority brand partner. Strict turnaround for product launches.',
    status: 'active',
    activeProjectsCount: 1,
    totalRevenue: 4800,
    outstandingBalance: 0,
    createdAt: '2026-08-10T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    organizationId: INITIAL_ORG.id,
    name: 'Acme Corp',
    company: 'Acme Technologies',
    email: 'product@acmecorp.io',
    phone: '+1 (415) 555-0199',
    currency: 'USD',
    address: '500 Howard St, San Francisco, CA 94105',
    notes: 'Fintech product design and marketing video series.',
    status: 'active',
    activeProjectsCount: 1,
    totalRevenue: 0,
    outstandingBalance: 3200,
    createdAt: '2026-08-20T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    organizationId: INITIAL_ORG.id,
    name: 'Northstar Luxury',
    company: 'Northstar Eco Group',
    email: 'creative@northstar.co',
    phone: '+1 (212) 555-0144',
    currency: 'USD',
    address: '767 5th Ave, New York, NY 10153',
    notes: 'High aesthetic brand film and social campaign.',
    status: 'active',
    activeProjectsCount: 1,
    totalRevenue: 2500,
    outstandingBalance: 4250,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    organizationId: INITIAL_ORG.id,
    name: 'Mountain Labs',
    company: 'Mountain Robotics AI',
    email: 'founders@mountainlabs.ai',
    phone: '+1 (617) 555-0182',
    currency: 'USD',
    address: '100 Technology Dr, Boston, MA 02110',
    notes: 'Deep tech AI hardware robotics launch.',
    status: 'active',
    activeProjectsCount: 1,
    totalRevenue: 0,
    outstandingBalance: 0,
    createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-09-27T00:00:00Z',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    organizationId: INITIAL_ORG.id,
    name: 'Atlas Media',
    company: 'Atlas Media Network',
    email: 'editorial@atlasmedia.tv',
    phone: '+1 (206) 555-0177',
    currency: 'USD',
    address: '340 Pine St, Seattle, WA 98101',
    notes: 'High volume social & trailer campaign partner with recurring quarterly retainers.',
    status: 'active',
    activeProjectsCount: 1,
    totalRevenue: 3800,
    outstandingBalance: 1900,
    createdAt: '2026-08-15T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
];

const INITIAL_CLIENT_CONTACTS: ClientContact[] = [
  {
    id: 'ct-nike-1',
    clientId: '11111111-1111-1111-1111-111111111111',
    name: 'Vikram Malhotra',
    email: 'campaigns@nike.com',
    phone: '+1 (503) 671-6453',
    role: 'Global Marketing Director',
    isPrimary: true,
    createdAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'ct-nike-2',
    clientId: '11111111-1111-1111-1111-111111111111',
    name: 'Pooja Sen',
    email: 'ap-creative@nike.com',
    phone: '+1 (503) 671-8821',
    role: 'Finance & Accounts Payable',
    isPrimary: false,
    createdAt: '2026-08-12T00:00:00Z',
  },
  {
    id: 'ct-northstar-1',
    clientId: '44444444-4444-4444-4444-444444444444',
    name: 'Elena Rostova',
    email: 'creative@northstar.co',
    phone: '+1 (212) 555-0144',
    role: 'Creative VP & Brand Lead',
    isPrimary: true,
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ct-northstar-2',
    clientId: '44444444-4444-4444-4444-444444444444',
    name: 'Marcus Vance',
    email: 'marcus@northstar.co',
    phone: '+1 (212) 555-0188',
    role: 'Head of Production & Media',
    isPrimary: false,
    createdAt: '2026-09-02T00:00:00Z',
  },
  {
    id: 'ct-acme-1',
    clientId: '33333333-3333-3333-3333-333333333333',
    name: 'Sarah Connor',
    email: 'product@acmecorp.io',
    phone: '+1 (415) 555-0199',
    role: 'Head of Product Marketing',
    isPrimary: true,
    createdAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'ct-acme-2',
    clientId: '33333333-3333-3333-3333-333333333333',
    name: 'David Brent',
    email: 'billing@acmecorp.io',
    phone: '+1 (415) 555-0190',
    role: 'Controller & Procurement',
    isPrimary: false,
    createdAt: '2026-08-22T00:00:00Z',
  },
  {
    id: 'ct-atlas-1',
    clientId: '66666666-6666-6666-6666-666666666666',
    name: 'Chloe Danvers',
    email: 'editorial@atlasmedia.tv',
    phone: '+1 (206) 555-0177',
    role: 'Executive Producer',
    isPrimary: true,
    createdAt: '2026-08-15T00:00:00Z',
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    organizationId: INITIAL_ORG.id,
    clientId: '11111111-1111-1111-1111-111111111111',
    name: 'Summer Campaign Film',
    code: 'PRJ-101',
    description: '60s Hero Commercial + 3 vertical cuts for Instagram and YouTube Shorts.',
    status: 'active',
    health: 'healthy',
    startDate: '2026-09-11',
    deadline: '2026-10-06',
    budget: 8500,
    currency: 'USD',
    includedRevisions: 2,
    progressPercent: 75,
    clientName: 'Nike India',
    totalHoursTracked: 9.5,
    totalInvoiced: 4800,
    totalPaid: 4800,
    totalExpenses: 450,
    profit: 4350,
    effectiveHourlyRate: 458,
    completedRevisions: 1,
    createdAt: '2026-09-11T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    organizationId: INITIAL_ORG.id,
    clientId: '44444444-4444-4444-4444-444444444444',
    name: 'Brand Manifesto Film',
    code: 'PRJ-102',
    description: 'Cinematic documentary brand film shot in Ladakh and Himalayas.',
    status: 'review',
    health: 'at_risk',
    healthReason: 'Revisions exceed included scope (Revision 3 in progress)',
    startDate: '2026-08-27',
    deadline: '2026-10-03',
    budget: 12000,
    currency: 'USD',
    includedRevisions: 2,
    progressPercent: 85,
    clientName: 'Northstar Luxury',
    totalHoursTracked: 4.0,
    totalInvoiced: 6750,
    totalPaid: 2500,
    totalExpenses: 320,
    profit: 2180,
    effectiveHourlyRate: 545,
    completedRevisions: 3,
    createdAt: '2026-08-27T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: '2afd62bc-89ee-4e7e-a59b-ae571ca9a311',
    organizationId: INITIAL_ORG.id,
    clientId: '33333333-3333-3333-3333-333333333333',
    name: 'Website Redesign & Product Visuals',
    code: 'PRJ-103',
    description: 'Complete visual overhaul of landing page with custom motion graphics.',
    status: 'active',
    health: 'healthy',
    startDate: '2026-09-16',
    deadline: '2026-10-13',
    budget: 5500,
    currency: 'USD',
    includedRevisions: 2,
    progressPercent: 40,
    clientName: 'Acme Corp',
    totalHoursTracked: 6.0,
    totalInvoiced: 3200,
    totalPaid: 0,
    totalExpenses: 180,
    profit: -180,
    effectiveHourlyRate: 0,
    completedRevisions: 0,
    createdAt: '2026-09-16T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z',
  },
  {
    id: '735ef78e-1920-45ec-8e7c-982f2b6cf022',
    organizationId: INITIAL_ORG.id,
    clientId: '55555555-5555-5555-5555-555555555555',
    name: 'Robotics Demo Social Campaign',
    code: 'PRJ-104',
    description: 'Weekly teaser clips and founder interview series.',
    status: 'planning',
    health: 'healthy',
    startDate: '2026-09-26',
    deadline: '2026-10-26',
    budget: 4200,
    currency: 'USD',
    includedRevisions: 2,
    progressPercent: 15,
    clientName: 'Mountain Labs',
    totalHoursTracked: 2.0,
    totalInvoiced: 0,
    totalPaid: 0,
    totalExpenses: 0,
    profit: 0,
    effectiveHourlyRate: 0,
    completedRevisions: 0,
    createdAt: '2026-09-26T00:00:00Z',
    updatedAt: '2026-09-27T00:00:00Z',
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    organizationId: INITIAL_ORG.id,
    clientId: '66666666-6666-6666-6666-666666666666',
    name: 'Atlas Episodic Social Campaign',
    code: 'PRJ-105',
    description: 'Weekly teaser clips and vertical trailers for episodic documentary series.',
    status: 'active',
    health: 'blocked',
    healthReason: 'Waiting on raw media delivery from client shoot team',
    startDate: '2026-09-20',
    deadline: '2026-10-08',
    budget: 3800,
    currency: 'USD',
    includedRevisions: 2,
    progressPercent: 30,
    clientName: 'Atlas Media',
    totalHoursTracked: 3.5,
    totalInvoiced: 1900,
    totalPaid: 0,
    totalExpenses: 120,
    profit: -120,
    effectiveHourlyRate: 0,
    completedRevisions: 0,
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    organizationId: INITIAL_ORG.id,
    title: 'Editorial Campaign Reel',
    clientName: 'Rhea Kapoor',
    company: 'Condé Nast Digital',
    email: 'rhea@condenast.com',
    phone: '+1 (212) 555-0188',
    stage: 'qualified',
    value: 15000,
    currency: 'USD',
    probabilityPercent: 75,
    notes: 'Fashion Week Special 3-part commercial reel series.',
    expectedCloseDate: '2026-10-10',
    createdAt: '2026-09-25T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: 'lead-2',
    organizationId: INITIAL_ORG.id,
    title: 'Series A Launch Video',
    clientName: 'Aditya Roy',
    company: 'Nexus Pay',
    email: 'aditya@nexuspay.com',
    phone: '+1 (415) 555-0177',
    stage: 'proposal',
    value: 12000,
    currency: 'USD',
    probabilityPercent: 60,
    notes: '2-minute high octane product video for TechCrunch launch.',
    expectedCloseDate: '2026-10-15',
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'lead-3',
    organizationId: INITIAL_ORG.id,
    title: 'Hospitality Brand Film',
    clientName: 'Tara Sharma',
    company: 'Heritage Palaces',
    email: 'tara@heritagehotels.com',
    phone: '+1 (312) 555-0166',
    stage: 'negotiation',
    value: 18000,
    currency: 'USD',
    probabilityPercent: 85,
    notes: 'Architectural walkthrough & cinematic experiential film.',
    expectedCloseDate: '2026-10-08',
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z',
  },
  {
    id: 'lead-4',
    organizationId: INITIAL_ORG.id,
    title: 'Fintech App Explainer',
    clientName: 'Rohan Mehta',
    company: 'Kite Protocol',
    email: 'rohan@kiteprotocol.io',
    phone: '+1 (650) 555-0155',
    stage: 'contacted',
    value: 6500,
    currency: 'USD',
    probabilityPercent: 30,
    notes: '3D animated motion explainer video for web3 DeFi token.',
    expectedCloseDate: '2026-10-25',
    createdAt: '2026-09-28T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    organizationId: INITIAL_ORG.id,
    clientId: '11111111-1111-1111-1111-111111111111',
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    invoiceNumber: 'INV-2026-001',
    title: 'Summer Campaign Film — 50% Milestone Advance',
    status: 'paid',
    issueDate: '2026-09-12',
    dueDate: '2026-09-26',
    paidAt: '2026-09-20',
    subtotal: 4800,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    total: 4800,
    totalAmount: 4800,
    amountPaid: 4800,
    balanceDue: 0,
    currency: 'USD',
    clientName: 'Nike India',
    projectName: 'Summer Campaign Film',
    items: [
      {
        id: 'item-1',
        description: 'Pre-production & 60s Hero Cut Direction (50%)',
        quantity: 1,
        unitPrice: 4800,
        amount: 4800,
      },
    ],
    createdAt: '2026-09-12T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
  },
  {
    id: 'inv-2',
    organizationId: INITIAL_ORG.id,
    clientId: '44444444-4444-4444-4444-444444444444',
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    invoiceNumber: 'INV-2026-002',
    title: 'Brand Manifesto Film — 50% Project Advance',
    status: 'partially_paid',
    issueDate: '2026-08-28',
    dueDate: '2026-09-11',
    subtotal: 6750,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    total: 6750,
    totalAmount: 6750,
    amountPaid: 2500,
    balanceDue: 4250,
    currency: 'USD',
    clientName: 'Northstar Luxury',
    projectName: 'Brand Manifesto Film',
    items: [
      {
        id: 'item-2',
        description: 'Expedition Shoot & Raw Editorial Assembly',
        quantity: 1,
        unitPrice: 6750,
        amount: 6750,
      },
    ],
    createdAt: '2026-08-28T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'inv-3',
    organizationId: INITIAL_ORG.id,
    clientId: '33333333-3333-3333-3333-333333333333',
    projectId: '2afd62bc-89ee-4e7e-a59b-ae571ca9a311',
    invoiceNumber: 'INV-2026-003',
    title: 'Website Redesign & Motion Graphics Initial Deposit',
    status: 'sent',
    issueDate: '2026-09-17',
    dueDate: '2026-10-01',
    subtotal: 3200,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    total: 3200,
    totalAmount: 3200,
    amountPaid: 0,
    balanceDue: 3200,
    currency: 'USD',
    clientName: 'Acme Corp',
    projectName: 'Website Redesign & Product Visuals',
    items: [
      {
        id: 'item-3',
        description: 'Landing Page Figma Architecture & Motion Prototyping',
        quantity: 1,
        unitPrice: 3200,
        amount: 3200,
      },
    ],
    createdAt: '2026-09-17T00:00:00Z',
    updatedAt: '2026-09-17T00:00:00Z',
  },
  {
    id: 'inv-4',
    organizationId: INITIAL_ORG.id,
    clientId: '66666666-6666-6666-6666-666666666666',
    projectId: '88888888-8888-8888-8888-888888888888',
    invoiceNumber: 'INV-2026-004',
    title: 'Episodic Trailer Cut — Delivery Milestone',
    status: 'overdue',
    issueDate: '2026-09-10',
    dueDate: '2026-09-24',
    subtotal: 1900,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    total: 1900,
    totalAmount: 1900,
    amountPaid: 0,
    balanceDue: 1900,
    currency: 'USD',
    clientName: 'Atlas Media',
    projectName: 'Atlas Episodic Social Campaign',
    items: [
      {
        id: 'item-4',
        description: 'Teaser trailer edit & audio mixdown (overdue balance)',
        quantity: 1,
        unitPrice: 1900,
        amount: 1900,
      },
    ],
    createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-09-24T00:00:00Z',
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    projectName: 'Summer Campaign Film',
    title: 'Review sound mix with sound engineer',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-25',
    clientVisible: true,
    subtasks: [
      { id: 'st-1-1', title: 'Dolby 5.1 multichannel surround pass', completed: true },
      { id: 'st-1-2', title: 'Vocal EQ notch filter & dialogue clarity', completed: true },
    ],
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-25T00:00:00Z',
  },
  {
    id: 'task-2',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    projectName: 'Summer Campaign Film',
    title: 'Export 9:16 vertical cuts for Instagram & YouTube Shorts',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: '2026-10-02',
    clientVisible: true,
    dependsOnTaskId: 'task-1',
    dependsOnTaskTitle: 'Review sound mix with sound engineer',
    subtasks: [
      { id: 'st-2-1', title: 'Reframe action safe-zones for vertical 9:16', completed: true },
      { id: 'st-2-2', title: 'Render auto-captions and kinetic typography', completed: false },
      { id: 'st-2-3', title: 'Color match output & render ProRes 422 HQ', completed: false },
    ],
    createdAt: '2026-09-26T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: 'task-3',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    projectName: 'Brand Manifesto Video',
    title: 'Color grade scene 4 in DaVinci Resolve',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-10-01',
    clientVisible: true,
    subtasks: [
      { id: 'st-3-1', title: 'Color space transform ARRI LogC3 to Rec.709', completed: true },
      { id: 'st-3-2', title: 'Skin tone isolation & highlight roll-off', completed: false },
      { id: 'st-3-3', title: 'Film grain emulation pass (Kodak 2383)', completed: false },
    ],
    createdAt: '2026-09-28T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: 'task-4',
    organizationId: INITIAL_ORG.id,
    projectId: '2afd62bc-89ee-4e7e-a59b-ae571ca9a311',
    projectName: 'Website Redesign & Product Visuals',
    title: 'Complete responsive motion interactions in Figma',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-05',
    clientVisible: false,
    subtasks: [
      { id: 'st-4-1', title: 'Prototype spring curve navigation drawer', completed: false },
      { id: 'st-4-2', title: 'Deliver interaction specs to frontend engineer', completed: false },
    ],
    createdAt: '2026-09-29T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z',
  },
];

const INITIAL_DELIVERABLES: Deliverable[] = [
  {
    id: 'del-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    title: 'Hero Commercial 60s 4K Cut',
    description: 'Master color graded 4K ProRes 422 HQ export with 5.1 surround sound.',
    status: 'client_review',
    currentVersion: 'V2',
    versionsCount: 2,
    includedRevisions: 3,
    usedRevisions: 2,
    isScopeExceeded: false,
    createdAt: '2026-09-22T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z',
  },
  {
    id: 'del-2',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    title: 'Brand Manifesto Feature Master',
    description: 'Long-form 3 minute documentary cut with voiceover narrative.',
    status: 'client_review',
    currentVersion: 'V3',
    versionsCount: 3,
    includedRevisions: 2,
    usedRevisions: 3,
    isScopeExceeded: true,
    createdAt: '2026-09-18T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
];

const INITIAL_APPROVALS: Approval[] = [
  {
    id: 'appr-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    deliverableId: 'del-1',
    deliverableTitle: 'Hero Commercial 60s 4K Cut',
    versionNumber: '2',
    status: 'pending',
    requestedAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 'appr-2',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    deliverableId: 'del-2',
    deliverableTitle: 'Brand Manifesto Feature Master',
    versionNumber: '3',
    status: 'changes_requested',
    decidedBy: 'Karan Mehra (Creative Director)',
    feedbackComments: 'Please update title font to match the winter brand style guide.',
    requestedAt: '2026-09-25T14:00:00Z',
    decidedAt: '2026-09-28T16:30:00Z',
  },
];

const INITIAL_RETAINERS: Retainer[] = [
  {
    id: 'ret-1',
    organizationId: INITIAL_ORG.id,
    clientId: '11111111-1111-1111-1111-111111111111',
    title: 'Monthly Motion & Social Reel Retainer',
    monthlyAmount: 2500,
    monthlyRate: 2500,
    currency: 'USD',
    includedHours: 20,
    usedHours: 9.5,
    remainingHours: 10.5,
    startDate: '2026-09-01',
    renewalDate: '2026-10-01',
    status: 'active',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: 'ret-2',
    organizationId: INITIAL_ORG.id,
    clientId: '33333333-3333-3333-3333-333333333333',
    title: 'UI Design & Asset Maintenance Retainer',
    monthlyAmount: 1800,
    monthlyRate: 1800,
    currency: 'USD',
    includedHours: 15,
    usedHours: 6.0,
    remainingHours: 9.0,
    startDate: '2026-09-15',
    renewalDate: '2026-10-15',
    status: 'active',
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z',
  },
];

const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  {
    id: 'time-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    description: 'Color grading and HDR conformity pass',
    startTime: '2026-09-28T10:00:00Z',
    endTime: '2026-09-28T14:30:00Z',
    durationMinutes: 270,
    durationSeconds: 16200,
    hourlyRate: 125,
    billable: true,
    isBillable: true,
    revenueAmount: 562,
    isRunning: false,
    createdAt: '2026-09-28T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'time-2',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    description: 'Sound design, Foley recording & Dolby 5.1 mixing',
    startTime: '2026-09-29T11:00:00Z',
    endTime: '2026-09-29T16:00:00Z',
    durationMinutes: 300,
    durationSeconds: 18000,
    hourlyRate: 125,
    billable: true,
    isBillable: true,
    revenueAmount: 625,
    isRunning: false,
    createdAt: '2026-09-29T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z',
  },
  {
    id: 'time-3',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    description: 'Offline assembly cut and rough narrative pacing',
    startTime: '2026-09-30T09:00:00Z',
    endTime: '2026-09-30T13:00:00Z',
    durationMinutes: 240,
    durationSeconds: 14400,
    hourlyRate: 125,
    billable: true,
    isBillable: true,
    revenueAmount: 500,
    isRunning: false,
    createdAt: '2026-09-30T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    vendor: 'Artlist.io Music License',
    category: 'software',
    amount: 450,
    currency: 'USD',
    date: '2026-09-15',
    isReimbursable: true,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z',
  },
  {
    id: 'exp-2',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    vendor: 'Colorist External Monitor Rental',
    category: 'equipment',
    amount: 320,
    currency: 'USD',
    date: '2026-09-20',
    isReimbursable: true,
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
  },
  {
    id: 'exp-3',
    organizationId: INITIAL_ORG.id,
    projectId: '2afd62bc-89ee-4e7e-a59b-ae571ca9a311',
    vendor: 'Lottie Motion Animation Plugin',
    category: 'software',
    amount: 180,
    currency: 'USD',
    date: '2026-09-18',
    isReimbursable: false,
    createdAt: '2026-09-18T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
  },
];

const INITIAL_MILESTONES: ProjectMilestone[] = [
  {
    id: 'mil-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Pre-production & Storyboard Approval',
    description: 'Visual concept deck, moodboards, and location permits cleared.',
    dueDate: '2026-09-15',
    status: 'completed',
    paymentAmount: 2000,
    orderIndex: 1,
    createdAt: '2026-09-11T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z',
  },
  {
    id: 'mil-2',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Principal Photography & Rough Assembly',
    description: 'Mumbai Bandra coastal sunrise shoot and offline assembly review.',
    dueDate: '2026-09-25',
    status: 'completed',
    paymentAmount: 3000,
    orderIndex: 2,
    createdAt: '2026-09-16T00:00:00Z',
    updatedAt: '2026-09-25T00:00:00Z',
  },
  {
    id: 'mil-3',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Color Grade, Sound Design & Client Review',
    description: 'DaVinci Resolve HDR color master and 5.1 Dolby sound pass.',
    dueDate: '2026-10-02',
    status: 'in_progress',
    paymentAmount: 2000,
    orderIndex: 3,
    createdAt: '2026-09-26T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: 'mil-4',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Master Deliverables & Social Cuts Delivery',
    description: 'Final 4K ProRes 422HQ master + 3x 9:16 vertical cuts for Instagram/Shorts.',
    dueDate: '2026-10-06',
    status: 'pending',
    paymentAmount: 1500,
    orderIndex: 4,
    createdAt: '2026-09-26T00:00:00Z',
    updatedAt: '2026-09-26T00:00:00Z',
  },
  {
    id: 'mil-5',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    name: 'Ladakh Footage Ingest & Raw Selects',
    description: 'RED 8K raw rushes ingested and backed up to RAID storage.',
    dueDate: '2026-09-10',
    status: 'completed',
    paymentAmount: 4000,
    orderIndex: 1,
    createdAt: '2026-08-27T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z',
  },
  {
    id: 'mil-6',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    name: 'Director Cut & Narrative Pacing',
    description: 'Full 3-minute film with scratch voiceover and music temp track.',
    dueDate: '2026-09-20',
    status: 'completed',
    paymentAmount: 3500,
    orderIndex: 2,
    createdAt: '2026-09-11T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
  },
  {
    id: 'mil-7',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    name: 'Executive Review & Revision Pass 3',
    description: 'Client leadership review on title typography and ending shot adjustment.',
    dueDate: '2026-10-01',
    status: 'in_progress',
    paymentAmount: 2500,
    orderIndex: 3,
    createdAt: '2026-09-21T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: 'mil-8',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    name: 'Final UHD Master Export',
    description: 'Master ProRes archive and digital web packages.',
    dueDate: '2026-10-03',
    status: 'pending',
    paymentAmount: 2000,
    orderIndex: 4,
    createdAt: '2026-09-21T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z',
  },
];

const INITIAL_SCOPES: ProjectScope[] = [
  {
    id: 'scope-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    includedItems: [
      '60s 4K Hero Commercial Master (16:9)',
      '3x 15s Vertical Cutdowns (9:16) for Instagram Reels and TikTok',
      'Professional Color Grading in DaVinci Resolve Studio',
      'Original Foley & Sound Design with Commercial Music Rights',
      'Up to 2 rounds of consolidated revisions per cut',
    ],
    excludedItems: [
      'Broadcast TV licensing / clearing fees',
      'Raw camera footage delivery',
      'More than 2 revision rounds without a Change Order',
    ],
    limitations: 'Shooting was restricted to scheduled exterior daylight hours in Mumbai.',
    revisionAllowance: 2,
    deliveryAssumptions: 'Deliverables delivered digitally in Apple ProRes 422HQ and H.264 formats.',
    createdAt: '2026-09-11T00:00:00Z',
    updatedAt: '2026-09-11T00:00:00Z',
  },
  {
    id: 'scope-2',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    includedItems: [
      '3-minute Cinematic Brand Manifesto Film',
      'Custom Voiceover Talent Recording & Audio Mastering',
      'Original Ambient & Orchestral Soundtrack Integration',
      'High-resolution Still Frames for Press Kit',
    ],
    excludedItems: [
      'Cinema DCP print creation',
      'Translation/subtitling into non-English languages',
    ],
    limitations: 'High-altitude footage subject to weather contingency clause.',
    revisionAllowance: 2,
    deliveryAssumptions: 'Final assets distributed via cloud streaming portal with ProRes master archive.',
    createdAt: '2026-08-27T00:00:00Z',
    updatedAt: '2026-08-27T00:00:00Z',
  },
];

const INITIAL_SCOPE_CHANGES: ScopeChange[] = [
  {
    id: 'sc-1',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    title: 'Additional 30s Cinema Aspect Ratio Pre-roll Cut',
    requestDetails: 'Client requested an additional 30-second cut specifically formatted for cinema 2.39:1 aspect ratio with distinct title cards.',
    requestedBy: 'Karan Mehra (Creative Director)',
    requestedDate: '2026-09-28',
    estimatedHours: 8,
    additionalCost: 1000,
    currency: 'USD',
    status: 'quoted',
    createdAt: '2026-09-28T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'sc-2',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    title: 'Flagship Store Dolby Atmos Surround Sound Mix',
    requestDetails: 'Client requested an immersive 7.1.4 Dolby Atmos mix for the brand new Mumbai flagship store opening.',
    requestedBy: 'Nike Brand Marketing Team',
    requestedDate: '2026-09-24',
    estimatedHours: 6,
    additionalCost: 750,
    currency: 'USD',
    status: 'approved',
    approvedAt: '2026-09-25T11:00:00Z',
    createdAt: '2026-09-24T00:00:00Z',
    updatedAt: '2026-09-25T11:00:00Z',
  },
];

const INITIAL_ASSET_REQUESTS: AssetRequest[] = [
  {
    id: 'ar-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    projectName: 'Monsoon Running Campaign',
    clientId: '11111111-1111-1111-1111-111111111111',
    clientName: 'Nike India',
    title: 'Official 2026 Vector Logo & Brand Identity Guide',
    description: 'SVG/EPS vectors of the Nike brandmark and color codes for title overlays.',
    status: 'received',
    dueDate: '2026-09-12',
    fileName: 'Nike_Brand_Guidelines_2026.pdf',
    createdAt: '2026-09-11T00:00:00Z',
    updatedAt: '2026-09-12T00:00:00Z',
  },
  {
    id: 'ar-2',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    projectName: 'Monsoon Running Campaign',
    clientId: '11111111-1111-1111-1111-111111111111',
    clientName: 'Nike India',
    title: 'Signed Athlete Talent Releases',
    description: 'Signed model releases for lead sprinter and fitness trainer.',
    status: 'approved',
    dueDate: '2026-09-18',
    fileName: 'athlete_releases_signed.zip',
    createdAt: '2026-09-14T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
  },
  {
    id: 'ar-3',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    projectName: 'Brand Manifesto Film',
    clientId: '44444444-4444-4444-4444-444444444444',
    clientName: 'Northstar Luxury',
    title: 'Approved Voiceover Script & Pronunciation Guide',
    description: 'Final ratified voiceover copy with phonetics for Himalayan geography terms.',
    status: 'requested',
    dueDate: '2026-10-02',
    createdAt: '2026-09-28T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
];

const INITIAL_PROJECT_FILES: ProjectFile[] = [
  {
    id: 'pf-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Nike_Monsoon_Commercial_V1_ProRes422HQ.mov',
    folder: 'Deliverables & Exports',
    sizeBytes: 1980000000,
    mimeType: 'video/quicktime',
    r2Key: 'projects/027c41fa/Nike_Monsoon_Commercial_V1_ProRes422HQ.mov',
    publicUrl: '/api/files/download/projects/027c41fa/Nike_Monsoon_Commercial_V1_ProRes422HQ.mov',
    uploadedAt: '2026-09-24T14:30:00Z',
    uploadedBy: 'Nimish Prabhu',
  },
  {
    id: 'pf-2',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Nike_India_Vector_Brandmark_2026.svg',
    folder: 'Brand Assets & Vector Logos',
    sizeBytes: 245000,
    mimeType: 'image/svg+xml',
    r2Key: 'projects/027c41fa/Nike_India_Vector_Brandmark_2026.svg',
    publicUrl: '/api/files/download/projects/027c41fa/Nike_India_Vector_Brandmark_2026.svg',
    uploadedAt: '2026-09-12T10:15:00Z',
    uploadedBy: 'Nike Brand Team',
  },
  {
    id: 'pf-3',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Bandra_Shoot_RAW_Footage_Reel_01.braw',
    folder: 'Media & Raw Footage',
    sizeBytes: 4290000000,
    mimeType: 'video/x-braw',
    r2Key: 'projects/027c41fa/Bandra_Shoot_RAW_Footage_Reel_01.braw',
    publicUrl: '/api/files/download/projects/027c41fa/Bandra_Shoot_RAW_Footage_Reel_01.braw',
    uploadedAt: '2026-09-18T18:00:00Z',
    uploadedBy: 'Arjun K. (DP)',
  },
  {
    id: 'pf-4',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Sound_Design_Stems_Multichannel_5.1.wav',
    folder: 'Media & Raw Footage',
    sizeBytes: 388000000,
    mimeType: 'audio/wav',
    r2Key: 'projects/027c41fa/Sound_Design_Stems_Multichannel_5.1.wav',
    publicUrl: '/api/files/download/projects/027c41fa/Sound_Design_Stems_Multichannel_5.1.wav',
    uploadedAt: '2026-09-22T11:20:00Z',
    uploadedBy: 'Priya (Sound)',
  },
  {
    id: 'pf-5',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Signed_Talent_Release_Kavya_Sprinter.pdf',
    folder: 'Legal & Contracts',
    sizeBytes: 1240000,
    mimeType: 'application/pdf',
    r2Key: 'projects/027c41fa/Signed_Talent_Release_Kavya_Sprinter.pdf',
    publicUrl: '/api/files/download/projects/027c41fa/Signed_Talent_Release_Kavya_Sprinter.pdf',
    uploadedAt: '2026-09-18T08:30:00Z',
    uploadedBy: 'Production Coordinator',
  },
  {
    id: 'pf-6',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    name: 'Official_Campaign_Master_Agreement_Executed.pdf',
    folder: 'Legal & Contracts',
    sizeBytes: 860000,
    mimeType: 'application/pdf',
    r2Key: 'projects/027c41fa/Official_Campaign_Master_Agreement_Executed.pdf',
    publicUrl: '/api/files/download/projects/027c41fa/Official_Campaign_Master_Agreement_Executed.pdf',
    uploadedAt: '2026-09-10T16:45:00Z',
    uploadedBy: 'Legal Team',
  },
];

const INITIAL_CALL_SHEETS: ProductionCallSheet[] = [
  {
    id: 'cs-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    title: 'Nike Campaign - Day 1 Bandra Coastal Sunrise Shoot',
    shootDate: '2026-09-18',
    location: 'Bandra Fort Amphitheatre, Mumbai',
    callTimes: 'Crew Call: 05:30 AM | Talent Call: 06:15 AM | First Light: 06:22 AM',
    crew: 'Director: Nimish | DP: Arjun K. | Gaffer: Rohan | Sound: Priya | AC: Vikram',
    talent: 'Lead Sprinter: Kavya S. | Trainer: Dev R.',
    equipment: 'RED V-Raptor 8K, Cooke Panchro Prime Set, Steadicam Zephyr, Litepanels Gemini',
    notes: 'Weather: Clear morning with high humidity. Hydration station on site. Ingest station stationed at Base Camp van.',
    emergencyContact: '+91 98200 11223 (Production Coordinator)',
    createdAt: '2026-09-14T00:00:00Z',
  },
];

const INITIAL_SHOTS: ProductionShot[] = [
  {
    id: 'shot-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    shotNumber: '1A',
    description: 'Extreme wide sunrise silhouette running along rocky sea coast',
    location: 'Bandra Fort Point',
    framing: 'Extreme Wide',
    movement: 'Steadicam tracking forward',
    lens: '25mm T2.1',
    talent: 'Kavya',
    status: 'shot',
    createdAt: '2026-09-16T00:00:00Z',
  },
  {
    id: 'shot-2',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    shotNumber: '2A',
    description: 'Macro detail of shoe laces tying and rubber outsole tread gripping rock',
    location: 'Amphitheatre Steps',
    framing: 'Macro Close-Up',
    movement: 'Static with slow rack focus',
    lens: '65mm Macro',
    talent: 'Kavya',
    status: 'shot',
    createdAt: '2026-09-16T00:00:00Z',
  },
  {
    id: 'shot-3',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    shotNumber: '3B',
    description: 'High-speed sprint pass at 120fps with dynamic whip pan follow',
    location: 'Sea Promenade',
    framing: 'Medium Profile',
    movement: 'Whip Pan 120fps',
    lens: '35mm T2.1',
    talent: 'Kavya',
    status: 'shot',
    createdAt: '2026-09-16T00:00:00Z',
  },
  {
    id: 'shot-4',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    shotNumber: '4A',
    description: 'Product hero spin on turntable with sweat bead water droplet impact',
    location: 'Base Camp Studio Insert',
    framing: 'Close-Up',
    movement: 'Motorized Turntable',
    lens: '85mm T2.1',
    status: 'planned',
    createdAt: '2026-09-16T00:00:00Z',
  },
];

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'eq-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    item: 'RED V-Raptor 8K VV Cinema Camera',
    category: 'Camera',
    quantity: 1,
    status: 'packed',
    notes: 'Equipped with 2TB CFexpress cards and 4x Micro-V batteries',
    createdAt: '2026-09-16T00:00:00Z',
  },
  {
    id: 'eq-2',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    item: 'Cooke Panchro/i Classic Prime Set (25/32/50/75mm)',
    category: 'Lenses',
    quantity: 4,
    status: 'packed',
    notes: 'Flight case #2',
    createdAt: '2026-09-16T00:00:00Z',
  },
  {
    id: 'eq-3',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    item: 'Steadicam Zephyr Stabilizer Rig with Arm & Vest',
    category: 'Support',
    quantity: 1,
    status: 'packed',
    notes: 'Calibrated for RED V-Raptor payload',
    createdAt: '2026-09-16T00:00:00Z',
  },
  {
    id: 'eq-4',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    item: 'Aputure 600d Pro LED + Light Dome 150 Diffuser',
    category: 'Lighting',
    quantity: 2,
    status: 'packed',
    notes: 'With C-stands and sandbags in grip truck',
    createdAt: '2026-09-16T00:00:00Z',
  },
  {
    id: 'eq-5',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    item: 'Tentacle Sync E mkII Timecode Transceivers',
    category: 'Audio',
    quantity: 3,
    status: 'needed',
    notes: 'Batteries charging overnight at studio',
    createdAt: '2026-09-16T00:00:00Z',
  },
  {
    id: 'eq-6',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    item: 'Teradek Bolt 4K LT Wireless Video Kit',
    category: 'Monitoring',
    quantity: 1,
    status: 'packed',
    notes: 'Director handheld monitor paired',
    createdAt: '2026-09-16T00:00:00Z',
  },
];

const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-study-1',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    projectName: 'Monsoon Running Campaign',
    clientId: '11111111-1111-1111-1111-111111111111',
    clientName: 'Nike India',
    title: 'Nike Monsoon Motion: Generating 3.4M Organic Views via High-Paced Commercial Storytelling',
    challenge: 'Nike required an authentic, cinematic commercial showcasing their water-resistant trail running gear during severe monsoon conditions without synthetic studio effects.',
    solution: 'Engineered a rapid-response dawn production shoot in coastal Mumbai utilizing 8K 120fps cinematography, bespoke organic sound design, and HDR mobile-first color mastering.',
    result: 'Exceeded brand engagement benchmarks with 3.4M organic views in 72 hours, a 42% share rate on Instagram, and 24% increase in footwear pre-orders.',
    services: ['Commercial Directing', 'Cinematography', 'Color Grading', 'Sound Design'],
    testimonialText: 'Nimish and his team delivered unmatched aesthetic quality and handled strict turnaround times with absolute professionalism. The output set a new benchmark for our regional campaigns.',
    testimonialAuthor: 'Karan Mehra, Creative Director @ Nike',
    published: true,
    createdAt: '2026-09-28T00:00:00Z',
  },
];

const INITIAL_BUSINESS_GOAL: BusinessGoal = {
  id: 'goal-1',
  organizationId: INITIAL_ORG.id,
  period: '2026-Q4',
  monthlyRevenueTarget: 15000,
  targetClients: 5,
  targetHours: 80,
  createdAt: '2026-09-01T00:00:00Z',
};

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    organizationId: INITIAL_ORG.id,
    proposalNumber: 'PROP-2026-001',
    clientId: '11111111-1111-1111-1111-111111111111',
    title: 'Q4 Global Brand Film Proposal',
    status: 'sent',
    subtotal: 12000,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    totalAmount: 12000,
    total: 12000,
    currency: 'USD',
    validUntil: '2026-10-15',
    clientName: 'Nike India',
    items: [{ id: 'pi-1', description: 'Direction & Post-Production', quantity: 1, unitPrice: 12000, amount: 12000 }],
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
  },
];

const INITIAL_QUOTES: Quote[] = [
  {
    id: 'quote-1',
    organizationId: INITIAL_ORG.id,
    clientId: '33333333-3333-3333-3333-333333333333',
    quoteNumber: 'Q-2026-01',
    title: 'Motion Assets Package Quote',
    status: 'accepted',
    subtotal: 4500,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 4500,
    total: 4500,
    currency: 'USD',
    validUntil: '2026-10-10',
    clientName: 'Acme Corp',
    items: [{ id: 'qi-1', description: 'Motion Design Package', quantity: 1, unitPrice: 4500, amount: 4500 }],
    createdAt: '2026-09-18T00:00:00Z',
    updatedAt: '2026-09-22T00:00:00Z',
  },
];

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'cont-1',
    organizationId: INITIAL_ORG.id,
    clientId: '11111111-1111-1111-1111-111111111111',
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    title: 'Master Commercial Production Agreement',
    status: 'signed',
    startDate: '2026-09-11',
    terms: 'Standard terms.',
    content: 'Standard Master Services Agreement covering IP assignment upon final invoice payment.',
    clientName: 'Nike India',
    signedAt: '2026-09-11T12:00:00Z',
    signerName: 'Karan Mehra',
    createdAt: '2026-09-11T00:00:00Z',
    updatedAt: '2026-09-11T12:00:00Z',
  },
];

// Helper for generating client-side unique IDs
function makeId(prefix = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

class MockStorage {
  private user: User = INITIAL_USER;
  private org: Organization = INITIAL_ORG;
  private clients: Client[] = INITIAL_CLIENTS;
  private projects: Project[] = INITIAL_PROJECTS;
  private leads: Lead[] = INITIAL_LEADS;
  private invoices: Invoice[] = INITIAL_INVOICES;
  private tasks: Task[] = INITIAL_TASKS;
  private deliverables: Deliverable[] = INITIAL_DELIVERABLES;
  private approvals: Approval[] = INITIAL_APPROVALS;
  private retainers: Retainer[] = INITIAL_RETAINERS;
  private timeEntries: TimeEntry[] = INITIAL_TIME_ENTRIES;
  private expenses: Expense[] = INITIAL_EXPENSES;
  private proposals: Proposal[] = INITIAL_PROPOSALS;
  private quotes: Quote[] = INITIAL_QUOTES;
  private contracts: Contract[] = INITIAL_CONTRACTS;
  private milestones: ProjectMilestone[] = INITIAL_MILESTONES;
  private scopes: ProjectScope[] = INITIAL_SCOPES;
  private scopeChanges: ScopeChange[] = INITIAL_SCOPE_CHANGES;
  private assetRequests: AssetRequest[] = INITIAL_ASSET_REQUESTS;
  private projectFiles: ProjectFile[] = INITIAL_PROJECT_FILES;
  private callSheets: ProductionCallSheet[] = INITIAL_CALL_SHEETS;
  private shots: ProductionShot[] = INITIAL_SHOTS;
  private equipment: EquipmentItem[] = INITIAL_EQUIPMENT;
  private caseStudies: CaseStudy[] = INITIAL_CASE_STUDIES;
  private businessGoals: BusinessGoal[] = [INITIAL_BUSINESS_GOAL];
  private payments: Payment[] = [
    {
      id: 'pay-1',
      organizationId: INITIAL_ORG.id,
      invoiceId: 'inv-1',
      clientId: '11111111-1111-1111-1111-111111111111',
      amount: 4800,
      currency: 'USD',
      paymentMethod: 'bank_transfer',
      paymentDate: '2026-09-20',
      reference: 'WIRE-US-99182',
      createdAt: '2026-09-20T00:00:00Z',
    },
    {
      id: 'pay-2',
      organizationId: INITIAL_ORG.id,
      invoiceId: 'inv-2',
      clientId: '44444444-4444-4444-4444-444444444444',
      amount: 2500,
      currency: 'USD',
      paymentMethod: 'stripe',
      paymentDate: '2026-09-28',
      reference: 'STRIPE-CH-3321',
      createdAt: '2026-09-28T00:00:00Z',
    },
  ];
  private clientContacts: ClientContact[] = [...INITIAL_CLIENT_CONTACTS];
  private activeTimer: TimeEntry | null = null;
  private isDemoMode: boolean = true;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.isDemoMode !== undefined) this.isDemoMode = data.isDemoMode;
        if (data.user) this.user = data.user;
        if (data.org) this.org = data.org;
        if (data.clients) this.clients = data.clients;
        if (data.clientContacts) this.clientContacts = data.clientContacts;
        if (data.projects) this.projects = data.projects;
        if (data.leads) this.leads = data.leads;
        if (data.invoices) this.invoices = data.invoices;
        if (data.tasks) this.tasks = data.tasks;
        if (data.deliverables) this.deliverables = data.deliverables;
        if (data.approvals) this.approvals = data.approvals;
        if (data.retainers) this.retainers = data.retainers;
        if (data.timeEntries) this.timeEntries = data.timeEntries;
        if (data.expenses) this.expenses = data.expenses;
        if (data.proposals) this.proposals = data.proposals;
        if (data.quotes) this.quotes = data.quotes;
        if (data.contracts) this.contracts = data.contracts;
        if (data.payments) this.payments = data.payments;
        if (data.milestones) this.milestones = data.milestones;
        if (data.scopes) this.scopes = data.scopes;
        if (data.scopeChanges) this.scopeChanges = data.scopeChanges;
        if (data.assetRequests) this.assetRequests = data.assetRequests;
        if (data.projectFiles) this.projectFiles = data.projectFiles;
        if (data.callSheets) this.callSheets = data.callSheets;
        if (data.shots) this.shots = data.shots;
        if (data.equipment) this.equipment = data.equipment;
        if (data.caseStudies) this.caseStudies = data.caseStudies;
        if (data.businessGoals) this.businessGoals = data.businessGoals;
      }

      // Check freelanceros_current_user if available
      const storedUser = localStorage.getItem('freelanceros_current_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.email) {
            this.user = {
              ...this.user,
              ...parsedUser,
            };
          }
        } catch {}
      }

      if (this.user?.email) {
        this.org.plan = resolveUserTier(this.user.email);
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        isDemoMode: this.isDemoMode,
        user: this.user,
        org: this.org,
        clients: this.clients,
        clientContacts: this.clientContacts,
        projects: this.projects,
        leads: this.leads,
        invoices: this.invoices,
        tasks: this.tasks,
        deliverables: this.deliverables,
        approvals: this.approvals,
        retainers: this.retainers,
        timeEntries: this.timeEntries,
        expenses: this.expenses,
        proposals: this.proposals,
        quotes: this.quotes,
        contracts: this.contracts,
        payments: this.payments,
        milestones: this.milestones,
        scopes: this.scopes,
        scopeChanges: this.scopeChanges,
        assetRequests: this.assetRequests,
        projectFiles: this.projectFiles,
        callSheets: this.callSheets,
        shots: this.shots,
        equipment: this.equipment,
        caseStudies: this.caseStudies,
        businessGoals: this.businessGoals,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  public getDemoStatus() {
    return {
      isDemo: this.isDemoMode,
      workspaceName: this.org.name,
      clientCount: this.clients.length,
      projectCount: this.projects.length,
    };
  }

  public exitDemo() {
    this.isDemoMode = false;
    this.clients = [];
    this.clientContacts = [];
    this.projects = [];
    this.leads = [];
    this.invoices = [];
    this.tasks = [];
    this.deliverables = [];
    this.approvals = [];
    this.retainers = [];
    this.timeEntries = [];
    this.expenses = [];
    this.proposals = [];
    this.quotes = [];
    this.contracts = [];
    this.payments = [];
    this.milestones = [];
    this.scopes = [];
    this.scopeChanges = [];
    this.assetRequests = [];
    this.projectFiles = [];
    this.callSheets = [];
    this.shots = [];
    this.equipment = [];
    this.caseStudies = [];
    this.businessGoals = [];
    this.activeTimer = null;
    this.org = {
      ...this.org,
      name: `${this.user.firstName || 'My'} Studio`,
    };
    this.saveToStorage();
    return { message: 'Exited demo mode. Workspace cleared.', isDemo: false };
  }

  public enterDemo() {
    this.isDemoMode = true;
    this.user = INITIAL_USER;
    this.org = INITIAL_ORG;
    this.clients = JSON.parse(JSON.stringify(INITIAL_CLIENTS));
    this.clientContacts = JSON.parse(JSON.stringify(INITIAL_CLIENT_CONTACTS));
    this.projects = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
    this.leads = JSON.parse(JSON.stringify(INITIAL_LEADS));
    this.invoices = JSON.parse(JSON.stringify(INITIAL_INVOICES));
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.deliverables = JSON.parse(JSON.stringify(INITIAL_DELIVERABLES));
    this.approvals = JSON.parse(JSON.stringify(INITIAL_APPROVALS));
    this.retainers = JSON.parse(JSON.stringify(INITIAL_RETAINERS));
    this.timeEntries = JSON.parse(JSON.stringify(INITIAL_TIME_ENTRIES));
    this.expenses = JSON.parse(JSON.stringify(INITIAL_EXPENSES));
    this.proposals = JSON.parse(JSON.stringify(INITIAL_PROPOSALS));
    this.quotes = JSON.parse(JSON.stringify(INITIAL_QUOTES));
    this.contracts = JSON.parse(JSON.stringify(INITIAL_CONTRACTS));
    this.milestones = JSON.parse(JSON.stringify(INITIAL_MILESTONES));
    this.scopes = JSON.parse(JSON.stringify(INITIAL_SCOPES));
    this.scopeChanges = JSON.parse(JSON.stringify(INITIAL_SCOPE_CHANGES));
    this.assetRequests = JSON.parse(JSON.stringify(INITIAL_ASSET_REQUESTS));
    this.projectFiles = JSON.parse(JSON.stringify(INITIAL_PROJECT_FILES));
    this.callSheets = JSON.parse(JSON.stringify(INITIAL_CALL_SHEETS));
    this.shots = JSON.parse(JSON.stringify(INITIAL_SHOTS));
    this.equipment = JSON.parse(JSON.stringify(INITIAL_EQUIPMENT));
    this.caseStudies = JSON.parse(JSON.stringify(INITIAL_CASE_STUDIES));
    this.businessGoals = [JSON.parse(JSON.stringify(INITIAL_BUSINESS_GOAL))];
    this.payments = [
      {
        id: 'pay-1',
        organizationId: INITIAL_ORG.id,
        invoiceId: 'inv-1',
        clientId: '11111111-1111-1111-1111-111111111111',
        amount: 4800,
        currency: 'USD',
        paymentMethod: 'bank_transfer',
        paymentDate: '2026-09-20',
        reference: 'WIRE-US-99182',
        createdAt: '2026-09-20T00:00:00Z',
      },
      {
        id: 'pay-2',
        organizationId: INITIAL_ORG.id,
        invoiceId: 'inv-2',
        clientId: '44444444-4444-4444-4444-444444444444',
        amount: 2500,
        currency: 'USD',
        paymentMethod: 'stripe',
        paymentDate: '2026-09-28',
        reference: 'STRIPE-CH-3321',
        createdAt: '2026-09-28T00:00:00Z',
      },
    ];
    this.activeTimer = null;
    this.saveToStorage();
    return { message: 'Realistic demo workspace loaded.', isDemo: true, workspace: this.org.name };
  }

  public resetDemo() {
    return this.enterDemo();
  }

  // Auth & Org
  getMe() {
    this.org.plan = resolveUserTier(this.user.email);
    return { user: this.user, organization: this.org };
  }

  login(email: string, _password?: string) {
    const cleanEmail = (email || 'nimish@freelanceros.com').toLowerCase().trim();
    if (cleanEmail !== this.user.email) {
      const parts = cleanEmail.split('@')[0].split(/[._-]/);
      const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Creator';
      const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Pro';
      this.user = {
        ...this.user,
        id: makeId('usr'),
        email: cleanEmail,
        firstName,
        lastName,
        updatedAt: new Date().toISOString(),
      };
      this.org = {
        ...this.org,
        name: `${firstName}'s Studio`,
        plan: resolveUserTier(cleanEmail),
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
    } else {
      this.org.plan = resolveUserTier(cleanEmail);
    }
    const token = `bearer-token-${this.user.id}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('freelanceros_token', token);
        localStorage.setItem('freelanceros_auth_token', token);
        localStorage.setItem('freelanceros_current_user', JSON.stringify(this.user));
      } catch {}
    }
    return { token, user: this.user, organization: this.org };
  }

  signup(data: { email: string; password?: string; fullName?: string; studioName?: string; freelancerType?: string }) {
    const cleanEmail = (data.email || 'creator@freelanceros.io').toLowerCase().trim();
    const nameParts = (data.fullName || 'Creator Pro').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Creator';
    const lastName = nameParts.slice(1).join(' ') || 'Studio';

    this.user = {
      id: makeId('usr'),
      email: cleanEmail,
      firstName,
      lastName,
      avatarUrl: null,
      role: 'owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const studioName = data.studioName || `${firstName}'s Studio`;
    this.org = {
      ...this.org,
      id: makeId('org'),
      name: studioName,
      slug: studioName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 899 + 100),
      plan: resolveUserTier(cleanEmail),
      freelancerType: data.freelancerType || 'creative',
      updatedAt: new Date().toISOString(),
    };

    // Clean workspace isolation: fresh user starts with 0 records
    this.isDemoMode = false;
    this.clients = [];
    this.projects = [];
    this.leads = [];
    this.invoices = [];
    this.tasks = [];
    this.deliverables = [];
    this.approvals = [];
    this.retainers = [];
    this.timeEntries = [];
    this.expenses = [];
    this.proposals = [];
    this.quotes = [];
    this.contracts = [];
    this.payments = [];
    this.activeTimer = null;

    this.saveToStorage();
    const token = `bearer-token-${this.user.id}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('freelanceros_token', token);
        localStorage.setItem('freelanceros_auth_token', token);
        localStorage.setItem('freelanceros_current_user', JSON.stringify(this.user));
      } catch {}
    }
    return { token, user: this.user, organization: this.org };
  }

  loginWithGoogle(data: { credential?: string; email?: string; name?: string; picture?: string }) {
    let email = (data.email || '').toLowerCase().trim();
    let name = (data.name || '').trim();
    let picture = data.picture || null;

    if (data.credential && !email) {
      try {
        const parts = data.credential.split('.');
        if (parts.length >= 2) {
          let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) {
            base64 += '=';
          }
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const jsonStr = new TextDecoder().decode(bytes);
          const payload = JSON.parse(jsonStr);
          if (payload.email) email = payload.email.toLowerCase().trim();
          if (payload.name && !name) name = payload.name;
          if (payload.picture && !picture) picture = payload.picture;
        }
      } catch {
        // fallback to provided values
      }
    }

    if (!email) {
      email = 'creator@gmail.com';
    }

    if (!name) {
      const parts = email.split('@')[0].split(/[._-]/);
      name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Google';
    const lastName = nameParts.slice(1).join(' ') || 'Creator';

    this.user = {
      ...this.user,
      id: makeId('usr-g'),
      email: email.toLowerCase().trim(),
      firstName,
      lastName,
      avatarUrl: picture,
      updatedAt: new Date().toISOString(),
    };

    this.org = {
      ...this.org,
      name: `${firstName}'s Creative Studio`,
      plan: resolveUserTier(email),
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    const token = `bearer-token-${this.user.id}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('freelanceros_token', token);
        localStorage.setItem('freelanceros_auth_token', token);
        localStorage.setItem('freelanceros_current_user', JSON.stringify(this.user));
      } catch {}
    }
    return { token, user: this.user, organization: this.org };
  }

  logout() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('freelanceros_token');
        localStorage.removeItem('freelanceros_auth_token');
        localStorage.removeItem('freelanceros_current_user');
      } catch {}
    }
    return { message: 'Logged out successfully' };
  }

  getCurrentOrg() {
    this.org.plan = resolveUserTier(this.user.email);
    return this.org;
  }

  updateOrg(data: Partial<Organization>) {
    const safeData = { ...data };
    delete (safeData as any).plan;
    this.org = {
      ...this.org,
      ...safeData,
      plan: resolveUserTier(this.user.email),
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.org;
  }

  onboard(data: any) {
    this.org.name = data.workspaceName || this.org.name;
    this.org.currency = data.currency || this.org.currency;
    this.org.hourlyRate = Number(data.hourlyRate || this.org.hourlyRate);
    this.org.freelancerType = data.freelancerType || this.org.freelancerType;

    const newClient: Client = {
      id: makeId('client'),
      organizationId: this.org.id,
      name: data.firstClientName || 'Primary Client',
      email: data.firstClientEmail || 'contact@client.com',
      currency: this.org.currency,
      status: 'active',
      activeProjectsCount: 1,
      totalRevenue: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.clients.unshift(newClient);

    const newProject: Project = {
      id: makeId('prj'),
      organizationId: this.org.id,
      clientId: newClient.id,
      name: data.firstProjectName || 'Project One',
      code: `PRJ-${Math.floor(Math.random() * 899 + 100)}`,
      status: 'active',
      health: 'healthy',
      startDate: new Date().toISOString().split('T')[0],
      budget: Number(data.firstProjectBudget || 100000),
      currency: this.org.currency,
      totalHoursTracked: 0,
      totalInvoiced: 0,
      totalPaid: 0,
      totalExpenses: 0,
      profit: 0,
      effectiveHourlyRate: 0,
      includedRevisions: Number(data.maxIncludedRevisions || 2),
      completedRevisions: 0,
      progressPercent: 10,
      clientName: newClient.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.unshift(newProject);

    this.saveToStorage();
    return { organization: this.org, client: newClient, project: newProject };
  }

  // Dashboard
  getDashboardSummary(): DashboardData {
    const totalCollected = this.invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const outstanding = this.invoices
      .filter((inv) => inv.status !== 'paid' && inv.status !== 'draft' && inv.status !== 'cancelled')
      .reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
    const overdue = this.invoices
      .filter((inv) => inv.status === 'overdue' || (inv.dueDate && inv.dueDate < '2026-10-01' && (inv.balanceDue || 0) > 0))
      .reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
    const totalHours = Math.round(
      this.timeEntries.reduce((acc, te) => acc + ((te.durationMinutes || 0) / 60), 0) * 10
    ) / 10;
    const pendingApprovals = this.approvals.filter((a) => a.status === 'pending').length;
    const projectedIncoming = this.leads
      .filter((l) => l.stage === 'qualified' || l.stage === 'proposal' || l.stage === 'negotiation')
      .reduce((acc, l) => acc + Math.round((l.value * (l.probabilityPercent || 50)) / 100), 0);

    // Build dynamic Needs Attention queue
    const attentionItems: any[] = [];
    const today = '2026-10-01';

    // 1. HIGH PRIORITY: Overdue Invoices
    this.invoices
      .filter((inv) => inv.status === 'overdue' || (inv.dueDate && inv.dueDate < today && (inv.balanceDue || 0) > 0))
      .forEach((inv) => {
        attentionItems.push({
          id: `att-inv-${inv.id}`,
          title: `Invoice overdue: ${inv.clientName || 'Client'} ($${(inv.balanceDue || 0).toLocaleString()})`,
          description: `${inv.invoiceNumber} was due on ${inv.dueDate}. Balance $${(inv.balanceDue || 0).toLocaleString()} pending.`,
          severity: 'critical',
          urgency: 'high',
          category: 'invoice',
          actionUrl: '/invoices',
          actionText: 'View Invoice',
          dueDate: inv.dueDate,
          amount: inv.balanceDue,
        });
      });

    // 2. HIGH PRIORITY: Blocked Projects
    this.projects
      .filter((p) => p.health === 'blocked')
      .forEach((p) => {
        attentionItems.push({
          id: `att-prj-blk-${p.id}`,
          title: `Project blocked: ${p.name}`,
          description: p.healthReason || 'Requires client input or raw media to continue.',
          severity: 'critical',
          urgency: 'high',
          category: 'project',
          actionUrl: `/projects/${p.id}`,
          actionText: 'Open Workspace',
          dueDate: p.deadline || today,
        });
      });

    // 3. MEDIUM PRIORITY: Client Approval Pending
    this.approvals
      .filter((a) => a.status === 'pending')
      .forEach((a) => {
        attentionItems.push({
          id: `att-appr-${a.id}`,
          title: `Client approval pending: ${a.deliverableTitle}`,
          description: `Version ${a.versionNumber} awaiting formal client sign-off.`,
          severity: 'warning',
          urgency: 'medium',
          category: 'approval',
          actionUrl: '/deliverables',
          actionText: 'Review Sign-off',
          dueDate: a.requestedAt?.split('T')[0] || today,
        });
      });

    // 4. MEDIUM PRIORITY: Projects At Risk or Deadline Near
    this.projects
      .filter((p) => p.status === 'active' && p.health === 'at_risk')
      .forEach((p) => {
        attentionItems.push({
          id: `att-prj-risk-${p.id}`,
          title: `Project deadline approaching: ${p.name}`,
          description: `${p.clientName} delivery on ${p.deadline}. ${p.healthReason || `${p.progressPercent}% complete.`}`,
          severity: 'warning',
          urgency: 'medium',
          category: 'project',
          actionUrl: `/projects/${p.id}`,
          actionText: 'Open Project',
          dueDate: p.deadline,
        });
      });

    // 5. MEDIUM PRIORITY: Revision Limits Reached / Exceeded
    this.deliverables
      .filter((d) => d.isScopeExceeded || (d.usedRevisions >= d.includedRevisions))
      .forEach((d) => {
        const prj = this.projects.find((p) => p.id === d.projectId);
        attentionItems.push({
          id: `att-del-scope-${d.id}`,
          title: `Revision limit reached: ${d.title}`,
          description: `${d.usedRevisions} of ${d.includedRevisions} included revisions used in ${prj?.name || 'Project'}.`,
          severity: 'warning',
          urgency: 'medium',
          category: 'deliverable',
          actionUrl: `/projects/${d.projectId}`,
          actionText: 'Manage Revisions',
          dueDate: today,
        });
      });

    // 6. LOW PRIORITY: Proposals Expiring Soon
    this.leads
      .filter((l) => l.stage === 'proposal' || l.stage === 'negotiation')
      .forEach((l) => {
        attentionItems.push({
          id: `att-lead-${l.id}`,
          title: `Proposal follow-up: ${l.title}`,
          description: `${l.clientName} (${l.company}) — expected decision by ${l.expectedCloseDate}.`,
          severity: 'info',
          urgency: 'low',
          category: 'proposal',
          actionUrl: '/leads',
          actionText: 'View Pipeline',
          dueDate: l.expectedCloseDate,
        });
      });

    // 7. Overdue Tasks
    this.tasks
      .filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < today)
      .slice(0, 3)
      .forEach((t) => {
        attentionItems.push({
          id: `att-task-${t.id}`,
          title: `Overdue task: ${t.title}`,
          description: `Due on ${t.dueDate}. Requires immediate attention.`,
          severity: 'warning',
          urgency: 'high',
          category: 'task',
          actionUrl: `/tasks`,
          actionText: 'View Task',
          dueDate: t.dueDate,
        });
      });

    // 8. Missing Client Assets
    this.assetRequests
      .filter((ar) => ar.status === 'requested')
      .slice(0, 3)
      .forEach((ar) => {
        attentionItems.push({
          id: `att-asset-${ar.id}`,
          title: `Missing client asset: ${ar.title}`,
          description: `Awaiting media upload from client to proceed with production.`,
          severity: 'warning',
          urgency: 'medium',
          category: 'asset',
          actionUrl: `/projects/${ar.projectId}`,
          actionText: 'Check Asset',
          dueDate: ar.dueDate || today,
        });
      });

    // 9. Retainer Usage Cap
    this.retainers
      .filter((r) => r.status === 'active' && r.usedHours >= r.includedHours)
      .forEach((r) => {
        attentionItems.push({
          id: `att-ret-${r.id}`,
          title: `Retainer limit reached: ${r.title || 'Client Retainer'}`,
          description: `${r.clientName} reached ${r.usedHours}/${r.includedHours} included hours. Extra hours billable at surge rate.`,
          severity: 'warning',
          urgency: 'medium',
          category: 'retainer',
          actionUrl: `/retainers`,
          actionText: 'Review Retainer',
          dueDate: today,
        });
      });

    // 10. Unbilled Work Detection
    const unbilledEntries = this.timeEntries.filter((t) => t.isBillable && !t.isInvoiced);
    const unbilledMinutes = unbilledEntries.reduce((s, t) => s + (t.durationMinutes || 0), 0);
    const unbilledHours = Math.round((unbilledMinutes / 60) * 10) / 10;
    if (unbilledHours >= 5) {
      attentionItems.push({
        id: `att-unbilled-time`,
        title: `Unbilled work detected (${unbilledHours} hrs)`,
        description: `${unbilledEntries.length} logged sessions ready to be invoiced across active projects.`,
        severity: 'info',
        urgency: 'medium',
        category: 'time',
        actionUrl: `/time`,
        actionText: 'Invoice Hours',
        dueDate: today,
      });
    }

    // Sort by urgency: high (critical) -> medium (warning) -> low (info)
    const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
    attentionItems.sort((a, b) => (priorityWeight[b.urgency] || 0) - (priorityWeight[a.urgency] || 0));

    // Upcoming dates
    const upcomingDates: import('@freelanceros/types').DashboardData['upcomingDates'] = [
      {
        id: 'up-1',
        title: 'Brand Manifesto Film Delivery',
        date: '2026-10-03',
        type: 'deadline',
        link: '/projects/2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
      },
      {
        id: 'up-2',
        title: 'Summer Campaign Final Cuts',
        date: '2026-10-06',
        type: 'deadline',
        link: '/projects/027c41fa-8f90-4bac-989d-b5f80652ab0c',
      },
      {
        id: 'up-3',
        title: 'Atlas Media Social Campaign Milestone',
        date: '2026-10-08',
        type: 'deadline',
        link: '/projects/88888888-8888-8888-8888-888888888888',
      },
      {
        id: 'up-4',
        title: 'Vogue India Proposal Decision',
        date: '2026-10-10',
        type: 'proposal_expire',
        link: '/leads',
      },
    ];

    // Recent activity
    const recentActivity = [
      {
        id: 'act-1',
        organizationId: this.org.id,
        entityType: 'approval',
        entityId: 'appr-1',
        action: 'approval_requested',
        description: 'Client review requested for Nike 60s Hero 4K Cut (V2)',
        createdAt: '2026-09-29T10:00:00Z',
      },
      {
        id: 'act-2',
        organizationId: this.org.id,
        entityType: 'payment',
        entityId: 'pay-2',
        action: 'payment_received',
        description: 'Recorded payment of $2,500 for Northstar Luxury',
        createdAt: '2026-09-28T16:00:00Z',
      },
      {
        id: 'act-3',
        organizationId: this.org.id,
        entityType: 'project',
        entityId: 'prj-105',
        action: 'project_updated',
        description: 'Marked Atlas Episodic Social Campaign as Blocked (waiting on footage)',
        createdAt: '2026-09-27T14:30:00Z',
      },
      {
        id: 'act-4',
        organizationId: this.org.id,
        entityType: 'time',
        entityId: 'time-2',
        action: 'time_tracked',
        description: 'Logged 5h sound design and Dolby mix for Nike Summer Campaign',
        createdAt: '2026-09-29T16:00:00Z',
      },
    ];

    return {
      metrics: {
        monthlyRevenue: totalCollected,
        outstandingRevenue: outstanding,
        overdueRevenue: overdue,
        projectedIncoming,
        trackedHoursThisMonth: totalHours,
        activeProjectsCount: this.projects.filter((p) => p.status === 'active' || p.status === 'review').length,
        pendingApprovalsCount: pendingApprovals,
        currency: this.org.currency,
      },
      needsAttention: attentionItems,
      activeProjects: this.projects,
      upcomingDates,
      recentActivity,
    };
  }

  // Financial Reports
  getFinancialReports(): FinancialReportsData {
    const totalRev = this.invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const totalExp = this.expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const outstanding = this.invoices
      .filter((inv) => inv.status !== 'paid')
      .reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

    return {
      totalRevenueYTD: totalRev,
      totalExpensesYTD: totalExp,
      netProfitYTD: totalRev - totalExp,
      outstandingBalance: outstanding,
      averageHourlyRate: this.org.hourlyRate,
      currency: this.org.currency,
      monthlyCashFlow: [
        { month: 'Jul 2026', revenue: 80000, expenses: 12000, profit: 68000 },
        { month: 'Aug 2026', revenue: 140000, expenses: 18000, profit: 122000 },
        { month: 'Sep 2026', revenue: 156200, expenses: 15200, profit: 141000 },
        { month: 'Oct 2026', revenue: 95000, expenses: 8000, profit: 87000 },
      ],
      revenueByClient: [
        { clientId: '11111111-1111-1111-1111-111111111111', clientName: 'Nike India', revenue: 106200, percentage: 68 },
        { clientId: '44444444-4444-4444-4444-444444444444', clientName: 'Northstar Luxury', revenue: 50000, percentage: 32 },
      ],
      projectProfitability: this.projects.map((p) => {
        const client = this.clients.find((c) => c.id === p.clientId);
        const rev = p.totalPaid || 0;
        const exp = p.totalExpenses || 0;
        const profit = rev - exp;
        const hours = p.totalHoursTracked || 1;
        return {
          projectId: p.id,
          projectName: p.name,
          clientName: client?.name || p.clientName || 'Client',
          revenue: rev,
          expenses: exp,
          profit,
          marginPercent: rev > 0 ? Math.round((profit / rev) * 100) : 0,
          trackedHours: hours,
          effectiveHourlyRate: hours > 0 ? Math.round(profit / hours) : 0,
          currency: this.org.currency,
        };
      }),
    };
  }

  // Clients
  listClients() {
    return this.clients;
  }

  getClient(id: string) {
    const client = this.clients.find((c) => c.id === id) || this.clients[0];
    if (!client) return null;
    const clientProjects = this.projects.filter((p) => p.clientId === client.id);
    const clientInvoices = this.invoices.filter((i) => i.clientId === client.id);
    const clientPayments = this.payments.filter((p) =>
      clientInvoices.some((inv) => inv.id === p.invoiceId)
    );
    let contacts = this.clientContacts.filter((ct) => ct.clientId === client.id);
    if (contacts.length === 0) {
      contacts = [
        {
          id: `ct-${client.id}-1`,
          clientId: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone || '+1 (555) 019-2831',
          role: 'Primary Contact / Decision Maker',
          isPrimary: true,
          createdAt: client.createdAt,
        },
      ];
    }
    return {
      ...client,
      contacts,
      projects: clientProjects,
      invoices: clientInvoices,
      payments: clientPayments,
    };
  }

  listClientContacts(clientId: string) {
    return this.clientContacts.filter((ct) => ct.clientId === clientId);
  }

  addClientContact(clientId: string, data: any): ClientContact {
    const newContact: ClientContact = {
      id: makeId('ct'),
      clientId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      role: data.role || 'Contact',
      isPrimary: Boolean(data.isPrimary),
      createdAt: new Date().toISOString(),
    };
    if (newContact.isPrimary) {
      this.clientContacts = this.clientContacts.map((ct) =>
        ct.clientId === clientId ? { ...ct, isPrimary: false } : ct
      );
    }
    this.clientContacts.push(newContact);
    this.saveToStorage();
    return newContact;
  }

  deleteClientContact(clientId: string, contactId: string): void {
    this.clientContacts = this.clientContacts.filter(
      (ct) => !(ct.clientId === clientId && ct.id === contactId)
    );
    this.saveToStorage();
  }

  createClient(data: any) {
    const currentTier = resolveUserTier(this.user.email);
    if (currentTier === 'free' && this.clients.length >= 3) {
      throw new Error(
        'Starter tier limit reached (maximum 3 active clients). Upgrading to Studio is required for unlimited clients. Changing tier is currently locked as payment processing is coming soon.'
      );
    }

    const newClient: Client = {
      id: makeId('client'),
      organizationId: this.org.id,
      name: data.name,
      company: data.company || null,
      email: data.email,
      phone: data.phone || null,
      currency: data.currency || this.org.currency,
      notes: data.notes || null,
      status: 'active',
      activeProjectsCount: 0,
      totalRevenue: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.clients.unshift(newClient);
    this.saveToStorage();
    return newClient;
  }

  updateClient(id: string, data: any) {
    const idx = this.clients.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.clients[idx] = { ...this.clients[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.clients[idx];
    }
    return null;
  }

  deleteClient(id: string) {
    this.clients = this.clients.filter((c) => c.id !== id);
    this.saveToStorage();
  }

  getClientTimeline(id: string) {
    return [
      {
        id: makeId('act'),
        organizationId: this.org.id,
        entityType: 'client',
        entityId: id,
        action: 'contract_signed',
        description: 'Client signed Master Services Agreement (MSA)',
        createdAt: '2026-09-12T00:00:00Z',
      },
      {
        id: makeId('act'),
        organizationId: this.org.id,
        entityType: 'client',
        entityId: id,
        action: 'payment_received',
        description: 'Payment verified and deposited to studio bank account',
        createdAt: '2026-09-20T00:00:00Z',
      },
    ];
  }

  // Leads
  listLeads() {
    return this.leads;
  }

  getLead(id: string) {
    return this.leads.find((l) => l.id === id) || null;
  }

  createLead(data: any) {
    const newLead: Lead = {
      id: makeId('lead'),
      organizationId: this.org.id,
      title: data.title,
      clientName: data.clientName || 'Contact',
      company: data.company || null,
      email: data.email || null,
      stage: (data.stage || data.status || 'new') as any,
      value: Number(data.value || data.estimatedValue || 0),
      currency: data.currency || this.org.currency,
      probabilityPercent: 20,
      expectedCloseDate: data.expectedCloseDate || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.leads.unshift(newLead);
    this.saveToStorage();
    return newLead;
  }

  updateLead(id: string, data: any) {
    const idx = this.leads.findIndex((l) => l.id === id);
    if (idx !== -1) {
      this.leads[idx] = { ...this.leads[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.leads[idx];
    }
    return null;
  }

  deleteLead(id: string) {
    this.leads = this.leads.filter((l) => l.id !== id);
    this.saveToStorage();
  }

  convertLead(id: string) {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) throw new Error('Lead not found');

    lead.stage = 'won';

    const newClient: Client = {
      id: makeId('client'),
      organizationId: this.org.id,
      name: lead.clientName,
      company: lead.company,
      email: lead.email || 'client@contact.io',
      currency: lead.currency || this.org.currency,
      status: 'active',
      activeProjectsCount: 1,
      totalRevenue: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.clients.unshift(newClient);

    const newProject: Project = {
      id: makeId('prj'),
      organizationId: this.org.id,
      clientId: newClient.id,
      name: lead.title,
      code: `PRJ-${Math.floor(Math.random() * 899 + 100)}`,
      status: 'planning',
      health: 'healthy',
      startDate: new Date().toISOString().split('T')[0],
      budget: lead.value || 100000,
      currency: lead.currency || this.org.currency,
      totalHoursTracked: 0,
      totalInvoiced: 0,
      totalPaid: 0,
      totalExpenses: 0,
      profit: 0,
      effectiveHourlyRate: 0,
      includedRevisions: 2,
      completedRevisions: 0,
      progressPercent: 0,
      clientName: newClient.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.unshift(newProject);

    this.saveToStorage();
    return { client: newClient, project: newProject };
  }

  // Projects
  listProjects() {
    return this.projects;
  }

  getProject(id: string) {
    const project = this.projects.find((p) => p.id === id) || this.projects[0];
    if (!project) return null;
    const client = this.clients.find((c) => c.id === project.clientId);
    return {
      ...project,
      clientName: client?.name || project.clientName || 'Client',
      tasks: this.tasks.filter((t) => t.projectId === project.id),
      deliverables: this.deliverables.filter((d) => d.projectId === project.id),
      timeEntries: this.timeEntries.filter((t) => t.projectId === project.id),
    };
  }

  createProject(data: any) {
    const client = this.clients.find((c) => c.id === data.clientId) || this.clients[0];
    const newProject: Project = {
      id: makeId('prj'),
      organizationId: this.org.id,
      clientId: data.clientId,
      name: data.name,
      code: `PRJ-${Math.floor(Math.random() * 899 + 100)}`,
      description: data.description || null,
      status: 'active',
      health: 'healthy',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      budget: Number(data.budget || 0),
      currency: data.currency || this.org.currency,
      deadline: data.deadline || null,
      includedRevisions: Number(data.includedRevisions || 2),
      progressPercent: 0,
      clientName: client?.name || 'Client',
      totalHoursTracked: 0,
      totalInvoiced: 0,
      totalPaid: 0,
      totalExpenses: 0,
      profit: 0,
      effectiveHourlyRate: 0,
      completedRevisions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.unshift(newProject);
    if (client) {
      client.activeProjectsCount = (client.activeProjectsCount || 0) + 1;
    }
    this.saveToStorage();
    return newProject;
  }

  updateProject(id: string, data: any) {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.projects[idx] = { ...this.projects[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.projects[idx];
    }
    return null;
  }

  deleteProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.saveToStorage();
  }

  // Tasks
  listTasks(projectId?: string) {
    if (projectId) return this.tasks.filter((t) => t.projectId === projectId);
    return this.tasks;
  }

  getTask(id: string) {
    return this.tasks.find((t) => t.id === id) || null;
  }

  createTask(data: any) {
    const newTask: Task = {
      id: makeId('task'),
      organizationId: this.org.id,
      projectId: data.projectId,
      title: data.title,
      description: data.description || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      clientVisible: data.clientVisible ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    this.saveToStorage();
    return newTask;
  }

  updateTask(id: string, data: any) {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.tasks[idx] = { ...this.tasks[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.tasks[idx];
    }
    return null;
  }

  deleteTask(id: string) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveToStorage();
  }

  // Invoices
  listInvoices() {
    return this.invoices;
  }

  getInvoice(id: string) {
    return this.invoices.find((i) => i.id === id) || this.invoices[0] || null;
  }

  createInvoice(data: any) {
    const client = this.clients.find((c) => c.id === data.clientId);
    const project = this.projects.find((p) => p.id === data.projectId);
    const subtotal = (data.items || []).reduce(
      (sum: number, it: any) => sum + (Number(it.unitPrice || 0) * Number(it.quantity || 1)),
      0
    ) || 25000;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: makeId('inv'),
      organizationId: this.org.id,
      clientId: data.clientId,
      projectId: data.projectId || null,
      invoiceNumber: `INV-2026-${String(this.invoices.length + 1).padStart(3, '0')}`,
      title: data.title || 'Creative Services Invoice',
      status: 'sent',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      subtotal,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 18,
      taxAmount: tax,
      total,
      totalAmount: total,
      amountPaid: 0,
      balanceDue: total,
      currency: data.currency || this.org.currency,
      clientName: client?.name || 'Client',
      projectName: project?.name,
      items: (data.items || []).map((it: any) => ({
        id: makeId('item'),
        description: it.description || 'Deliverables',
        quantity: Number(it.quantity || 1),
        unitPrice: Number(it.unitPrice || subtotal),
        amount: Number(it.unitPrice || subtotal) * Number(it.quantity || 1),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.invoices.unshift(newInvoice);
    if (client) {
      client.outstandingBalance = (client.outstandingBalance || 0) + total;
    }
    this.saveToStorage();
    return newInvoice;
  }

  updateInvoice(id: string, data: any) {
    const idx = this.invoices.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.invoices[idx] = { ...this.invoices[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.invoices[idx];
    }
    return null;
  }

  deleteInvoice(id: string) {
    this.invoices = this.invoices.filter((i) => i.id !== id);
    this.saveToStorage();
  }

  sendInvoice(id: string) {
    const inv = this.invoices.find((i) => i.id === id);
    if (inv) {
      inv.status = 'sent';
      this.saveToStorage();
    }
    return inv;
  }

  markInvoiceOverdue(id: string) {
    const inv = this.invoices.find((i) => i.id === id);
    if (inv) {
      inv.status = 'overdue';
      this.saveToStorage();
    }
    return inv;
  }

  // Payments
  listPayments(invoiceId?: string) {
    if (invoiceId) return this.payments.filter((p) => p.invoiceId === invoiceId);
    return this.payments;
  }

  createPayment(data: any) {
    const invoice = this.invoices.find((i) => i.id === data.invoiceId);
    const newPayment: Payment = {
      id: makeId('pay'),
      organizationId: this.org.id,
      invoiceId: data.invoiceId,
      clientId: invoice?.clientId || data.clientId || '11111111-1111-1111-1111-111111111111',
      clientName: invoice?.clientName || data.clientName,
      amount: Number(data.amount),
      currency: data.currency || this.org.currency,
      paymentMethod: data.paymentMethod || 'bank_transfer',
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
      reference: data.reference || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
    };
    this.payments.unshift(newPayment);

    // Reconcile Invoice
    if (invoice) {
      const invTotal = invoice.totalAmount ?? invoice.total ?? 0;
      invoice.amountPaid = (invoice.amountPaid || 0) + newPayment.amount;
      invoice.balanceDue = Math.max(0, invTotal - invoice.amountPaid);
      if (invoice.balanceDue <= 0) {
        invoice.status = 'paid';
        invoice.paidAt = newPayment.paymentDate;
      } else {
        invoice.status = 'partially_paid';
      }

      // Update client balance
      const client = this.clients.find((c) => c.id === invoice.clientId);
      if (client) {
        client.totalRevenue = (client.totalRevenue || 0) + newPayment.amount;
        client.outstandingBalance = Math.max(0, (client.outstandingBalance || 0) - newPayment.amount);
      }
    }

    this.saveToStorage();
    return newPayment;
  }

  // Time tracking
  listTime(projectId?: string) {
    if (projectId) return this.timeEntries.filter((t) => t.projectId === projectId);
    return this.timeEntries;
  }

  createTime(data: any) {
    const hours = Number(data.hours || 1);
    const durationMinutes = Math.round(hours * 60);
    const hourlyRate = this.org.hourlyRate || 2500;
    const newTime: TimeEntry = {
      id: makeId('time'),
      organizationId: this.org.id,
      projectId: data.projectId,
      description: data.description || 'Session',
      startTime: data.startTime || new Date().toISOString(),
      endTime: data.endTime || new Date().toISOString(),
      durationMinutes,
      durationSeconds: durationMinutes * 60,
      billable: data.billable ?? data.isBillable ?? true,
      isBillable: data.billable ?? data.isBillable ?? true,
      hourlyRate,
      revenueAmount: Math.round(hours * hourlyRate),
      isRunning: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.timeEntries.unshift(newTime);
    this.saveToStorage();
    return newTime;
  }

  startTimer(data: any) {
    const project = this.projects.find((p) => p.id === data.projectId);
    this.activeTimer = {
      id: makeId('timer-active'),
      organizationId: this.org.id,
      projectId: data.projectId,
      projectName: project?.name,
      description: data.description || 'Active Live Session',
      startTime: new Date().toISOString(),
      durationMinutes: 0,
      durationSeconds: 0,
      billable: true,
      isBillable: true,
      hourlyRate: this.org.hourlyRate || 2500,
      revenueAmount: 0,
      isRunning: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.activeTimer;
  }

  stopTimer(id: string) {
    if (this.activeTimer) {
      const saved: TimeEntry = {
        ...this.activeTimer,
        endTime: new Date().toISOString(),
        durationMinutes: 30,
        durationSeconds: 1800,
        revenueAmount: Math.round(0.5 * (this.org.hourlyRate || 2500)),
        isRunning: false,
        updatedAt: new Date().toISOString(),
      };
      this.timeEntries.unshift(saved);
      this.activeTimer = null;
      this.saveToStorage();
      return saved;
    }
    return { id, message: 'Stopped' };
  }

  getActiveTimer() {
    return this.activeTimer;
  }

  deleteTime(id: string) {
    this.timeEntries = this.timeEntries.filter((t) => t.id !== id);
    this.saveToStorage();
  }

  // Deliverables
  listDeliverables(projectId?: string) {
    if (projectId) return this.deliverables.filter((d) => d.projectId === projectId);
    return this.deliverables;
  }

  getDeliverable(id: string) {
    return this.deliverables.find((d) => d.id === id) || null;
  }

  createDeliverable(data: any) {
    const newDel: Deliverable = {
      id: makeId('del'),
      organizationId: this.org.id,
      projectId: data.projectId,
      title: data.title,
      description: data.description || null,
      status: 'client_review',
      currentVersion: 'V1',
      versionsCount: 1,
      includedRevisions: Number(data.includedRevisions || 2),
      usedRevisions: 0,
      isScopeExceeded: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.deliverables.unshift(newDel);
    this.saveToStorage();
    return newDel;
  }

  updateDeliverable(id: string, data: any) {
    const idx = this.deliverables.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.deliverables[idx] = { ...this.deliverables[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.deliverables[idx];
    }
    return null;
  }

  deleteDeliverable(id: string) {
    this.deliverables = this.deliverables.filter((d) => d.id !== id);
    this.saveToStorage();
  }

  addDeliverableVersion(id: string, data: any) {
    const del = this.deliverables.find((d) => d.id === id);
    if (del) {
      del.versionsCount = (del.versionsCount || 1) + 1;
      del.currentVersion = String(data.versionNumber || `V${del.versionsCount}`);
      this.saveToStorage();
      return { id: makeId('ver'), deliverableId: id, versionNumber: del.currentVersion };
    }
    return null;
  }

  // Approvals
  listApprovals() {
    return this.approvals;
  }

  requestApproval(data: any) {
    const del = this.deliverables.find((d) => d.id === data.deliverableId);
    const newApproval: Approval = {
      id: makeId('appr'),
      organizationId: this.org.id,
      projectId: data.projectId || del?.projectId || '027c41fa-8f90-4bac-989d-b5f80652ab0c',
      deliverableId: data.deliverableId,
      deliverableTitle: del?.title || 'Deliverable',
      versionNumber: data.versionNumber || del?.currentVersion || 'V1',
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    this.approvals.unshift(newApproval);
    this.saveToStorage();
    return newApproval;
  }

  decideApproval(id: string, data: { status: 'approved' | 'changes_requested'; decidedBy: string; comments?: string }) {
    const appr = this.approvals.find((a) => a.id === id);
    if (appr) {
      appr.status = data.status;
      appr.decidedBy = data.decidedBy;
      appr.feedbackComments = data.comments;
      appr.decidedAt = new Date().toISOString();
      this.saveToStorage();
      return appr;
    }
    return null;
  }

  // Retainers
  listRetainers() {
    return this.retainers;
  }

  createRetainer(data: any) {
    const newRet: Retainer = {
      id: makeId('ret'),
      organizationId: this.org.id,
      clientId: data.clientId,
      title: data.title,
      monthlyAmount: Number(data.monthlyRate || data.monthlyAmount || 50000),
      monthlyRate: Number(data.monthlyRate || data.monthlyAmount || 50000),
      currency: this.org.currency,
      includedHours: Number(data.includedHours || 20),
      usedHours: 0,
      remainingHours: Number(data.includedHours || 20),
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.retainers.unshift(newRet);
    this.saveToStorage();
    return newRet;
  }

  updateRetainer(id: string, data: any) {
    const idx = this.retainers.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.retainers[idx] = { ...this.retainers[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.retainers[idx];
    }
    return null;
  }

  deleteRetainer(id: string) {
    this.retainers = this.retainers.filter((r) => r.id !== id);
    this.saveToStorage();
  }

  // Expenses
  listExpenses(projectId?: string) {
    if (projectId) return this.expenses.filter((e) => e.projectId === projectId);
    return this.expenses;
  }

  createExpense(data: any) {
    const newExp: Expense = {
      id: makeId('exp'),
      organizationId: this.org.id,
      projectId: data.projectId || null,
      vendor: data.vendor,
      category: data.category || 'software',
      amount: Number(data.amount || 0),
      currency: data.currency || this.org.currency,
      date: data.date || new Date().toISOString().split('T')[0],
      isReimbursable: data.isReimbursable ?? data.isBillable ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.expenses.unshift(newExp);
    this.saveToStorage();
    return newExp;
  }

  updateExpense(id: string, data: any) {
    const idx = this.expenses.findIndex((e) => e.id === id);
    if (idx !== -1) {
      this.expenses[idx] = { ...this.expenses[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.expenses[idx];
    }
    return null;
  }

  deleteExpense(id: string) {
    this.expenses = this.expenses.filter((e) => e.id !== id);
    this.saveToStorage();
  }

  // Proposals & Quotes & Contracts
  listProposals(): Proposal[] {
    return this.proposals;
  }

  getProposal(id: string): Proposal | null {
    return this.proposals.find((p) => p.id === id) || null;
  }

  createProposal(data: any): Proposal {
    const client = this.clients.find((c) => c.id === data.clientId);
    const total = Number(data.items?.[0]?.unitPrice || 4500);
    const newProp: Proposal = {
      id: makeId('prop'),
      organizationId: this.org.id,
      proposalNumber: `PROP-2026-${Math.floor(Math.random() * 89 + 10)}`,
      clientId: data.clientId,
      title: data.title,
      status: 'draft',
      subtotal: total,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      totalAmount: total,
      total,
      currency: data.currency || this.org.currency,
      validUntil: data.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      clientName: client?.name,
      items: data.items || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.proposals.unshift(newProp);
    this.saveToStorage();
    return newProp;
  }

  updateProposal(id: string, data: any): Proposal | null {
    const idx = this.proposals.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.proposals[idx] = { ...this.proposals[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.proposals[idx];
    }
    return null;
  }

  deleteProposal(id: string): void {
    this.proposals = this.proposals.filter((p) => p.id !== id);
    this.saveToStorage();
  }

  listQuotes(): Quote[] {
    return this.quotes;
  }

  getQuote(id: string): Quote | null {
    return this.quotes.find((q) => q.id === id) || null;
  }

  createQuote(data: any): Quote {
    const client = this.clients.find((c) => c.id === data.clientId);
    const total = Number(data.items?.[0]?.unitPrice || 3500);
    const newQuote: Quote = {
      id: makeId('quote'),
      organizationId: this.org.id,
      clientId: data.clientId,
      quoteNumber: `Q-2026-${Math.floor(Math.random() * 89 + 10)}`,
      title: data.title,
      status: 'draft',
      subtotal: total,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: total,
      total,
      currency: data.currency || this.org.currency,
      validUntil: data.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      clientName: client?.name,
      items: data.items || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.quotes.unshift(newQuote);
    this.saveToStorage();
    return newQuote;
  }

  updateQuote(id: string, data: any): Quote | null {
    const idx = this.quotes.findIndex((q) => q.id === id);
    if (idx !== -1) {
      this.quotes[idx] = { ...this.quotes[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.quotes[idx];
    }
    return null;
  }

  deleteQuote(id: string): void {
    this.quotes = this.quotes.filter((q) => q.id !== id);
    this.saveToStorage();
  }

  listContracts(): Contract[] {
    return this.contracts;
  }

  getContract(id: string): Contract | null {
    return this.contracts.find((c) => c.id === id) || null;
  }

  createContract(data: any): Contract {
    const client = this.clients.find((c) => c.id === data.clientId);
    const newCont: Contract = {
      id: makeId('cont'),
      organizationId: this.org.id,
      clientId: data.clientId,
      projectId: data.projectId,
      title: data.title,
      status: 'draft',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      terms: data.terms || 'Standard contract terms.',
      content: data.content || 'Standard contract agreement.',
      clientName: client?.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contracts.unshift(newCont);
    this.saveToStorage();
    return newCont;
  }

  updateContract(id: string, data: any): Contract | null {
    const idx = this.contracts.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.contracts[idx] = { ...this.contracts[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveToStorage();
      return this.contracts[idx];
    }
    return null;
  }

  deleteContract(id: string): void {
    this.contracts = this.contracts.filter((c) => c.id !== id);
    this.saveToStorage();
  }

  signContract(id: string, signerName: string) {
    const contract = this.contracts.find((c) => c.id === id);
    if (contract) {
      contract.status = 'signed';
      contract.signerName = signerName;
      contract.signedAt = new Date().toISOString();
      this.saveToStorage();
      return contract;
    }
    return { id, status: 'signed', signerName, signedAt: new Date().toISOString() };
  }

  // Feedback & Revisions
  listFeedback(deliverableId: string): FeedbackItem[] {
    return [];
  }

  createFeedback(data: any) {
    return { id: makeId('fb'), ...data, createdAt: new Date().toISOString() };
  }

  resolveFeedback(id: string) {
    return { id, isResolved: true };
  }

  listRevisions(projectId?: string): Revision[] {
    return [];
  }

  createRevision(data: any) {
    return { id: makeId('rev'), ...data, createdAt: new Date().toISOString() };
  }

  // Notifications & Activity
  listNotifications(): Notification[] {
    return [];
  }

  listActivity(limit = 30): ActivityLog[] {
    return this.getDashboardSummary().recentActivity;
  }

  // Global search across all 7 entities
  search(q: string) {
    const query = q.toLowerCase();
    const matchedProposals = this.listProposals().filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.proposalNumber?.toLowerCase().includes(query) ||
        p.clientName?.toLowerCase().includes(query)
    );
    const matchedDeliverables = this.deliverables.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        (d.description && d.description.toLowerCase().includes(query)) ||
        (d.projectName && d.projectName.toLowerCase().includes(query))
    );
    return {
      clients: this.clients.filter((c) => c.name.toLowerCase().includes(query) || c.company?.toLowerCase().includes(query)),
      projects: this.projects.filter((p) => p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query)),
      invoices: this.invoices.filter((i) => i.invoiceNumber.toLowerCase().includes(query) || i.title.toLowerCase().includes(query)),
      tasks: this.tasks.filter((t) => t.title.toLowerCase().includes(query)),
      leads: this.leads.filter((l) => l.title.toLowerCase().includes(query) || l.clientName.toLowerCase().includes(query)),
      proposals: matchedProposals,
      deliverables: matchedDeliverables,
    };
  }

  // Milestones
  listMilestones(projectId?: string): ProjectMilestone[] {
    if (projectId) {
      return this.milestones.filter((m) => m.projectId === projectId).sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return [...this.milestones].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  createMilestone(data: any): ProjectMilestone {
    const item: ProjectMilestone = {
      id: makeId('mil'),
      organizationId: this.org.id,
      projectId: data.projectId,
      name: data.name,
      description: data.description || null,
      dueDate: data.dueDate,
      status: data.status || 'pending',
      paymentAmount: data.paymentAmount ? Number(data.paymentAmount) : null,
      invoiceId: data.invoiceId || null,
      orderIndex: data.orderIndex !== undefined ? Number(data.orderIndex) : this.milestones.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.milestones.push(item);
    this.saveToStorage();
    return item;
  }

  updateMilestone(id: string, data: any): ProjectMilestone {
    const idx = this.milestones.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.milestones[idx] = {
        ...this.milestones[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
      return this.milestones[idx];
    }
    throw new Error('Milestone not found');
  }

  deleteMilestone(id: string): void {
    this.milestones = this.milestones.filter((m) => m.id !== id);
    this.saveToStorage();
  }

  // Scope & Change Orders
  getScope(projectId: string): { scope: ProjectScope | null; changes: ScopeChange[] } {
    const scope = this.scopes.find((s) => s.projectId === projectId) || null;
    const changes = this.scopeChanges.filter((sc) => sc.projectId === projectId);
    return { scope, changes };
  }

  saveScope(data: any): ProjectScope {
    const projectId = data.projectId;
    const idx = this.scopes.findIndex((s) => s.projectId === projectId);
    const item: ProjectScope = {
      id: idx !== -1 ? this.scopes[idx].id : makeId('scope'),
      organizationId: this.org.id,
      projectId,
      includedItems: data.includedItems || [],
      excludedItems: data.excludedItems || [],
      limitations: data.limitations || null,
      revisionAllowance: data.revisionAllowance !== undefined ? Number(data.revisionAllowance) : 2,
      deliveryAssumptions: data.deliveryAssumptions || null,
      createdAt: idx !== -1 ? this.scopes[idx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (idx !== -1) {
      this.scopes[idx] = item;
    } else {
      this.scopes.push(item);
    }
    this.saveToStorage();
    return item;
  }

  listScopeChanges(projectId?: string): ScopeChange[] {
    if (projectId) {
      return this.scopeChanges.filter((sc) => sc.projectId === projectId);
    }
    return this.scopeChanges;
  }

  createScopeChange(data: any): ScopeChange {
    const item: ScopeChange = {
      id: makeId('sc'),
      organizationId: this.org.id,
      projectId: data.projectId,
      title: data.title,
      requestDetails: data.requestDetails,
      requestedBy: data.requestedBy || 'Client',
      requestedDate: data.requestedDate || new Date().toISOString().split('T')[0],
      estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : null,
      additionalCost: data.additionalCost ? Number(data.additionalCost) : 0,
      currency: data.currency || this.org.currency || 'USD',
      status: data.status || 'requested',
      approvedAt: data.status === 'approved' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.scopeChanges.push(item);

    if (item.status === 'approved' && item.additionalCost > 0) {
      const pIdx = this.projects.findIndex((p) => p.id === item.projectId);
      if (pIdx !== -1) {
        this.projects[pIdx].budget += item.additionalCost;
      }
    }

    this.saveToStorage();
    return item;
  }

  updateScopeChange(id: string, data: any): ScopeChange {
    const idx = this.scopeChanges.findIndex((sc) => sc.id === id);
    if (idx !== -1) {
      const prev = this.scopeChanges[idx];
      const updated: ScopeChange = {
        ...prev,
        ...data,
        approvedAt: data.status === 'approved' && !prev.approvedAt ? new Date().toISOString() : prev.approvedAt,
        updatedAt: new Date().toISOString(),
      };
      this.scopeChanges[idx] = updated;

      if (prev.status !== 'approved' && updated.status === 'approved' && updated.additionalCost > 0) {
        const pIdx = this.projects.findIndex((p) => p.id === updated.projectId);
        if (pIdx !== -1) {
          this.projects[pIdx].budget += updated.additionalCost;
        }
      }

      this.saveToStorage();
      return updated;
    }
    throw new Error('Scope change not found');
  }

  // Asset Requests
  listAssetRequests(params?: { projectId?: string; clientId?: string } | string): AssetRequest[] {
    const projectId = typeof params === 'string' ? params : params?.projectId;
    const clientId = typeof params === 'object' ? params?.clientId : undefined;
    let list = this.assetRequests;
    if (projectId) {
      list = list.filter((a) => a.projectId === projectId);
    }
    if (clientId) {
      list = list.filter((a) => a.clientId === clientId);
    }
    return list.map((a) => {
      const proj = this.projects.find((p) => p.id === a.projectId);
      const client = this.clients.find((c) => c.id === a.clientId);
      return {
        ...a,
        projectName: proj?.name || a.projectName,
        clientName: client?.name || a.clientName,
      };
    });
  }

  createAssetRequest(data: any): AssetRequest {
    const proj = this.projects.find((p) => p.id === data.projectId);
    const client = this.clients.find((c) => c.id === data.clientId);
    const item: AssetRequest = {
      id: makeId('ar'),
      organizationId: this.org.id,
      projectId: data.projectId,
      clientId: data.clientId || proj?.clientId || '',
      projectName: proj?.name,
      clientName: client?.name,
      title: data.title,
      description: data.description || null,
      status: data.status || 'requested',
      dueDate: data.dueDate || null,
      fileUrl: data.fileUrl || null,
      fileName: data.fileName || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.assetRequests.push(item);
    this.saveToStorage();
    return item;
  }

  updateAssetRequest(id: string, data: any): AssetRequest {
    const idx = this.assetRequests.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.assetRequests[idx] = {
        ...this.assetRequests[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
      return this.assetRequests[idx];
    }
    throw new Error('Asset request not found');
  }

  deleteAssetRequest(id: string): void {
    this.assetRequests = this.assetRequests.filter((a) => a.id !== id);
    this.saveToStorage();
  }

  // Project Files & R2 File Manager
  listProjectFiles(projectId?: string): ProjectFile[] {
    if (projectId) {
      return this.projectFiles.filter((f) => f.projectId === projectId);
    }
    return this.projectFiles;
  }

  uploadProjectFile(data: Partial<ProjectFile>): ProjectFile {
    const file: ProjectFile = {
      id: makeId('pf'),
      organizationId: this.org.id,
      projectId: data.projectId || '',
      name: data.name || 'unnamed_file.bin',
      folder: (data.folder as any) || 'General',
      sizeBytes: data.sizeBytes || Math.floor(Math.random() * 5000000 + 500000),
      mimeType: data.mimeType || 'application/octet-stream',
      r2Key: data.r2Key || `projects/${data.projectId || 'gen'}/${Date.now()}-${data.name || 'file.bin'}`,
      publicUrl: data.publicUrl || `/api/files/download/projects/${data.projectId || 'gen'}/${data.name || 'file.bin'}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: data.uploadedBy || `${this.user.firstName || 'Creator'} ${this.user.lastName || ''}`.trim(),
    };
    this.projectFiles.unshift(file);
    this.saveToStorage();
    return file;
  }

  deleteProjectFile(id: string): void {
    this.projectFiles = this.projectFiles.filter((f) => f.id !== id);
    this.saveToStorage();
  }

  generateShareLink(fileId: string, hours = 24): { shareUrl: string; expiresAt: string } {
    const file = this.projectFiles.find((f) => f.id === fileId);
    if (!file) throw new Error('File not found');
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    const token = typeof window !== 'undefined' ? btoa(`${file.id}:${expiresAt}`).replace(/=/g, '') : 'mock-token';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://freelanceros.app';
    const shareUrl = `${baseUrl}/api/files/download/${encodeURIComponent(file.r2Key)}?token=${token}&exp=${Math.floor(Date.now() / 1000) + hours * 3600}`;
    return { shareUrl, expiresAt };
  }

  // Creative Workflow
  listCallSheets(projectId?: string): ProductionCallSheet[] {
    if (projectId) return this.callSheets.filter((c) => c.projectId === projectId);
    return this.callSheets;
  }

  createCallSheet(data: any): ProductionCallSheet {
    const item: ProductionCallSheet = {
      id: makeId('cs'),
      organizationId: this.org.id,
      projectId: data.projectId,
      title: data.title,
      shootDate: data.shootDate || new Date().toISOString().split('T')[0],
      location: data.location || '',
      callTimes: data.callTimes || null,
      crew: data.crew || null,
      talent: data.talent || null,
      equipment: data.equipment || null,
      notes: data.notes || null,
      emergencyContact: data.emergencyContact || null,
      createdAt: new Date().toISOString(),
    };
    this.callSheets.push(item);
    this.saveToStorage();
    return item;
  }

  updateCallSheet(id: string, data: any): ProductionCallSheet {
    const idx = this.callSheets.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.callSheets[idx] = { ...this.callSheets[idx], ...data };
      this.saveToStorage();
      return this.callSheets[idx];
    }
    throw new Error('Call sheet not found');
  }

  deleteCallSheet(id: string): void {
    this.callSheets = this.callSheets.filter((c) => c.id !== id);
    this.saveToStorage();
  }

  listShots(projectId?: string): ProductionShot[] {
    if (projectId) return this.shots.filter((s) => s.projectId === projectId);
    return this.shots;
  }

  createShot(data: any): ProductionShot {
    const item: ProductionShot = {
      id: makeId('shot'),
      organizationId: this.org.id,
      projectId: data.projectId,
      shotNumber: data.shotNumber || `${this.shots.length + 1}A`,
      description: data.description,
      location: data.location || null,
      framing: data.framing || null,
      movement: data.movement || null,
      lens: data.lens || null,
      talent: data.talent || null,
      notes: data.notes || null,
      status: data.status || 'planned',
      createdAt: new Date().toISOString(),
    };
    this.shots.push(item);
    this.saveToStorage();
    return item;
  }

  updateShot(id: string, data: any): ProductionShot {
    const idx = this.shots.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.shots[idx] = { ...this.shots[idx], ...data };
      this.saveToStorage();
      return this.shots[idx];
    }
    throw new Error('Shot not found');
  }

  deleteShot(id: string): void {
    this.shots = this.shots.filter((s) => s.id !== id);
    this.saveToStorage();
  }

  listEquipment(projectId?: string): EquipmentItem[] {
    if (projectId) return this.equipment.filter((e) => e.projectId === projectId);
    return this.equipment;
  }

  createEquipment(data: any): EquipmentItem {
    const item: EquipmentItem = {
      id: makeId('eq'),
      organizationId: this.org.id,
      projectId: data.projectId,
      item: data.item,
      category: data.category || 'General',
      quantity: data.quantity ? Number(data.quantity) : 1,
      status: data.status || 'needed',
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
    };
    this.equipment.push(item);
    this.saveToStorage();
    return item;
  }

  updateEquipment(id: string, data: any): EquipmentItem {
    const idx = this.equipment.findIndex((e) => e.id === id);
    if (idx !== -1) {
      this.equipment[idx] = { ...this.equipment[idx], ...data };
      this.saveToStorage();
      return this.equipment[idx];
    }
    throw new Error('Equipment item not found');
  }

  deleteEquipment(id: string): void {
    this.equipment = this.equipment.filter((e) => e.id !== id);
    this.saveToStorage();
  }

  // Client Portal
  getPortalData(clientId: string): ClientPortalData {
    const client = this.clients.find((c) => c.id === clientId) || this.clients[0];
    const clientProjects = this.projects.filter((p) => p.clientId === client.id);
    const clientProjectIds = new Set(clientProjects.map((p) => p.id));
    const deliverables = this.deliverables.filter((d) => clientProjectIds.has(d.projectId));
    const invoices = this.invoices.filter((i) => i.clientId === client.id);
    const assetRequests = this.assetRequests.filter((a) => a.clientId === client.id || clientProjectIds.has(a.projectId));
    const contracts = this.listContracts().filter((c) => c.clientId === client.id);

    return {
      client,
      projects: clientProjects,
      deliverables,
      invoices,
      assetRequests,
      contracts,
    };
  }

  submitPortalFeedback(clientId: string, data: any) {
    const item = {
      id: makeId('fb'),
      deliverableId: data.deliverableId,
      comment: data.comment,
      authorName: data.authorName || 'Client',
      timestampSeconds: data.timestampSeconds !== undefined ? Number(data.timestampSeconds) : null,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };
    return item;
  }

  // Case Studies
  listCaseStudies(projectId?: string): CaseStudy[] {
    if (projectId) return this.caseStudies.filter((c) => c.projectId === projectId);
    return this.caseStudies;
  }

  getCaseStudy(id: string): CaseStudy | null {
    return this.caseStudies.find((c) => c.id === id) || null;
  }

  createCaseStudy(data: any): CaseStudy {
    const proj = this.projects.find((p) => p.id === data.projectId);
    const client = this.clients.find((c) => c.id === data.clientId);
    const item: CaseStudy = {
      id: makeId('cs-study'),
      organizationId: this.org.id,
      projectId: data.projectId,
      projectName: proj?.name,
      clientId: data.clientId || proj?.clientId || '',
      clientName: client?.name,
      title: data.title,
      challenge: data.challenge,
      solution: data.solution,
      result: data.result,
      services: data.services || [],
      testimonialText: data.testimonialText || null,
      testimonialAuthor: data.testimonialAuthor || null,
      published: data.published !== undefined ? Boolean(data.published) : true,
      createdAt: new Date().toISOString(),
    };
    this.caseStudies.push(item);
    this.saveToStorage();
    return item;
  }

  updateCaseStudy(id: string, data: any): CaseStudy {
    const idx = this.caseStudies.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.caseStudies[idx] = { ...this.caseStudies[idx], ...data };
      this.saveToStorage();
      return this.caseStudies[idx];
    }
    throw new Error('Case study not found');
  }

  deleteCaseStudy(id: string): void {
    this.caseStudies = this.caseStudies.filter((c) => c.id !== id);
    this.saveToStorage();
  }

  // Business Calculators & Goals
  calculateRate(data: RateCalculatorInput): RateCalculatorResult {
    const totalWorkingHours = data.workingDaysPerMonth * data.workingHoursPerDay;
    const billableRatio = Math.max(0.05, 1 - data.nonBillablePercent / 100);
    const billableHoursPerMonth = Math.max(1, Math.round(totalWorkingHours * billableRatio));
    const grossIncomeNeeded = data.desiredMonthlyIncome / Math.max(0.05, 1 - data.taxRatePercent / 100);
    const totalMonthlyCost = grossIncomeNeeded + data.monthlyExpenses;
    const requiredHourlyRate = Math.round(totalMonthlyCost / billableHoursPerMonth);
    const requiredDailyRate = Math.round(requiredHourlyRate * data.workingHoursPerDay);

    return {
      requiredHourlyRate,
      requiredDailyRate,
      requiredMonthlyRevenue: Math.round(totalMonthlyCost),
      totalMonthlyCost: Math.round(totalMonthlyCost),
      billableHoursPerMonth,
    };
  }

  calculateRunway(data: RunwayCalculatorInput): RunwayCalculatorResult {
    const netMonthlyBurn = Math.max(0, data.monthlyExpenses - data.expectedMonthlyIncome);
    const runwayMonths = netMonthlyBurn > 0 ? Number((data.currentSavings / netMonthlyBurn).toFixed(1)) : 999;
    const status: 'critical' | 'moderate' | 'healthy' =
      runwayMonths < 3 ? 'critical' : runwayMonths < 6 ? 'moderate' : 'healthy';

    return {
      netMonthlyBurn,
      runwayMonths,
      status,
    };
  }

  getGoal(): BusinessGoal | null {
    return this.businessGoals[0] || null;
  }

  listGoals(): BusinessGoal[] {
    return this.businessGoals;
  }

  createGoal(data: any): BusinessGoal {
    return this.setGoal(data);
  }

  setGoal(data: any): BusinessGoal {
    const item: BusinessGoal = {
      id: this.businessGoals[0]?.id || makeId('goal'),
      organizationId: this.org.id,
      period: data.period || '2026-Q4',
      monthlyRevenueTarget: Number(data.monthlyRevenueTarget || 10000),
      targetClients: Number(data.targetClients || 4),
      targetHours: Number(data.targetHours || 80),
      createdAt: this.businessGoals[0]?.createdAt || new Date().toISOString(),
    };
    this.businessGoals = [item];
    this.saveToStorage();
    return item;
  }

  // AI Assistants
  aiSummarizeProject(projectId: string) {
    const project = this.projects.find((p) => p.id === projectId) || this.projects[0];
    const client = this.clients.find((c) => c.id === project.clientId);
    const tasksList = this.tasks.filter((t) => t.projectId === project.id);
    const deliverablesList = this.deliverables.filter((d) => d.projectId === project.id);
    const invoicesList = this.invoices.filter((i) => i.projectId === project.id);
    const today = new Date().toISOString().split('T')[0];

    const overdueTasks = tasksList.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < today);
    const completedTasks = tasksList.filter((t) => t.status === 'done');
    const outstandingInvoices = invoicesList.filter((i) => i.balanceDue > 0);

    const summary = `Project "${project.name}" for ${client?.name || 'Partner'} is currently in **${project.status.toUpperCase()}** status with **${project.health.toUpperCase()}** health.
    
• **Progress:** ${project.progressPercent}% completion (${completedTasks.length}/${tasksList.length} tasks finished).
• **Financials:** ${project.currency} ${project.budget.toLocaleString()} budget. Total invoiced: ${project.currency} ${invoicesList.reduce((s, i) => s + i.totalAmount, 0).toLocaleString()}.
• **Deliverables:** ${deliverablesList.length} deliverables tracked. ${deliverablesList.filter((d) => d.status === 'client_review').length} currently awaiting client sign-off.
• **Risks Identified:** ${overdueTasks.length > 0 ? `${overdueTasks.length} overdue tasks.` : 'No critical task bottlenecks.'} ${outstandingInvoices.length > 0 ? `${outstandingInvoices.length} unpaid invoices pending.` : 'All invoices settled.'}`;

    const recommendedActions = [
      ...(overdueTasks.length > 0 ? [`Follow up on ${overdueTasks.length} overdue task(s): ${overdueTasks.map((t) => t.title).join(', ')}`] : []),
      ...(deliverablesList.some((d) => d.status === 'client_review') ? ['Send review reminder to client for deliverables awaiting sign-off'] : []),
      ...(outstandingInvoices.length > 0 ? [`Send payment reminder for invoice ${outstandingInvoices[0].invoiceNumber}`] : []),
      'Review milestone schedule against remaining time budget',
    ];

    return {
      summary,
      health: project.health,
      healthReason: project.healthReason || (overdueTasks.length > 0 ? `${overdueTasks.length} overdue tasks` : 'On track'),
      recommendedActions,
      metrics: {
        totalTasks: tasksList.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        deliverablesCount: deliverablesList.length,
      },
    };
  }

  aiExtractTasks(notes: string, _projectId?: string) {
    if (!notes) return { tasks: [] };
    const rawLines = notes
      .split(/\r?\n/)
      .map((l) => l.replace(/^[-*•\d.)\]\s]+/, '').trim())
      .filter((l) => l.length > 4);

    const tasks = rawLines.map((line, idx) => {
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
      let estimatedHours = 2;
      const lower = line.toLowerCase();
      if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately')) {
        priority = 'urgent';
      } else if (lower.includes('important') || lower.includes('critical') || lower.includes('must')) {
        priority = 'high';
      }

      if (lower.includes('quick') || lower.includes('minor') || lower.includes('tweak')) {
        estimatedHours = 0.5;
      } else if (lower.includes('full') || lower.includes('complete') || lower.includes('redesign')) {
        estimatedHours = 6;
      }

      return {
        title: line,
        priority,
        estimatedHours,
        suggestedDueDate: new Date(Date.now() + (idx + 1) * 86400000).toISOString().split('T')[0],
      };
    });

    return { tasks };
  }

  aiDraftProposal(data: any) {
    const { clientName, service, budget, currency = 'USD' } = data;
    const title = `${service || 'Creative Production'} for ${clientName || 'Partner'}`;
    const executiveSummary = `This proposal outlines the strategy, scope of deliverables, and execution schedule for ${service || 'the project'}. Our objective is to deliver high-impact, polished creative assets tailored to ${clientName || 'your business'} objectives.`;

    const items = [
      {
        description: `Phase 1: Discovery, Planning & Pre-Production for ${service || 'Project'}`,
        quantity: 1,
        unitPrice: Math.round((budget || 5000) * 0.3),
        amount: Math.round((budget || 5000) * 0.3),
      },
      {
        description: `Phase 2: Execution, Editing & Asset Development`,
        quantity: 1,
        unitPrice: Math.round((budget || 5000) * 0.5),
        amount: Math.round((budget || 5000) * 0.5),
      },
      {
        description: `Phase 3: Color Grading, Sound Design & Final Master Deliverables`,
        quantity: 1,
        unitPrice: Math.round((budget || 5000) * 0.2),
        amount: Math.round((budget || 5000) * 0.2),
      },
    ];

    const terms = `1. 50% deposit upon proposal acceptance, 50% upon final master deliverable handoff.\n2. Includes up to 2 rounds of creative revisions per deliverable.\n3. Turnaround time: 14 business days from kickoff.`;

    return {
      title,
      executiveSummary,
      items,
      terms,
      currency,
      totalAmount: budget || 5000,
    };
  }

  aiDraftFollowUp(data: any) {
    const { type, entityId } = data;
    let subject = 'Following up on our project';
    let body = 'Hi there, just wanted to check in regarding our current project.';

    if (type === 'invoice') {
      const inv = this.invoices.find((i) => i.id === entityId) || this.invoices[0];
      const client = inv ? this.clients.find((c) => c.id === inv.clientId) : null;
      if (inv) {
        subject = `Invoice Reminder: ${inv.invoiceNumber} (${inv.currency} ${inv.balanceDue})`;
        body = `Hi ${client?.name || 'there'},\n\nHope you're having a productive week. This is a gentle reminder regarding invoice ${inv.invoiceNumber} for ${inv.currency} ${inv.balanceDue}, which was due on ${inv.dueDate}.\n\nPlease let me know if you need another copy of the invoice or wire instructions.\n\nThank you for your partnership!`;
      }
    } else if (type === 'approval') {
      const appr = this.approvals.find((a) => a.id === entityId) || this.approvals[0];
      const deliv = appr ? this.deliverables.find((d) => d.id === appr.deliverableId) : null;
      subject = `Review Required: ${deliv?.title || 'Deliverable'} (${appr?.versionNumber || 'V1'})`;
      body = `Hi there,\n\nJust checking in on the review for "${deliv?.title || 'Deliverable'}" (${appr?.versionNumber || 'V1'}) uploaded on ${appr?.requestedAt ? appr.requestedAt.split('T')[0] : 'recent date'}.\n\nPlease review and let me know if you approve or if any adjustments are needed so we can keep the timeline on track.\n\nBest regards!`;
    }

    return { subject, body };
  }

  aiBusinessQuery(query: string) {
    const q = (query || '').toLowerCase().trim();
    const today = new Date().toISOString().split('T')[0];

    if (q.includes('overdue') && q.includes('invoice')) {
      const filtered = this.invoices.filter((i) => (i.status === 'overdue' || (i.dueDate < today && i.balanceDue > 0)) && i.status !== 'cancelled');
      const totalOverdue = filtered.reduce((s, i) => s + i.balanceDue, 0);
      return {
        answer: `You currently have ${filtered.length} overdue invoice(s) totaling **${filtered[0]?.currency || 'USD'} ${totalOverdue.toLocaleString()}**.`,
        data: filtered,
        actionUrl: '/invoices',
      };
    }

    if (q.includes('collected') || q.includes('revenue')) {
      const totalCollected = this.payments.reduce((s, p) => s + p.amount, 0);
      return {
        answer: `You have collected a total of **USD ${totalCollected.toLocaleString()}** across ${this.payments.length} recorded payments.`,
        data: this.payments,
        actionUrl: '/reports',
      };
    }

    if (q.includes('project') && (q.includes('risk') || q.includes('blocked') || q.includes('health'))) {
      const atRisk = this.projects.filter((p) => p.health === 'at_risk' || p.health === 'blocked');
      return {
        answer: atRisk.length > 0
          ? `You have ${atRisk.length} project(s) requiring attention: ${atRisk.map((p) => `${p.name} (${p.healthReason || p.health})`).join(', ')}.`
          : 'All active projects are currently in healthy standing with zero blocked deadlines.',
        data: atRisk,
        actionUrl: '/projects',
      };
    }

    return {
      answer: `Here is a summary based on your live business records: You have ${this.projects.length} active projects, ${this.invoices.length} invoices, and ${this.timeEntries.length} tracked time entries. Try asking "Which invoices are overdue?", "How much revenue was collected?", or "Which projects are at risk?".`,
      data: [],
      actionUrl: '/dashboard',
    };
  }
}

export const mockStorage = new MockStorage();
