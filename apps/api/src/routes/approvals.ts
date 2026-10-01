import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const approvalsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

approvalsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const list = await db.query.approvals.findMany({
    where: eq(schema.approvals.organizationId, orgId),
    orderBy: [desc(schema.approvals.requestedAt)],
  });

  const allProjects = await db.query.projects.findMany({
    where: eq(schema.projects.organizationId, orgId),
  });

  const allDeliverables = await db.query.deliverables.findMany({
    where: eq(schema.deliverables.organizationId, orgId),
  });

  const enriched = list.map((appr) => {
    const proj = allProjects.find((p) => p.id === appr.projectId);
    const deliv = allDeliverables.find((d) => d.id === appr.deliverableId);
    return {
      ...appr,
      projectName: proj?.name || 'Project',
      deliverableTitle: deliv?.title || 'Deliverable',
    };
  });

  return c.json(enriched);
});

approvalsRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.approvals).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    deliverableId: data.deliverableId,
    versionNumber: data.versionNumber || 'V1',
    status: 'pending',
    requestedAt: now,
  });

  const deliv = await db.query.deliverables.findFirst({
    where: eq(schema.deliverables.id, data.deliverableId),
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'approval',
    entityId: id,
    action: 'requested',
    description: `Approval requested for "${deliv?.title || 'Deliverable'}" (${data.versionNumber || 'V1'})`,
    createdAt: now,
  });

  const created = await db.query.approvals.findFirst({
    where: eq(schema.approvals.id, id),
  });

  return c.json(created, 201);
});

approvalsRouter.post('/:id/decide', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const approval = await db.query.approvals.findFirst({
    where: and(eq(schema.approvals.id, id), eq(schema.approvals.organizationId, orgId)),
  });

  if (!approval) {
    return c.json({ message: 'Approval not found' }, 404);
  }

  const status = data.status === 'approved' ? 'approved' : 'changes_requested';
  const decidedBy = data.decidedBy || 'Client';

  await db.update(schema.approvals)
    .set({
      status,
      decidedAt: now,
      decidedBy,
      feedbackComments: data.comments || null,
    })
    .where(eq(schema.approvals.id, id));

  // Update deliverable status
  await db.update(schema.deliverables)
    .set({
      status: status === 'approved' ? 'approved' : 'changes_requested',
      approvedAt: status === 'approved' ? now : null,
      approvedBy: status === 'approved' ? decidedBy : null,
      updatedAt: now,
    })
    .where(eq(schema.deliverables.id, approval.deliverableId));

  const deliv = await db.query.deliverables.findFirst({
    where: eq(schema.deliverables.id, approval.deliverableId),
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'approval',
    entityId: id,
    action: status,
    description: `Approval ${status} for "${deliv?.title || 'Deliverable'}" by ${decidedBy}`,
    createdAt: now,
  });

  await db.insert(schema.notifications).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    type: status === 'approved' ? 'deliverable_approved' : 'changes_requested',
    title: status === 'approved' ? 'Deliverable Approved' : 'Changes Requested',
    message: `${decidedBy} marked "${deliv?.title || 'Deliverable'}" as ${status.replace('_', ' ')}.`,
    entityType: 'deliverable',
    entityId: approval.deliverableId,
    isRead: 0,
    createdAt: now,
  });

  const updated = await db.query.approvals.findFirst({
    where: eq(schema.approvals.id, id),
  });

  return c.json(updated);
});
