import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import { getEnrichedProjects } from './projects';

export const aiRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// 1. AI Project Summary
aiRouter.post('/project-summary', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const { projectId } = await c.req.json();

  const project = await db.query.projects.findFirst({
    where: and(eq(schema.projects.id, projectId), eq(schema.projects.organizationId, orgId)),
  });

  if (!project) {
    return c.json({ message: 'Project not found' }, 404);
  }

  const client = await db.query.clients.findFirst({
    where: eq(schema.clients.id, project.clientId),
  });

  const tasksList = await db.query.tasks.findMany({
    where: and(eq(schema.tasks.projectId, projectId), eq(schema.tasks.organizationId, orgId)),
  });

  const deliverablesList = await db.query.deliverables.findMany({
    where: and(eq(schema.deliverables.projectId, projectId), eq(schema.deliverables.organizationId, orgId)),
  });

  const invoicesList = await db.query.invoices.findMany({
    where: and(eq(schema.invoices.projectId, projectId), eq(schema.invoices.organizationId, orgId)),
  });

  const overdueTasks = tasksList.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]);
  const completedTasks = tasksList.filter((t) => t.status === 'done');
  const outstandingInvoices = invoicesList.filter((i) => i.balanceDue > 0);

  const summary = `Project "${project.name}" for ${client?.name || 'Client'} is currently in **${project.status.toUpperCase()}** status with **${project.health.toUpperCase()}** health.
  
• **Progress:** ${project.progressPercent}% completion (${completedTasks.length}/${tasksList.length} tasks finished).
• **Financials:** ${project.currency} ${project.budget.toLocaleString()} budget. Total invoiced: ${project.currency} ${invoicesList.reduce((s, i) => s + i.totalAmount, 0).toLocaleString()}.
• **Deliverables:** ${deliverablesList.length} deliverables tracked. Current review status: ${deliverablesList.filter(d => d.status === 'client_review').length} awaiting client sign-off.
• **Risks Identified:** ${overdueTasks.length > 0 ? `${overdueTasks.length} overdue tasks.` : 'No critical task bottlenecks.'} ${outstandingInvoices.length > 0 ? `${outstandingInvoices.length} unpaid invoices pending.` : 'All invoices settled.'}`;

  const recommendedActions = [
    ...(overdueTasks.length > 0 ? [`Follow up on ${overdueTasks.length} overdue task(s): ${overdueTasks.map(t => t.title).join(', ')}`] : []),
    ...(deliverablesList.some(d => d.status === 'client_review') ? ['Send review reminder to client for deliverables awaiting sign-off'] : []),
    ...(outstandingInvoices.length > 0 ? [`Send payment reminder for invoice ${outstandingInvoices[0].invoiceNumber}`] : []),
    'Review milestone schedule against remaining time budget',
  ];

  return c.json({
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
  });
});

// 2. AI Task Extraction
aiRouter.post('/task-extraction', async (c) => {
  const { notes } = await c.req.json();
  if (!notes) {
    return c.json({ tasks: [] });
  }

  // Parse lines or bullet points into structured tasks
  const rawLines = notes
    .split(/\r?\n/)
    .map((l: string) => l.replace(/^[-*•\d.)\]\s]+/, '').trim())
    .filter((l: string) => l.length > 4);

  const tasks = rawLines.map((line: string, idx: number) => {
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

  return c.json({ tasks });
});

// 3. AI Proposal Draft
aiRouter.post('/proposal-draft', async (c) => {
  const { clientName, service, brief, budget, currency = 'USD' } = await c.req.json();

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

  return c.json({
    title,
    executiveSummary,
    items,
    terms,
    currency,
    totalAmount: budget || 5000,
  });
});

// 4. AI Follow-Up Draft
aiRouter.post('/follow-up-draft', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const { type, entityId } = await c.req.json();

  let subject = 'Following up on our project';
  let body = 'Hi there, just wanted to check in regarding our current project.';

  if (type === 'invoice') {
    const inv = await db.query.invoices.findFirst({
      where: and(eq(schema.invoices.id, entityId), eq(schema.invoices.organizationId, orgId)),
    });
    const client = inv ? await db.query.clients.findFirst({ where: eq(schema.clients.id, inv.clientId) }) : null;

    if (inv) {
      subject = `Invoice Reminder: ${inv.invoiceNumber} (${inv.currency} ${inv.balanceDue})`;
      body = `Hi ${client?.name || 'there'},\n\nHope you're having a productive week. This is a gentle reminder regarding invoice ${inv.invoiceNumber} for ${inv.currency} ${inv.balanceDue}, which was due on ${inv.dueDate}.\n\nPlease let me know if you need another copy of the invoice or wire instructions.\n\nThank you for your partnership!`;
    }
  } else if (type === 'approval') {
    const appr = await db.query.approvals.findFirst({
      where: and(eq(schema.approvals.id, entityId), eq(schema.approvals.organizationId, orgId)),
    });
    const deliv = appr ? await db.query.deliverables.findFirst({ where: eq(schema.deliverables.id, appr.deliverableId) }) : null;

    subject = `Review Required: ${deliv?.title || 'Deliverable'} (${appr?.versionNumber || 'V1'})`;
    body = `Hi there,\n\nJust checking in on the review for "${deliv?.title || 'Deliverable'}" (${appr?.versionNumber || 'V1'}) uploaded on ${appr?.requestedAt.split('T')[0]}.\n\nPlease review and let me know if you approve or if any adjustments are needed so we can keep the timeline on track.\n\nBest regards!`;
  }

  return c.json({ subject, body });
});

// 5. AI Business Query
aiRouter.post('/business-query', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const { query } = await c.req.json();
  const q = (query || '').toLowerCase().trim();

  const today = new Date().toISOString().split('T')[0];

  if (q.includes('overdue') && q.includes('invoice')) {
    const overdueInvoices = await db.query.invoices.findMany({
      where: and(eq(schema.invoices.organizationId, orgId)),
    });
    const filtered = overdueInvoices.filter((i) => (i.status === 'overdue' || (i.dueDate < today && i.balanceDue > 0)) && i.status !== 'cancelled');
    const totalOverdue = filtered.reduce((s, i) => s + i.balanceDue, 0);

    return c.json({
      answer: `You currently have ${filtered.length} overdue invoice(s) totaling **${filtered[0]?.currency || 'USD'} ${totalOverdue.toLocaleString()}**.`,
      data: filtered,
      actionUrl: '/invoices',
    });
  }

  if (q.includes('collected') || q.includes('revenue')) {
    const paymentsList = await db.query.payments.findMany({
      where: eq(schema.payments.organizationId, orgId),
    });
    const totalCollected = paymentsList.reduce((s, p) => s + p.amount, 0);

    return c.json({
      answer: `You have collected a total of **USD ${totalCollected.toLocaleString()}** across ${paymentsList.length} recorded payments.`,
      data: paymentsList,
      actionUrl: '/reports',
    });
  }

  if (q.includes('project') && (q.includes('risk') || q.includes('blocked') || q.includes('health'))) {
    const projectsList = await getEnrichedProjects(db, orgId);
    const atRisk = projectsList.filter((p: any) => p.health === 'at_risk' || p.health === 'blocked');

    return c.json({
      answer: atRisk.length > 0
        ? `You have ${atRisk.length} project(s) requiring attention: ${atRisk.map((p: any) => `${p.name} (${p.healthReason || p.health})`).join(', ')}.`
        : 'All active projects are currently in healthy standing with zero blocked deadlines.',
      data: atRisk,
      actionUrl: '/projects',
    });
  }

  // Fallback default answer
  return c.json({
    answer: `Here is a summary based on your live business records: You have active client projects, invoices, and time tracking in progress. Try queries like "Which invoices are overdue?", "How much revenue was collected?", or "Which projects are at risk?".`,
    data: [],
    actionUrl: '/dashboard',
  });
});
