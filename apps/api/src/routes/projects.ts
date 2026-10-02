import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const projectsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

export async function getEnrichedProjects(
  db: any,
  orgId: string,
  preloaded?: {
    projects?: any[];
    clients?: any[];
    timeEntries?: any[];
    invoices?: any[];
    payments?: any[];
    expenses?: any[];
    revisions?: any[];
  },
) {
  const [
    projectList,
    clientList,
    allTime,
    allInvoices,
    allPayments,
    allExpenses,
    allRevisions,
  ] = await Promise.all([
    preloaded?.projects ??
      db.query.projects.findMany({
        where: eq(schema.projects.organizationId, orgId),
        orderBy: [desc(schema.projects.createdAt)],
      }),
    preloaded?.clients ??
      db.query.clients.findMany({
        where: eq(schema.clients.organizationId, orgId),
      }),
    preloaded?.timeEntries ??
      db.query.timeEntries.findMany({
        where: eq(schema.timeEntries.organizationId, orgId),
      }),
    preloaded?.invoices ??
      db.query.invoices.findMany({
        where: eq(schema.invoices.organizationId, orgId),
      }),
    preloaded?.payments ??
      db.query.payments.findMany({
        where: eq(schema.payments.organizationId, orgId),
      }),
    preloaded?.expenses ??
      db.query.expenses.findMany({
        where: eq(schema.expenses.organizationId, orgId),
      }),
    preloaded?.revisions ??
      db.query.revisions.findMany({
        where: eq(schema.revisions.organizationId, orgId),
      }),
  ]);

  const today = new Date().toISOString().split('T')[0];

  return projectList.map((project: any) => {
    const client = clientList.find((c: any) => c.id === project.clientId);
    const projTime = allTime.filter((t: any) => t.projectId === project.id);
    const totalMinutes = projTime.reduce((sum: number, t: any) => sum + (t.durationMinutes || 0), 0);
    const totalHoursTracked = Math.round((totalMinutes / 60) * 10) / 10;

    const projInvoices = allInvoices.filter((i: any) => i.projectId === project.id);
    const totalInvoiced = projInvoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

    const projInvoiceIds = new Set(projInvoices.map((i: any) => i.id));
    const projPayments = allPayments.filter((p: any) => projInvoiceIds.has(p.invoiceId));
    const totalPaid = projPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const projExpenses = allExpenses.filter((e: any) => e.projectId === project.id);
    const totalExpenses = projExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    const profit = totalPaid - totalExpenses;
    const effectiveHourlyRate =
      totalHoursTracked > 0 ? Math.round(profit / totalHoursTracked) : 0;

    const projRevs = allRevisions.filter((r: any) => r.projectId === project.id);
    const completedRevisions = projRevs.length;

    let health = project.health;
    let healthReason = project.healthReason;

    if (project.status !== 'completed' && project.deadline && project.deadline < today) {
      health = 'blocked';
      healthReason = 'Past agreed deadline';
    } else if (completedRevisions > project.includedRevisions) {
      health = 'at_risk';
      healthReason = 'Revisions exceed included scope';
    }

    return {
      ...project,
      clientName: client?.name || 'Unknown Client',
      totalHoursTracked,
      totalInvoiced,
      totalPaid,
      totalExpenses,
      profit,
      effectiveHourlyRate,
      completedRevisions,
      health,
      healthReason,
    };
  });
}

projectsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const enriched = await getEnrichedProjects(db, orgId);
  return c.json(enriched);
});

projectsRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const project = await db.query.projects.findFirst({
    where: and(eq(schema.projects.id, id), eq(schema.projects.organizationId, orgId)),
  });

  if (!project) {
    return c.json({ message: 'Project not found' }, 404);
  }

  const [client, projectTasks, timeEntriesList, projectDeliverables, projectInvoices] =
    await Promise.all([
      db.query.clients.findFirst({
        where: eq(schema.clients.id, project.clientId),
      }),
      db.query.tasks.findMany({
        where: and(eq(schema.tasks.projectId, id), eq(schema.tasks.organizationId, orgId)),
        orderBy: [desc(schema.tasks.createdAt)],
      }),
      db.query.timeEntries.findMany({
        where: and(eq(schema.timeEntries.projectId, id), eq(schema.timeEntries.organizationId, orgId)),
        orderBy: [desc(schema.timeEntries.startTime)],
      }),
      db.query.deliverables.findMany({
        where: and(eq(schema.deliverables.projectId, id), eq(schema.deliverables.organizationId, orgId)),
      }),
      db.query.invoices.findMany({
        where: and(eq(schema.invoices.projectId, id), eq(schema.invoices.organizationId, orgId)),
      }),
    ]);

  return c.json({
    ...project,
    clientName: client?.name || 'Unknown Client',
    client,
    tasks: projectTasks,
    timeEntries: timeEntriesList,
    deliverables: projectDeliverables,
    invoices: projectInvoices,
  });
});

projectsRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const code = data.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`;

  await db.insert(schema.projects).values({
    id,
    organizationId: orgId,
    clientId: data.clientId,
    name: data.name,
    code,
    description: data.description || null,
    status: data.status || 'active',
    health: data.health || 'healthy',
    healthReason: data.healthReason || null,
    startDate: data.startDate || now.split('T')[0],
    deadline: data.deadline || null,
    budget: data.budget !== undefined ? Number(data.budget) : 0,
    currency: data.currency || 'USD',
    includedRevisions: data.includedRevisions !== undefined ? Number(data.includedRevisions) : 2,
    progressPercent: data.progressPercent !== undefined ? Number(data.progressPercent) : 0,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'project',
    entityId: id,
    action: 'created',
    description: `Created project "${data.name}" (${code})`,
    createdAt: now,
  });

  const created = await db.query.projects.findFirst({
    where: eq(schema.projects.id, id),
  });

  return c.json(created, 201);
});

projectsRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.projects.findFirst({
    where: and(eq(schema.projects.id, id), eq(schema.projects.organizationId, orgId)),
  });

  if (!existing) {
    return c.json({ message: 'Project not found' }, 404);
  }

  const updateData: any = {
    updatedAt: now,
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.clientId !== undefined) updateData.clientId = data.clientId;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.health !== undefined) updateData.health = data.health;
  if (data.healthReason !== undefined) updateData.healthReason = data.healthReason;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.deadline !== undefined) updateData.deadline = data.deadline;
  if (data.budget !== undefined) updateData.budget = Number(data.budget);
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.includedRevisions !== undefined) updateData.includedRevisions = Number(data.includedRevisions);
  if (data.progressPercent !== undefined) updateData.progressPercent = Number(data.progressPercent);

  await db.update(schema.projects)
    .set(updateData)
    .where(and(eq(schema.projects.id, id), eq(schema.projects.organizationId, orgId)));

  const updated = await db.query.projects.findFirst({
    where: eq(schema.projects.id, id),
  });

  return c.json(updated);
});

projectsRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.projects)
    .where(and(eq(schema.projects.id, id), eq(schema.projects.organizationId, orgId)));

  return c.body(null, 204);
});
