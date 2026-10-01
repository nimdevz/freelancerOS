import type {
  Client,
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
} from '@freelanceros/types';

const STORAGE_KEY = 'freelanceros_mock_db_v2';

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
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  defaultPaymentTermsDays: 14,
  taxRatePercent: 18,
  plan: 'pro',
  freelancerType: 'video_editor',
  hourlyRate: 2500,
  defaultHourlyRate: 2500,
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
    phone: '+91 98201 12345',
    currency: 'INR',
    address: 'One Bowerman Drive, Bengaluru Campus',
    notes: 'High priority brand partner. Strict turnaround for product launches.',
    status: 'active',
    activeProjectsCount: 1,
    totalRevenue: 106200,
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
    phone: '+91 98450 67890',
    currency: 'INR',
    address: 'Bandra Kurla Complex, Mumbai',
    notes: 'Fintech product design and marketing video series.',
    status: 'active',
    activeProjectsCount: 1,
    totalRevenue: 0,
    outstandingBalance: 70800,
    createdAt: '2026-08-20T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    organizationId: INITIAL_ORG.id,
    name: 'Northstar Luxury',
    company: 'Northstar Eco Group',
    email: 'creative@northstar.co',
    phone: '+91 99100 54321',
    currency: 'INR',
    address: 'Connaught Place, New Delhi',
    notes: 'High aesthetic brand film and social campaign.',
    status: 'active',
    activeProjectsCount: 1,
    totalRevenue: 50000,
    outstandingBalance: 97500,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    organizationId: INITIAL_ORG.id,
    name: 'Mountain Labs',
    company: 'Mountain Robotics AI',
    email: 'founders@mountainlabs.ai',
    phone: '+91 97312 99887',
    currency: 'INR',
    address: 'Indiranagar, Bengaluru',
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
    phone: '+91 98111 22334',
    currency: 'INR',
    address: 'Worli Sea Face, Mumbai',
    notes: 'High volume social & trailer campaign partner with recurring quarterly retainers.',
    status: 'active',
    activeProjectsCount: 1,
    totalRevenue: 85000,
    outstandingBalance: 35000,
    createdAt: '2026-08-15T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
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
    budget: 180000,
    currency: 'INR',
    includedRevisions: 2,
    progressPercent: 75,
    clientName: 'Nike India',
    totalHoursTracked: 9.5,
    totalInvoiced: 106200,
    totalPaid: 106200,
    totalExpenses: 8500,
    profit: 97700,
    effectiveHourlyRate: 10284,
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
    budget: 250000,
    currency: 'INR',
    includedRevisions: 2,
    progressPercent: 85,
    clientName: 'Northstar Luxury',
    totalHoursTracked: 4.0,
    totalInvoiced: 147500,
    totalPaid: 50000,
    totalExpenses: 4200,
    profit: 45800,
    effectiveHourlyRate: 11450,
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
    budget: 120000,
    currency: 'INR',
    includedRevisions: 2,
    progressPercent: 40,
    clientName: 'Acme Corp',
    totalHoursTracked: 6.0,
    totalInvoiced: 70800,
    totalPaid: 0,
    totalExpenses: 2500,
    profit: -2500,
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
    budget: 95000,
    currency: 'INR',
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
    budget: 85000,
    currency: 'INR',
    includedRevisions: 2,
    progressPercent: 30,
    clientName: 'Atlas Media',
    totalHoursTracked: 3.5,
    totalInvoiced: 41300,
    totalPaid: 0,
    totalExpenses: 1500,
    profit: -1500,
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
    title: 'Vogue India Campaign',
    clientName: 'Rhea Kapoor',
    company: 'Conde Nast India',
    email: 'rhea@vogueindia.com',
    phone: '+91 98200 99887',
    stage: 'qualified',
    value: 350000,
    currency: 'INR',
    probabilityPercent: 75,
    notes: 'Diwali Fashion Special 3-part commercial reel series.',
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
    stage: 'proposal',
    value: 280000,
    currency: 'INR',
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
    stage: 'negotiation',
    value: 400000,
    currency: 'INR',
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
    stage: 'contacted',
    value: 150000,
    currency: 'INR',
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
    subtotal: 90000,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 18,
    taxAmount: 16200,
    total: 106200,
    totalAmount: 106200,
    amountPaid: 106200,
    balanceDue: 0,
    currency: 'INR',
    clientName: 'Nike India',
    projectName: 'Summer Campaign Film',
    items: [
      {
        id: 'item-1',
        description: 'Pre-production & 60s Hero Cut Direction (50%)',
        quantity: 1,
        unitPrice: 90000,
        amount: 90000,
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
    subtotal: 125000,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 18,
    taxAmount: 22500,
    total: 147500,
    totalAmount: 147500,
    amountPaid: 50000,
    balanceDue: 97500,
    currency: 'INR',
    clientName: 'Northstar Luxury',
    projectName: 'Brand Manifesto Film',
    items: [
      {
        id: 'item-2',
        description: 'Expedition Shoot & Raw Editorial Assembly',
        quantity: 1,
        unitPrice: 125000,
        amount: 125000,
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
    subtotal: 60000,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 18,
    taxAmount: 10800,
    total: 70800,
    totalAmount: 70800,
    amountPaid: 0,
    balanceDue: 70800,
    currency: 'INR',
    clientName: 'Acme Corp',
    projectName: 'Website Redesign & Product Visuals',
    items: [
      {
        id: 'item-3',
        description: 'Landing Page Figma Architecture & Motion Prototyping',
        quantity: 1,
        unitPrice: 60000,
        amount: 60000,
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
    subtotal: 35000,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 18,
    taxAmount: 6300,
    total: 41300,
    totalAmount: 41300,
    amountPaid: 0,
    balanceDue: 41300,
    currency: 'INR',
    clientName: 'Atlas Media',
    projectName: 'Atlas Episodic Social Campaign',
    items: [
      {
        id: 'item-4',
        description: 'Teaser trailer edit & audio mixdown (overdue balance)',
        quantity: 1,
        unitPrice: 35000,
        amount: 35000,
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
    title: 'Review sound mix with sound engineer',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-25',
    clientVisible: true,
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-25T00:00:00Z',
  },
  {
    id: 'task-2',
    organizationId: INITIAL_ORG.id,
    projectId: '027c41fa-8f90-4bac-989d-b5f80652ab0c',
    title: 'Export 9:16 vertical cuts for Instagram & YouTube Shorts',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: '2026-10-02',
    clientVisible: true,
    createdAt: '2026-09-26T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: 'task-3',
    organizationId: INITIAL_ORG.id,
    projectId: '2cb11493-e7a2-4a70-9fc6-44a16807c1f7',
    title: 'Color grade scene 4 in DaVinci Resolve',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-10-01',
    clientVisible: true,
    createdAt: '2026-09-28T00:00:00Z',
    updatedAt: '2026-09-30T00:00:00Z',
  },
  {
    id: 'task-4',
    organizationId: INITIAL_ORG.id,
    projectId: '2afd62bc-89ee-4e7e-a59b-ae571ca9a311',
    title: 'Complete responsive motion interactions in Figma',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-05',
    clientVisible: false,
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
    monthlyAmount: 50000,
    monthlyRate: 50000,
    currency: 'INR',
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
    monthlyAmount: 40000,
    monthlyRate: 40000,
    currency: 'INR',
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
    hourlyRate: 2500,
    billable: true,
    isBillable: true,
    revenueAmount: 11250,
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
    hourlyRate: 2500,
    billable: true,
    isBillable: true,
    revenueAmount: 12500,
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
    hourlyRate: 2500,
    billable: true,
    isBillable: true,
    revenueAmount: 10000,
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
    amount: 8500,
    currency: 'INR',
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
    amount: 4200,
    currency: 'INR',
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
    amount: 2500,
    currency: 'INR',
    date: '2026-09-18',
    isReimbursable: false,
    createdAt: '2026-09-18T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
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
  private payments: Payment[] = [
    {
      id: 'pay-1',
      organizationId: INITIAL_ORG.id,
      invoiceId: 'inv-1',
      clientId: '11111111-1111-1111-1111-111111111111',
      amount: 106200,
      currency: 'INR',
      paymentMethod: 'bank_transfer',
      paymentDate: '2026-09-20',
      reference: 'HDFC-NEFT-99182',
      createdAt: '2026-09-20T00:00:00Z',
    },
    {
      id: 'pay-2',
      organizationId: INITIAL_ORG.id,
      invoiceId: 'inv-2',
      clientId: '44444444-4444-4444-4444-444444444444',
      amount: 50000,
      currency: 'INR',
      paymentMethod: 'upi',
      paymentDate: '2026-09-28',
      reference: 'UPI-NSTAR-3321',
      createdAt: '2026-09-28T00:00:00Z',
    },
  ];
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
        if (data.org) this.org = data.org;
        if (data.clients) this.clients = data.clients;
        if (data.projects) this.projects = data.projects;
        if (data.leads) this.leads = data.leads;
        if (data.invoices) this.invoices = data.invoices;
        if (data.tasks) this.tasks = data.tasks;
        if (data.deliverables) this.deliverables = data.deliverables;
        if (data.approvals) this.approvals = data.approvals;
        if (data.retainers) this.retainers = data.retainers;
        if (data.timeEntries) this.timeEntries = data.timeEntries;
        if (data.expenses) this.expenses = data.expenses;
        if (data.payments) this.payments = data.payments;
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
        org: this.org,
        clients: this.clients,
        projects: this.projects,
        leads: this.leads,
        invoices: this.invoices,
        tasks: this.tasks,
        deliverables: this.deliverables,
        approvals: this.approvals,
        retainers: this.retainers,
        timeEntries: this.timeEntries,
        expenses: this.expenses,
        payments: this.payments,
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
    this.projects = [];
    this.leads = [];
    this.invoices = [];
    this.tasks = [];
    this.deliverables = [];
    this.approvals = [];
    this.retainers = [];
    this.timeEntries = [];
    this.expenses = [];
    this.payments = [];
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
    this.projects = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
    this.leads = JSON.parse(JSON.stringify(INITIAL_LEADS));
    this.invoices = JSON.parse(JSON.stringify(INITIAL_INVOICES));
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.deliverables = JSON.parse(JSON.stringify(INITIAL_DELIVERABLES));
    this.approvals = JSON.parse(JSON.stringify(INITIAL_APPROVALS));
    this.retainers = JSON.parse(JSON.stringify(INITIAL_RETAINERS));
    this.timeEntries = JSON.parse(JSON.stringify(INITIAL_TIME_ENTRIES));
    this.expenses = JSON.parse(JSON.stringify(INITIAL_EXPENSES));
    this.payments = [
      {
        id: 'pay-1',
        organizationId: INITIAL_ORG.id,
        invoiceId: 'inv-1',
        clientId: '11111111-1111-1111-1111-111111111111',
        amount: 106200,
        currency: 'INR',
        paymentMethod: 'bank_transfer',
        paymentDate: '2026-09-20',
        reference: 'HDFC-NEFT-99182',
        createdAt: '2026-09-20T00:00:00Z',
      },
      {
        id: 'pay-2',
        organizationId: INITIAL_ORG.id,
        invoiceId: 'inv-2',
        clientId: '44444444-4444-4444-4444-444444444444',
        amount: 50000,
        currency: 'INR',
        paymentMethod: 'upi',
        paymentDate: '2026-09-28',
        reference: 'UPI-NSTAR-3321',
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
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
    }
    const token = `bearer-token-${this.user.id}`;
    if (typeof window !== 'undefined') {
      try {
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
    this.payments = [];
    this.activeTimer = null;

    this.saveToStorage();
    const token = `bearer-token-${this.user.id}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('freelanceros_auth_token', token);
        localStorage.setItem('freelanceros_current_user', JSON.stringify(this.user));
      } catch {}
    }
    return { token, user: this.user, organization: this.org };
  }

  loginWithGoogle(data: { credential?: string; email?: string; name?: string; picture?: string }) {
    let email = data.email || 'nimish.prabhu@gmail.com';
    let name = data.name || 'Nimish Prabhu';
    let picture = data.picture || null;

    if (data.credential) {
      try {
        const parts = data.credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))));
          if (payload.email) email = payload.email;
          if (payload.name) name = payload.name;
          if (payload.picture) picture = payload.picture;
        }
      } catch {
        // fallback to provided values
      }
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
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    const token = `google-token-${this.user.id}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('freelanceros_auth_token', token);
        localStorage.setItem('freelanceros_current_user', JSON.stringify(this.user));
      } catch {}
    }
    return { token, user: this.user, organization: this.org };
  }

  logout() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('freelanceros_auth_token');
        localStorage.removeItem('freelanceros_current_user');
      } catch {}
    }
    return { message: 'Logged out successfully' };
  }

  getCurrentOrg() {
    return this.org;
  }

  updateOrg(data: Partial<Organization>) {
    this.org = { ...this.org, ...data, updatedAt: new Date().toISOString() };
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
          title: `Invoice overdue: ${inv.clientName || 'Client'} (₹${(inv.balanceDue || 0).toLocaleString()})`,
          description: `${inv.invoiceNumber} was due on ${inv.dueDate}. Balance ₹${(inv.balanceDue || 0).toLocaleString()} pending.`,
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
        description: 'Recorded payment of ₹50,000 for Northstar Luxury',
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
    return {
      ...client,
      projects: clientProjects,
      invoices: clientInvoices,
      payments: clientPayments,
    };
  }

  createClient(data: any) {
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
    return [
      {
        id: 'prop-1',
        organizationId: this.org.id,
        proposalNumber: 'PROP-2026-001',
        clientId: '11111111-1111-1111-1111-111111111111',
        title: 'Q4 Global Brand Film Proposal',
        status: 'sent',
        subtotal: 240000,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 240000,
        total: 240000,
        currency: 'INR',
        validUntil: '2026-10-15',
        clientName: 'Nike India',
        items: [{ id: 'pi-1', description: 'Direction & Post-Production', quantity: 1, unitPrice: 240000, amount: 240000 }],
        createdAt: '2026-09-20T00:00:00Z',
        updatedAt: '2026-09-20T00:00:00Z',
      },
    ];
  }

  createProposal(data: any): Proposal {
    const client = this.clients.find((c) => c.id === data.clientId);
    const total = Number(data.items?.[0]?.unitPrice || 75000);
    return {
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
  }

  listQuotes(): Quote[] {
    return [
      {
        id: 'quote-1',
        organizationId: this.org.id,
        clientId: '33333333-3333-3333-3333-333333333333',
        quoteNumber: 'Q-2026-01',
        title: 'Motion Assets Package Quote',
        status: 'accepted',
        subtotal: 85000,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 85000,
        total: 85000,
        currency: 'INR',
        validUntil: '2026-10-10',
        clientName: 'Acme Corp',
        items: [{ id: 'qi-1', description: 'Motion Design Package', quantity: 1, unitPrice: 85000, amount: 85000 }],
        createdAt: '2026-09-18T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
    ];
  }

  createQuote(data: any): Quote {
    const client = this.clients.find((c) => c.id === data.clientId);
    const total = Number(data.items?.[0]?.unitPrice || 60000);
    return {
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
  }

  listContracts(): Contract[] {
    return [
      {
        id: 'cont-1',
        organizationId: this.org.id,
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
  }

  createContract(data: any): Contract {
    const client = this.clients.find((c) => c.id === data.clientId);
    return {
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
  }

  signContract(id: string, signerName: string) {
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
}

export const mockStorage = new MockStorage();
