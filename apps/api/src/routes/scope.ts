import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const scopeRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

scopeRouter.get('/:projectId', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.param('projectId');

  const scope = await db.query.projectScopes.findFirst({
    where: and(eq(schema.projectScopes.projectId, projectId), eq(schema.projectScopes.organizationId, orgId)),
  });

  const changes = await db.query.scopeChanges.findMany({
    where: and(eq(schema.scopeChanges.projectId, projectId), eq(schema.scopeChanges.organizationId, orgId)),
    orderBy: [desc(schema.scopeChanges.requestedDate)],
  });

  return c.json({
    scope: scope
      ? {
          ...scope,
          includedItems: typeof scope.includedItems === 'string' ? JSON.parse(scope.includedItems) : scope.includedItems,
          excludedItems: typeof scope.excludedItems === 'string' ? JSON.parse(scope.excludedItems) : scope.excludedItems,
        }
      : null,
    changes,
  });
});

scopeRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db.query.projectScopes.findFirst({
    where: and(eq(schema.projectScopes.projectId, data.projectId), eq(schema.projectScopes.organizationId, orgId)),
  });

  const includedItems = Array.isArray(data.includedItems) ? JSON.stringify(data.includedItems) : '[]';
  const excludedItems = Array.isArray(data.excludedItems) ? JSON.stringify(data.excludedItems) : '[]';

  if (existing) {
    await db.update(schema.projectScopes)
      .set({
        includedItems,
        excludedItems,
        limitations: data.limitations || null,
        revisionAllowance: data.revisionAllowance !== undefined ? Number(data.revisionAllowance) : 2,
        deliveryAssumptions: data.deliveryAssumptions || null,
        updatedAt: now,
      })
      .where(eq(schema.projectScopes.id, existing.id));

    const updated = await db.query.projectScopes.findFirst({
      where: eq(schema.projectScopes.id, existing.id),
    });
    return c.json(updated);
  } else {
    const id = crypto.randomUUID();
    await db.insert(schema.projectScopes).values({
      id,
      organizationId: orgId,
      projectId: data.projectId,
      includedItems,
      excludedItems,
      limitations: data.limitations || null,
      revisionAllowance: data.revisionAllowance !== undefined ? Number(data.revisionAllowance) : 2,
      deliveryAssumptions: data.deliveryAssumptions || null,
      createdAt: now,
      updatedAt: now,
    });

    const created = await db.query.projectScopes.findFirst({
      where: eq(schema.projectScopes.id, id),
    });
    return c.json(created, 201);
  }
});

scopeRouter.post('/changes', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.scopeChanges).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    title: data.title,
    requestDetails: data.requestDetails,
    requestedBy: data.requestedBy || 'Client',
    requestedDate: data.requestedDate || now.split('T')[0],
    estimatedHours: data.estimatedHours !== undefined ? Number(data.estimatedHours) : 0,
    additionalCost: data.additionalCost !== undefined ? Number(data.additionalCost) : 0,
    currency: data.currency || 'USD',
    status: data.status || 'requested',
    approvedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'project',
    entityId: data.projectId,
    action: 'scope_change_requested',
    description: `Scope change requested: "${data.title}" (+${data.additionalCost || 0} ${data.currency || 'USD'})`,
    createdAt: now,
  });

  const created = await db.query.scopeChanges.findFirst({
    where: eq(schema.scopeChanges.id, id),
  });

  return c.json(created, 201);
});

scopeRouter.patch('/changes/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const change = await db.query.scopeChanges.findFirst({
    where: and(eq(schema.scopeChanges.id, id), eq(schema.scopeChanges.organizationId, orgId)),
  });

  if (!change) {
    return c.json({ message: 'Scope change not found' }, 404);
  }

  const updateData: any = { updatedAt: now };
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === 'approved') {
      updateData.approvedAt = now;

      // Automatically add additional cost to project budget!
      const project = await db.query.projects.findFirst({
        where: eq(schema.projects.id, change.projectId),
      });
      if (project && change.additionalCost > 0) {
        await db.update(schema.projects)
          .set({
            budget: project.budget + change.additionalCost,
            updatedAt: now,
          })
          .where(eq(schema.projects.id, project.id));
      }
    }
  }

  await db.update(schema.scopeChanges)
    .set(updateData)
    .where(and(eq(schema.scopeChanges.id, id), eq(schema.scopeChanges.organizationId, orgId)));

  const updated = await db.query.scopeChanges.findFirst({
    where: eq(schema.scopeChanges.id, id),
  });

  return c.json(updated);
});
