import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const deliverablesRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

deliverablesRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');

  const conditions = [eq(schema.deliverables.organizationId, orgId)];
  if (projectId) {
    conditions.push(eq(schema.deliverables.projectId, projectId));
  }

  const list = await db.query.deliverables.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.deliverables.createdAt)],
  });

  const allVersions = await db.query.deliverableVersions.findMany();
  const allProjects = await db.query.projects.findMany({
    where: eq(schema.projects.organizationId, orgId),
  });

  const enriched = list.map((deliv) => {
    const versions = allVersions.filter((v) => v.deliverableId === deliv.id);
    const proj = allProjects.find((p) => p.id === deliv.projectId);
    return {
      ...deliv,
      projectName: proj?.name || 'Project',
      versionsCount: versions.length,
      versions,
    };
  });

  return c.json(enriched);
});

deliverablesRouter.get('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  const deliverable = await db.query.deliverables.findFirst({
    where: and(eq(schema.deliverables.id, id), eq(schema.deliverables.organizationId, orgId)),
  });

  if (!deliverable) {
    return c.json({ message: 'Deliverable not found' }, 404);
  }

  const versions = await db.query.deliverableVersions.findMany({
    where: eq(schema.deliverableVersions.deliverableId, id),
    orderBy: [desc(schema.deliverableVersions.uploadedAt)],
  });

  const feedback = await db.query.feedbackItems.findMany({
    where: and(eq(schema.feedbackItems.deliverableId, id), eq(schema.feedbackItems.organizationId, orgId)),
    orderBy: [desc(schema.feedbackItems.createdAt)],
  });

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, deliverable.projectId),
  });

  return c.json({
    ...deliverable,
    projectName: project?.name || 'Project',
    project,
    versions,
    feedback,
  });
});

deliverablesRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.deliverables).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    title: data.title,
    description: data.description || null,
    status: data.status || 'client_review',
    currentVersion: data.currentVersion || 'V1',
    includedRevisions: data.includedRevisions !== undefined ? Number(data.includedRevisions) : 2,
    createdAt: now,
    updatedAt: now,
  });

  // Create initial V1 version if file info provided or default
  const versionId = crypto.randomUUID();
  await db.insert(schema.deliverableVersions).values({
    id: versionId,
    deliverableId: id,
    versionNumber: data.currentVersion || 'V1',
    fileUrl: data.fileUrl || null,
    fileName: data.fileName || `${data.title}-preview`,
    fileSize: data.fileSize !== undefined ? Number(data.fileSize) : null,
    notes: data.notes || 'Initial deliverable version',
    status: 'client_review',
    uploadedAt: now,
  });

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'deliverable',
    entityId: id,
    action: 'created',
    description: `Uploaded new deliverable "${data.title}"`,
    createdAt: now,
  });

  const created = await db.query.deliverables.findFirst({
    where: eq(schema.deliverables.id, id),
  });

  return c.json(created, 201);
});

deliverablesRouter.post('/:id/versions', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();
  const now = new Date().toISOString();

  const deliverable = await db.query.deliverables.findFirst({
    where: and(eq(schema.deliverables.id, id), eq(schema.deliverables.organizationId, orgId)),
  });

  if (!deliverable) {
    return c.json({ message: 'Deliverable not found' }, 404);
  }

  const existingVersions = await db.query.deliverableVersions.findMany({
    where: eq(schema.deliverableVersions.deliverableId, id),
  });

  const nextVersionNum = data.versionNumber || `V${existingVersions.length + 1}`;
  const versionId = crypto.randomUUID();

  await db.insert(schema.deliverableVersions).values({
    id: versionId,
    deliverableId: id,
    versionNumber: nextVersionNum,
    fileUrl: data.fileUrl || null,
    fileName: data.fileName || `${deliverable.title}-${nextVersionNum}`,
    fileSize: data.fileSize !== undefined ? Number(data.fileSize) : null,
    notes: data.notes || null,
    status: 'client_review',
    uploadedAt: now,
  });

  await db.update(schema.deliverables)
    .set({
      currentVersion: nextVersionNum,
      status: 'client_review',
      updatedAt: now,
    })
    .where(eq(schema.deliverables.id, id));

  await db.insert(schema.activityLogs).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    entityType: 'deliverable',
    entityId: id,
    action: 'version_added',
    description: `Added version ${nextVersionNum} for deliverable "${deliverable.title}"`,
    createdAt: now,
  });

  const createdVersion = await db.query.deliverableVersions.findFirst({
    where: eq(schema.deliverableVersions.id, versionId),
  });

  return c.json(createdVersion, 201);
});

deliverablesRouter.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.delete(schema.feedbackItems).where(and(eq(schema.feedbackItems.deliverableId, id), eq(schema.feedbackItems.organizationId, orgId)));
  await db.delete(schema.deliverableVersions).where(eq(schema.deliverableVersions.deliverableId, id));
  await db.delete(schema.deliverables)
    .where(and(eq(schema.deliverables.id, id), eq(schema.deliverables.organizationId, orgId)));

  return c.body(null, 204);
});

