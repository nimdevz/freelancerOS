import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const revisionsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

revisionsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');

  const conditions = [eq(schema.revisions.organizationId, orgId)];
  if (projectId) {
    conditions.push(eq(schema.revisions.projectId, projectId));
  }

  const list = await db.query.revisions.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.revisions.requestedAt)],
  });

  const allProjects = await db.query.projects.findMany({
    where: eq(schema.projects.organizationId, orgId),
  });

  const allDeliverables = await db.query.deliverables.findMany({
    where: eq(schema.deliverables.organizationId, orgId),
  });

  const enriched = list.map((rev) => {
    const proj = allProjects.find((p) => p.id === rev.projectId);
    const deliv = allDeliverables.find((d) => d.id === rev.deliverableId);
    return {
      ...rev,
      projectName: proj?.name || 'Project',
      deliverableTitle: deliv?.title || 'Deliverable',
    };
  });

  return c.json(enriched);
});

revisionsRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, data.projectId),
  });

  const deliverable = await db.query.deliverables.findFirst({
    where: eq(schema.deliverables.id, data.deliverableId),
  });

  const existingRevs = await db.query.revisions.findMany({
    where: eq(schema.revisions.deliverableId, data.deliverableId),
  });

  const revisionNumber = data.revisionNumber || existingRevs.length + 1;
  const maxIncluded = data.maxIncluded !== undefined ? Number(data.maxIncluded) : (deliverable?.includedRevisions ?? project?.includedRevisions ?? 2);
  const isScopeExceeded = revisionNumber > maxIncluded ? 1 : 0;

  await db.insert(schema.revisions).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    deliverableId: data.deliverableId,
    revisionNumber,
    maxIncluded,
    isScopeExceeded,
    requestDetails: data.requestDetails,
    requestedBy: data.requestedBy || 'Client',
    requestedAt: now,
    status: 'pending',
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'revision',
    entityId: id,
    action: 'requested',
    description: `Revision #${revisionNumber} requested for "${deliverable?.title || 'Deliverable'}"${isScopeExceeded ? ' [Scope Exceeded!]' : ''}`,
    createdAt: now,
  });

  if (isScopeExceeded && project) {
    await db.update(schema.projects)
      .set({
        health: 'at_risk',
        healthReason: `Revision count (${revisionNumber}) exceeds included allowance (${maxIncluded})`,
        updatedAt: now,
      })
      .where(eq(schema.projects.id, project.id));
  }

  const created = await db.query.revisions.findFirst({
    where: eq(schema.revisions.id, id),
  });

  return c.json(created, 201);
});
