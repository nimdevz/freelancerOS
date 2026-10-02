import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './database/schema';

export async function seedDemoData(db: any) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const pastDate = (days: number) =>
    new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const futureDate = (days: number) =>
    new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

  const userId = '11111111-1111-1111-1111-111111111111';
  const orgId = '22222222-2222-2222-2222-222222222222';

  // 1. User
  await db.insert(schema.users).values({
    id: userId,
    email: 'nimish@freelanceros.com',
    firstName: 'Nimish',
    lastName: 'Prabhu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'owner',
    createdAt: pastDate(60),
    updatedAt: todayStr,
  }).onConflictDoNothing();

  // 2. Organization
  await db.insert(schema.organizations).values({
    id: orgId,
    name: 'Nimish Studio',
    slug: 'nimish-studio',
    currency: 'USD',
    timezone: 'Asia/Kolkata',
    defaultPaymentTermsDays: 14,
    taxRatePercent: 18,
    plan: 'pro',
    freelancerType: 'video_editor',
    hourlyRate: 150,
    createdAt: pastDate(60),
    updatedAt: todayStr,
  }).onConflictDoNothing();

  await db.insert(schema.organizationMembers).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    userId,
    role: 'owner',
    createdAt: pastDate(60),
  }).onConflictDoNothing();

  // 3. Clients
  const clientNike = crypto.randomUUID();
  const clientAcme = crypto.randomUUID();
  const clientNorthstar = crypto.randomUUID();
  const clientMountain = crypto.randomUUID();

  await db.insert(schema.clients).values([
    {
      id: clientNike,
      organizationId: orgId,
      name: 'Nike India',
      company: 'Nike, Inc.',
      email: 'campaigns@nike.com',
      phone: '+91 98201 12345',
      currency: 'USD',
      address: 'One Bowerman Drive, Bengaluru Campus',
      notes: 'High priority brand partner. Strict turnaround for product launches.',
      status: 'active',
      createdAt: pastDate(50),
      updatedAt: pastDate(1),
    },
    {
      id: clientAcme,
      organizationId: orgId,
      name: 'Acme Corp',
      company: 'Acme Technologies',
      email: 'product@acmecorp.io',
      phone: '+91 98450 67890',
      currency: 'USD',
      address: 'Bandra Kurla Complex, Mumbai',
      notes: 'Fintech product design and marketing video series.',
      status: 'active',
      createdAt: pastDate(40),
      updatedAt: pastDate(2),
    },
    {
      id: clientNorthstar,
      organizationId: orgId,
      name: 'Northstar Luxury',
      company: 'Northstar Eco Group',
      email: 'creative@northstar.co',
      phone: '+91 99100 54321',
      currency: 'USD',
      address: 'Connaught Place, New Delhi',
      notes: 'High aesthetic brand film and social campaign.',
      status: 'active',
      createdAt: pastDate(30),
      updatedAt: pastDate(3),
    },
    {
      id: clientMountain,
      organizationId: orgId,
      name: 'Mountain Labs',
      company: 'Mountain Robotics AI',
      email: 'founders@mountainlabs.ai',
      phone: '+91 97312 99887',
      currency: 'USD',
      address: 'Indiranagar, Bengaluru',
      notes: 'Deep tech AI hardware robotics launch.',
      status: 'active',
      createdAt: pastDate(20),
      updatedAt: pastDate(5),
    },
  ]).onConflictDoNothing();

  // 4. Projects
  const projNike = crypto.randomUUID();
  const projNorthstar = crypto.randomUUID();
  const projAcme = crypto.randomUUID();
  const projMountain = crypto.randomUUID();

  await db.insert(schema.projects).values([
    {
      id: projNike,
      organizationId: orgId,
      clientId: clientNike,
      name: 'Summer Campaign Film',
      code: 'PRJ-101',
      description: '60s Hero Commercial + 3 vertical cuts for Instagram and YouTube Shorts.',
      status: 'active',
      health: 'healthy',
      startDate: pastDate(20),
      deadline: futureDate(5),
      budget: 180000,
      currency: 'USD',
      includedRevisions: 2,
      progressPercent: 75,
      createdAt: pastDate(20),
      updatedAt: pastDate(1),
    },
    {
      id: projNorthstar,
      organizationId: orgId,
      clientId: clientNorthstar,
      name: 'Brand Manifesto Film',
      code: 'PRJ-102',
      description: 'Cinematic documentary brand film shot in Ladakh and Himalayas.',
      status: 'review',
      health: 'at_risk',
      healthReason: 'Revisions exceed included scope (Revision 3 in progress)',
      startDate: pastDate(35),
      deadline: futureDate(2),
      budget: 250000,
      currency: 'USD',
      includedRevisions: 2,
      progressPercent: 85,
      createdAt: pastDate(35),
      updatedAt: pastDate(1),
    },
    {
      id: projAcme,
      organizationId: orgId,
      clientId: clientAcme,
      name: 'Website Redesign & Product Visuals',
      code: 'PRJ-103',
      description: 'Complete visual overhaul of landing page with custom motion graphics.',
      status: 'active',
      health: 'healthy',
      startDate: pastDate(15),
      deadline: futureDate(12),
      budget: 120000,
      currency: 'USD',
      includedRevisions: 2,
      progressPercent: 40,
      createdAt: pastDate(15),
      updatedAt: pastDate(2),
    },
    {
      id: projMountain,
      organizationId: orgId,
      clientId: clientMountain,
      name: 'Robotics Demo Social Campaign',
      code: 'PRJ-104',
      description: 'Weekly teaser clips and founder interview series.',
      status: 'planning',
      health: 'healthy',
      startDate: pastDate(5),
      deadline: futureDate(25),
      budget: 95000,
      currency: 'USD',
      includedRevisions: 2,
      progressPercent: 15,
      createdAt: pastDate(5),
      updatedAt: pastDate(4),
    },
  ]).onConflictDoNothing();

  // 5. Tasks
  await db.insert(schema.tasks).values([
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      projectId: projNike,
      title: 'Color grade final 4K cut in DaVinci Resolve',
      description: 'Match contrast ratio and film grain for outdoor desert shots.',
      status: 'in_progress',
      priority: 'high',
      dueDate: futureDate(1),
      estimatedHours: 6,
      actualHours: 4,
      clientVisible: 1,
      tags: JSON.stringify(['Color Grade', 'Post-Production']),
      createdAt: pastDate(5),
      updatedAt: todayStr,
    },
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      projectId: projNike,
      title: 'Export 9:16 vertical cuts for Reels and TikTok',
      description: 'Reposition action framing and burnt-in subtitles.',
      status: 'todo',
      priority: 'medium',
      dueDate: futureDate(3),
      estimatedHours: 3,
      actualHours: 0,
      clientVisible: 0,
      tags: JSON.stringify(['Exports', 'Social']),
      createdAt: pastDate(3),
      updatedAt: todayStr,
    },
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      projectId: projNorthstar,
      title: 'Address director feedback on pacing for Scene 4',
      description: 'Trim 2.5 seconds before dialogue entrance.',
      status: 'review',
      priority: 'urgent',
      dueDate: futureDate(1),
      estimatedHours: 2,
      actualHours: 2,
      clientVisible: 1,
      tags: JSON.stringify(['Revision', 'Director Cut']),
      createdAt: pastDate(2),
      updatedAt: todayStr,
    },
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      projectId: projAcme,
      title: 'Interactive 3D component renders in Blender',
      description: 'Render glass-card refraction for features section.',
      status: 'in_progress',
      priority: 'high',
      dueDate: futureDate(4),
      estimatedHours: 8,
      actualHours: 5,
      clientVisible: 1,
      tags: JSON.stringify(['3D', 'Motion']),
      createdAt: pastDate(7),
      updatedAt: todayStr,
    },
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      projectId: projAcme,
      title: 'Initial wireframes and typography pairing approved',
      description: 'Client sign-off achieved.',
      status: 'done',
      priority: 'medium',
      dueDate: pastDate(3),
      estimatedHours: 10,
      actualHours: 9,
      clientVisible: 1,
      tags: JSON.stringify(['Design', 'Approved']),
      createdAt: pastDate(12),
      updatedAt: pastDate(3),
    },
  ]).onConflictDoNothing();

  // 6. Deliverables & Versions
  const delivNike = crypto.randomUUID();
  const delivNorthstar = crypto.randomUUID();

  await db.insert(schema.deliverables).values([
    {
      id: delivNike,
      organizationId: orgId,
      projectId: projNike,
      title: 'Summer Campaign Hero 60s Cut',
      description: 'Master ProRes 422HQ edit with initial sound mix.',
      status: 'client_review',
      currentVersion: 'V2',
      includedRevisions: 2,
      createdAt: pastDate(10),
      updatedAt: pastDate(1),
    },
    {
      id: delivNorthstar,
      organizationId: orgId,
      projectId: projNorthstar,
      title: 'Brand Manifesto Film (Director Cut)',
      description: 'Complete 3-minute cinematic cut.',
      status: 'revision',
      currentVersion: 'V3',
      includedRevisions: 2,
      createdAt: pastDate(25),
      updatedAt: pastDate(1),
    },
  ]).onConflictDoNothing();

  await db.insert(schema.deliverableVersions).values([
    {
      id: crypto.randomUUID(),
      deliverableId: delivNike,
      versionNumber: 'V1',
      fileName: 'Nike_Summer_Hero_V1.mp4',
      fileSize: 184500000,
      notes: 'First offline assembly edit.',
      status: 'revision',
      uploadedAt: pastDate(8),
    },
    {
      id: crypto.randomUUID(),
      deliverableId: delivNike,
      versionNumber: 'V2',
      fileName: 'Nike_Summer_Hero_V2_ColorGraded.mp4',
      fileSize: 215000000,
      notes: 'Added sound design, licensed music, and primary color pass.',
      status: 'client_review',
      uploadedAt: pastDate(1),
    },
    {
      id: crypto.randomUUID(),
      deliverableId: delivNorthstar,
      versionNumber: 'V1',
      fileName: 'Northstar_Manifesto_V1.mp4',
      fileSize: 320000000,
      notes: 'Rough cut assembly.',
      status: 'revision',
      uploadedAt: pastDate(20),
    },
    {
      id: crypto.randomUUID(),
      deliverableId: delivNorthstar,
      versionNumber: 'V2',
      fileName: 'Northstar_Manifesto_V2.mp4',
      fileSize: 340000000,
      notes: 'Addressed note on pacing and title cards.',
      status: 'revision',
      uploadedAt: pastDate(10),
    },
    {
      id: crypto.randomUUID(),
      deliverableId: delivNorthstar,
      versionNumber: 'V3',
      fileName: 'Northstar_Manifesto_V3_Color.mp4',
      fileSize: 350000000,
      notes: 'Requested change on narrator tone and music outro.',
      status: 'client_review',
      uploadedAt: pastDate(1),
    },
  ]).onConflictDoNothing();

  // 7. Invoices & Items
  const invPaid = crypto.randomUUID();
  const invSent = crypto.randomUUID();
  const invOverdue = crypto.randomUUID();

  await db.insert(schema.invoices).values([
    {
      id: invPaid,
      organizationId: orgId,
      clientId: clientNike,
      projectId: projNike,
      invoiceNumber: 'INV-2026-001',
      title: 'Summer Campaign Advance Retainer (50%)',
      status: 'paid',
      issueDate: pastDate(20),
      dueDate: pastDate(6),
      currency: 'USD',
      subtotal: 90000,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 18,
      taxAmount: 16200,
      totalAmount: 106200,
      amountPaid: 106200,
      balanceDue: 0,
      paymentTerms: 'Net 14',
      notes: 'Thank you for your business. Advance payment for Summer 2026 project.',
      sentAt: pastDate(20),
      paidAt: pastDate(10),
      createdAt: pastDate(20),
      updatedAt: pastDate(10),
    },
    {
      id: invSent,
      organizationId: orgId,
      clientId: clientAcme,
      projectId: projAcme,
      invoiceNumber: 'INV-2026-002',
      title: 'Website Redesign Milestone 1',
      status: 'sent',
      issueDate: pastDate(7),
      dueDate: futureDate(7),
      currency: 'USD',
      subtotal: 60000,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 18,
      taxAmount: 10800,
      totalAmount: 70800,
      amountPaid: 0,
      balanceDue: 70800,
      paymentTerms: 'Net 14',
      notes: 'Milestone 1 design sign-off invoice.',
      sentAt: pastDate(7),
      createdAt: pastDate(7),
      updatedAt: pastDate(7),
    },
    {
      id: invOverdue,
      organizationId: orgId,
      clientId: clientNorthstar,
      projectId: projNorthstar,
      invoiceNumber: 'INV-2026-003',
      title: 'Brand Film Production Advance',
      status: 'overdue',
      issueDate: pastDate(30),
      dueDate: pastDate(5),
      currency: 'USD',
      subtotal: 125000,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 18,
      taxAmount: 22500,
      totalAmount: 147500,
      amountPaid: 50000,
      balanceDue: 97500,
      paymentTerms: 'Net 14',
      notes: 'First milestone advance overdue. Immediate reminder generated.',
      sentAt: pastDate(30),
      createdAt: pastDate(30),
      updatedAt: pastDate(5),
    },
  ]).onConflictDoNothing();

  await db.insert(schema.invoiceItems).values([
    {
      id: crypto.randomUUID(),
      invoiceId: invPaid,
      description: 'Pre-production planning, creative director deck & script lock',
      quantity: 1,
      unitPrice: 40000,
      amount: 40000,
    },
    {
      id: crypto.randomUUID(),
      invoiceId: invPaid,
      description: 'Principal editing & rough cut delivery (50% upfront)',
      quantity: 1,
      unitPrice: 50000,
      amount: 50000,
    },
    {
      id: crypto.randomUUID(),
      invoiceId: invSent,
      description: 'UX Wireframing & typography system lock',
      quantity: 1,
      unitPrice: 60000,
      amount: 60000,
    },
    {
      id: crypto.randomUUID(),
      invoiceId: invOverdue,
      description: 'Himalayan cinematic shoot edit & sound scape design',
      quantity: 1,
      unitPrice: 125000,
      amount: 125000,
    },
  ]).onConflictDoNothing();

  // 8. Proposals
  const propNike = crypto.randomUUID();
  const propMountain = crypto.randomUUID();

  await db.insert(schema.proposals).values([
    {
      id: propNike,
      organizationId: orgId,
      clientId: clientNike,
      projectId: projNike,
      proposalNumber: 'PROP-2026-101',
      title: 'Summer 2026 Video Campaign Proposal',
      status: 'accepted',
      validUntil: pastDate(15),
      currency: 'USD',
      subtotal: 180000,
      discountPercent: 5,
      discountAmount: 9000,
      taxPercent: 18,
      taxAmount: 30780,
      totalAmount: 201780,
      terms: 'Payment 50% upfront, 50% upon delivery of final masters. 2 revision cycles included.',
      notes: 'Standard project proposal accepted by marketing team.',
      sentAt: pastDate(25),
      acceptedAt: pastDate(22),
      createdAt: pastDate(25),
      updatedAt: pastDate(22),
    },
    {
      id: propMountain,
      organizationId: orgId,
      clientId: clientMountain,
      projectId: projMountain,
      proposalNumber: 'PROP-2026-102',
      title: 'Robotics Product Launch Social Pack',
      status: 'sent',
      validUntil: futureDate(7),
      currency: 'USD',
      subtotal: 95000,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 18,
      taxAmount: 17100,
      totalAmount: 112100,
      terms: 'Deliverable schedule: 4 short video clips across 3 weeks.',
      notes: 'Awaiting founder sign-off before shoot dates.',
      sentAt: pastDate(3),
      createdAt: pastDate(3),
      updatedAt: pastDate(3),
    },
  ]).onConflictDoNothing();

  // 9. Leads
  await db.insert(schema.leads).values([
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      title: 'Brand Refresh & Social Content Pack',
      clientName: 'Kite FinTech',
      company: 'Kite Technologies Ltd',
      email: 'growth@kite.in',
      phone: '+91 99887 11223',
      stage: 'proposal',
      value: 150000,
      currency: 'USD',
      probabilityPercent: 75,
      expectedCloseDate: futureDate(10),
      nextAction: 'Follow up on proposal deck review',
      nextActionDate: futureDate(2),
      source: 'Twitter / X',
      notes: 'Inbound referral from Acme Corp designer.',
      createdAt: pastDate(6),
      updatedAt: todayStr,
    },
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      title: 'Product Launch Keynote Teaser Film',
      clientName: 'HyperSpeed EV',
      company: 'HyperSpeed Mobility',
      email: 'media@hyperspeed.io',
      phone: '+91 91234 56789',
      stage: 'qualified',
      value: 220000,
      currency: 'USD',
      probabilityPercent: 60,
      expectedCloseDate: futureDate(18),
      nextAction: 'Schedule scoping call with Founder',
      nextActionDate: futureDate(3),
      source: 'LinkedIn',
      notes: 'High-budget commercial teaser film for electric hypercar reveal.',
      createdAt: pastDate(12),
      updatedAt: todayStr,
    },
  ]).onConflictDoNothing();

  // 10. Notifications
  await db.insert(schema.notifications).values([
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      type: 'invoice_overdue',
      title: 'Invoice INV-2026-003 is Overdue',
      message: 'Northstar Luxury owes $97,500. Due date was 5 days ago.',
      entityType: 'invoice',
      entityId: invOverdue,
      isRead: 0,
      createdAt: pastDate(1),
    },
    {
      id: crypto.randomUUID(),
      organizationId: orgId,
      type: 'revision_limit',
      title: 'Revision Scope Exceeded',
      message: 'Revision 3 requested for "Brand Manifesto Film" (2 included in agreement).',
      entityType: 'deliverable',
      entityId: delivNorthstar,
      isRead: 0,
      createdAt: pastDate(1),
    },
  ]).onConflictDoNothing();

  return {
    message: 'Demo workspace successfully seeded with realistic studio data.',
    workspace: 'Nimish Studio',
  };
}

async function runCli() {
  const url = process.env.TURSO_DATABASE_URL || 'file:data/freelanceros.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log(`Connecting to Turso / libSQL at ${url}...`);
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  const result = await seedDemoData(db);
  console.log(result.message);
  process.exit(0);
}

if (typeof require !== 'undefined' && require.main === module) {
  runCli().catch((err) => {
    console.error('Seed script failed:', err);
    process.exit(1);
  });
}
