import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  users,
  organizations,
  organizationMembers,
  clients,
  projects,
  tasks,
  timeEntries,
  proposals,
  proposalItems,
  invoices,
  invoiceItems,
  payments,
  expenses,
  retainers,
  deliverables,
  deliverableVersions,
  revisions,
  approvals,
  notifications,
  activityLogs,
  leads,
} from '../../database/schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dbService: DatabaseService) {}

  async seedDemoData() {
    this.logger.log('Seeding realistic demo content for Nimish Studio...');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const pastDate = (days: number) =>
      new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const futureDate = (days: number) =>
      new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

    // Clear existing data cleanly
    const ddl = `
      DELETE FROM activity_logs;
      DELETE FROM notifications;
      DELETE FROM retainers;
      DELETE FROM expenses;
      DELETE FROM payments;
      DELETE FROM invoice_items;
      DELETE FROM invoices;
      DELETE FROM approvals;
      DELETE FROM revisions;
      DELETE FROM feedback_items;
      DELETE FROM deliverable_versions;
      DELETE FROM deliverables;
      DELETE FROM contracts;
      DELETE FROM quote_items;
      DELETE FROM quotes;
      DELETE FROM proposal_items;
      DELETE FROM proposals;
      DELETE FROM time_entries;
      DELETE FROM tasks;
      DELETE FROM projects;
      DELETE FROM leads;
      DELETE FROM client_contacts;
      DELETE FROM clients;
      DELETE FROM organization_members;
      DELETE FROM organizations;
      DELETE FROM users;
    `;
    await (this.dbService as any).client.exec(ddl);

    // 1. User
    const userId = '11111111-1111-1111-1111-111111111111';
    await this.dbService.db.insert(users).values({
      id: userId,
      email: 'nimish@freelanceros.com',
      firstName: 'Nimish',
      lastName: 'Prabhu',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'owner',
      createdAt: pastDate(60),
      updatedAt: todayStr,
    });

    // 2. Organization: Nimish Studio
    const orgId = '22222222-2222-2222-2222-222222222222';
    await this.dbService.db.insert(organizations).values({
      id: orgId,
      name: 'Nimish Studio',
      slug: 'nimish-studio',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      defaultPaymentTermsDays: 14,
      taxRatePercent: 18,
      plan: 'pro',
      freelancerType: 'video_editor',
      hourlyRate: 2500,
      createdAt: pastDate(60),
      updatedAt: todayStr,
    });

    await this.dbService.db.insert(organizationMembers).values({
      id: uuidv4(),
      organizationId: orgId,
      userId,
      role: 'owner',
      createdAt: pastDate(60),
    });

    // 3. Clients: Nike, Acme, Northstar, Mountain Labs
    const clientNike = uuidv4();
    const clientAcme = uuidv4();
    const clientNorthstar = uuidv4();
    const clientMountain = uuidv4();

    await this.dbService.db.insert(clients).values([
      {
        id: clientNike,
        organizationId: orgId,
        name: 'Nike India',
        company: 'Nike, Inc.',
        email: 'campaigns@nike.com',
        phone: '+91 98201 12345',
        currency: 'INR',
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
        currency: 'INR',
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
        currency: 'INR',
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
        currency: 'INR',
        address: 'Indiranagar, Bengaluru',
        notes: 'Deep tech AI hardware robotics launch.',
        status: 'active',
        createdAt: pastDate(20),
        updatedAt: pastDate(5),
      },
    ]);

    // 4. Projects: Summer Campaign, Brand Film, Website Redesign, Social Campaign
    const projNike = uuidv4();
    const projNorthstar = uuidv4();
    const projAcme = uuidv4();
    const projMountain = uuidv4();

    await this.dbService.db.insert(projects).values([
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
        currency: 'INR',
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
        currency: 'INR',
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
        currency: 'INR',
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
        currency: 'INR',
        includedRevisions: 2,
        progressPercent: 15,
        createdAt: pastDate(5),
        updatedAt: pastDate(4),
      },
    ]);

    // 5. Tasks
    await this.dbService.db.insert(tasks).values([
      {
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
    ]);

    // 6. Deliverables, Versions & Scope-Exceeded Revision
    const delivNike = uuidv4();
    const delivNorthstar = uuidv4();

    await this.dbService.db.insert(deliverables).values([
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
    ]);

    await this.dbService.db.insert(deliverableVersions).values([
      {
        id: uuidv4(),
        deliverableId: delivNike,
        versionNumber: 'V1',
        fileName: 'Nike_Summer_Hero_V1.mp4',
        fileSize: 184500000,
        notes: 'First offline assembly edit.',
        status: 'revision',
        uploadedAt: pastDate(8),
      },
      {
        id: uuidv4(),
        deliverableId: delivNike,
        versionNumber: 'V2',
        fileName: 'Nike_Summer_Hero_V2_ColorGraded.mp4',
        fileSize: 215000000,
        notes: 'Added sound design, licensed music, and primary color pass.',
        status: 'client_review',
        uploadedAt: pastDate(1),
      },
      {
        id: uuidv4(),
        deliverableId: delivNorthstar,
        versionNumber: 'V1',
        fileName: 'Northstar_Manifesto_V1.mp4',
        fileSize: 320000000,
        notes: 'Rough cut assembly.',
        status: 'revision',
        uploadedAt: pastDate(20),
      },
      {
        id: uuidv4(),
        deliverableId: delivNorthstar,
        versionNumber: 'V2',
        fileName: 'Northstar_Manifesto_V2.mp4',
        fileSize: 340000000,
        notes: 'Addressed note on pacing and title cards.',
        status: 'revision',
        uploadedAt: pastDate(10),
      },
      {
        id: uuidv4(),
        deliverableId: delivNorthstar,
        versionNumber: 'V3',
        fileName: 'Northstar_Manifesto_V3_Color.mp4',
        fileSize: 350000000,
        notes: 'Requested change on narrator tone and music outro.',
        status: 'client_review',
        uploadedAt: pastDate(1),
      },
    ]);

    // Revisions tracking:
    // Revision 1 of 2
    await this.dbService.db.insert(revisions).values([
      {
        id: uuidv4(),
        organizationId: orgId,
        projectId: projNorthstar,
        deliverableId: delivNorthstar,
        revisionNumber: 1,
        maxIncluded: 2,
        isScopeExceeded: 0,
        requestDetails: 'Shorten opening landscape montage by 8 seconds.',
        requestedBy: 'Creative Director',
        requestedAt: pastDate(18),
        status: 'completed',
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        projectId: projNorthstar,
        deliverableId: delivNorthstar,
        revisionNumber: 2,
        maxIncluded: 2,
        isScopeExceeded: 0,
        requestDetails: 'Adjust sound level on mountain breeze ambient audio.',
        requestedBy: 'Marketing Lead',
        requestedAt: pastDate(8),
        status: 'completed',
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        projectId: projNorthstar,
        deliverableId: delivNorthstar,
        revisionNumber: 3,
        maxIncluded: 2,
        isScopeExceeded: 1, // OUTSIDE AGREED SCOPE!
        requestDetails: 'Swap entire soundtrack in Scene 3 and re-record voiceover narrator line.',
        requestedBy: 'Brand Director',
        requestedAt: pastDate(1),
        status: 'in_progress',
      },
    ]);

    // Approvals:
    const approvalNike = uuidv4();
    await this.dbService.db.insert(approvals).values([
      {
        id: approvalNike,
        organizationId: orgId,
        projectId: projNike,
        deliverableId: delivNike,
        versionNumber: 'V2',
        status: 'pending',
        requestedAt: pastDate(1),
      },
    ]);

    // 7. Time tracking
    await this.dbService.db.insert(timeEntries).values([
      {
        id: uuidv4(),
        organizationId: orgId,
        projectId: projNike,
        description: 'Footage ingest, proxy creation, and initial timeline select reels',
        startTime: `${pastDate(15)}T10:00:00Z`,
        endTime: `${pastDate(15)}T14:30:00Z`,
        durationMinutes: 270,
        billable: 1,
        hourlyRate: 2500,
        isRunning: 0,
        createdAt: pastDate(15),
        updatedAt: pastDate(15),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        projectId: projNike,
        description: 'Sound design, foley sync, and EQ mastering',
        startTime: `${pastDate(5)}T11:00:00Z`,
        endTime: `${pastDate(5)}T16:00:00Z`,
        durationMinutes: 300,
        billable: 1,
        hourlyRate: 2500,
        isRunning: 0,
        createdAt: pastDate(5),
        updatedAt: pastDate(5),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        projectId: projNorthstar,
        description: 'Cinematic color grade pass in DaVinci Resolve',
        startTime: `${pastDate(9)}T14:00:00Z`,
        endTime: `${pastDate(9)}T18:00:00Z`,
        durationMinutes: 240,
        billable: 1,
        hourlyRate: 2500,
        isRunning: 0,
        createdAt: pastDate(9),
        updatedAt: pastDate(9),
      },
    ]);

    // 8. Invoices: Mix of Paid, Sent, and Overdue
    const invPaid = uuidv4();
    const invSent = uuidv4();
    const invOverdue = uuidv4();

    await this.dbService.db.insert(invoices).values([
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
        currency: 'INR',
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
        currency: 'INR',
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
        dueDate: pastDate(5), // 5 days past due!
        currency: 'INR',
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
    ]);

    await this.dbService.db.insert(invoiceItems).values([
      {
        id: uuidv4(),
        invoiceId: invPaid,
        description: 'Pre-production planning, creative director deck & script lock',
        quantity: 1,
        unitPrice: 40000,
        amount: 40000,
      },
      {
        id: uuidv4(),
        invoiceId: invPaid,
        description: 'Principal editing & rough cut delivery (50% upfront)',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000,
      },
      {
        id: uuidv4(),
        invoiceId: invSent,
        description: 'UX Wireframing & typography system lock',
        quantity: 1,
        unitPrice: 60000,
        amount: 60000,
      },
      {
        id: uuidv4(),
        invoiceId: invOverdue,
        description: 'Himalayan cinematic shoot edit & sound scape design',
        quantity: 1,
        unitPrice: 125000,
        amount: 125000,
      },
    ]);

    // 9. Payments
    await this.dbService.db.insert(payments).values([
      {
        id: uuidv4(),
        organizationId: orgId,
        invoiceId: invPaid,
        clientId: clientNike,
        amount: 106200,
        currency: 'INR',
        paymentMethod: 'bank_transfer',
        paymentDate: pastDate(10),
        reference: 'HDFC-NEFT-908123',
        notes: 'Full payment received via corporate bank transfer.',
        createdAt: pastDate(10),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        invoiceId: invOverdue,
        clientId: clientNorthstar,
        amount: 50000,
        currency: 'INR',
        paymentMethod: 'upi',
        paymentDate: pastDate(25),
        reference: 'UPI/2026/894012',
        notes: 'Initial token deposit payment.',
        createdAt: pastDate(25),
      },
    ]);

    // 10. Expenses
    await this.dbService.db.insert(expenses).values([
      {
        id: uuidv4(),
        organizationId: orgId,
        date: pastDate(18),
        vendor: 'Musicbed',
        category: 'marketing',
        amount: 8500,
        currency: 'INR',
        projectId: projNike,
        clientId: clientNike,
        notes: 'Commercial music sync license for 60s broadcast spot.',
        isReimbursable: 1,
        createdAt: pastDate(18),
        updatedAt: pastDate(18),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        date: pastDate(12),
        vendor: 'Frame.io / Adobe Cloud',
        category: 'software',
        amount: 4200,
        currency: 'INR',
        projectId: projNorthstar,
        clientId: clientNorthstar,
        notes: 'Monthly video review hosting & Creative Cloud seats.',
        isReimbursable: 0,
        createdAt: pastDate(12),
        updatedAt: pastDate(12),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        date: pastDate(4),
        vendor: 'Envato Elements',
        category: 'software',
        amount: 2500,
        currency: 'INR',
        projectId: projAcme,
        clientId: clientAcme,
        notes: '3D motion graphic textures & UI SFX assets.',
        isReimbursable: 0,
        createdAt: pastDate(4),
        updatedAt: pastDate(4),
      },
    ]);

    // 11. Proposals
    const propNike = uuidv4();
    const propMountain = uuidv4();

    await this.dbService.db.insert(proposals).values([
      {
        id: propNike,
        organizationId: orgId,
        clientId: clientNike,
        projectId: projNike,
        proposalNumber: 'PROP-2026-101',
        title: 'Summer 2026 Video Campaign Proposal',
        status: 'accepted',
        validUntil: pastDate(15),
        currency: 'INR',
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
        currency: 'INR',
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
    ]);

    await this.dbService.db.insert(proposalItems).values([
      {
        id: uuidv4(),
        proposalId: propNike,
        description: 'Creative Direction & Storyboarding',
        quantity: 1,
        unitPrice: 40000,
        amount: 40000,
      },
      {
        id: uuidv4(),
        proposalId: propNike,
        description: 'Editing, Color Grading & Sound Mix (Master + Cutdowns)',
        quantity: 1,
        unitPrice: 140000,
        amount: 140000,
      },
      {
        id: uuidv4(),
        proposalId: propMountain,
        description: 'AI Robotics hardware product demo video series (4 clips)',
        quantity: 4,
        unitPrice: 23750,
        amount: 95000,
      },
    ]);

    // 12. Leads
    await this.dbService.db.insert(leads).values([
      {
        id: uuidv4(),
        organizationId: orgId,
        title: 'Brand Refresh & Social Content Pack',
        clientName: 'Kite FinTech',
        company: 'Kite Technologies Ltd',
        email: 'growth@kite.in',
        phone: '+91 99887 11223',
        stage: 'proposal',
        value: 150000,
        currency: 'INR',
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
        id: uuidv4(),
        organizationId: orgId,
        title: 'Product Launch Keynote Teaser Film',
        clientName: 'HyperSpeed EV',
        company: 'HyperSpeed Mobility',
        email: 'media@hyperspeed.io',
        phone: '+91 91234 56789',
        stage: 'qualified',
        value: 220000,
        currency: 'INR',
        probabilityPercent: 60,
        expectedCloseDate: futureDate(18),
        nextAction: 'Schedule scoping call with Founder',
        nextActionDate: futureDate(3),
        source: 'LinkedIn',
        notes: 'High-budget commercial teaser film for electric hypercar reveal.',
        createdAt: pastDate(12),
        updatedAt: todayStr,
      },
    ]);

    // 13. Retainers
    await this.dbService.db.insert(retainers).values([
      {
        id: uuidv4(),
        organizationId: orgId,
        clientId: clientNike,
        monthlyAmount: 80000,
        currency: 'INR',
        includedHours: 30,
        usedHours: 18.5,
        startDate: pastDate(30),
        renewalDate: futureDate(15),
        status: 'active',
        createdAt: pastDate(30),
        updatedAt: todayStr,
      },
    ]);

    // 14. Notifications (Actionable)
    await this.dbService.db.insert(notifications).values([
      {
        id: uuidv4(),
        organizationId: orgId,
        type: 'invoice_overdue',
        title: 'Invoice INV-2026-003 is Overdue',
        message: 'Northstar Luxury owes ₹97,500. Due date was 5 days ago.',
        entityType: 'invoice',
        entityId: invOverdue,
        isRead: 0,
        createdAt: pastDate(1),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        type: 'revision_limit',
        title: 'Revision Scope Exceeded',
        message: 'Revision 3 requested for "Brand Manifesto Film" (2 included in agreement).',
        entityType: 'deliverable',
        entityId: delivNorthstar,
        isRead: 0,
        createdAt: pastDate(1),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        type: 'proposal_expiring',
        title: 'Proposal Expiring Soon',
        message: 'Proposal PROP-2026-102 for Mountain Labs expires in 7 days.',
        entityType: 'proposal',
        entityId: propMountain,
        isRead: 0,
        createdAt: pastDate(2),
      },
    ]);

    // 15. Activity logs
    await this.dbService.db.insert(activityLogs).values([
      {
        id: uuidv4(),
        organizationId: orgId,
        entityType: 'invoice',
        entityId: invPaid,
        action: 'paid',
        description: 'Invoice INV-2026-001 marked fully paid (₹1,06,200 via Bank Transfer)',
        metadata: '{}',
        createdAt: pastDate(10),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        entityType: 'deliverable',
        entityId: delivNike,
        action: 'version_uploaded',
        description: 'Uploaded V2 (Color Graded cut) for Summer Campaign Hero 60s',
        metadata: '{}',
        createdAt: pastDate(1),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        entityType: 'revision',
        entityId: delivNorthstar,
        action: 'revision_requested',
        description: 'Revision 3 requested for Brand Manifesto Film (Outside agreed scope)',
        metadata: '{}',
        createdAt: pastDate(1),
      },
      {
        id: uuidv4(),
        organizationId: orgId,
        entityType: 'proposal',
        entityId: propMountain,
        action: 'sent',
        description: 'Sent proposal PROP-2026-102 to Mountain Labs (₹1,12,100)',
        metadata: '{}',
        createdAt: pastDate(3),
      },
    ]);

    this.logger.log('Demo content successfully seeded.');
    return {
      message: 'Demo workspace successfully seeded with realistic creative studio content.',
      workspace: 'Nimish Studio',
    };
  }
}
