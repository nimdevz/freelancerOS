import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const feedbackRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

feedbackRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const deliverableId = c.req.query('deliverableId');

  const conditions = [eq(schema.feedbackItems.organizationId, orgId)];
  if (deliverableId) {
    conditions.push(eq(schema.feedbackItems.deliverableId, deliverableId));
  }

  const list = await db.query.feedbackItems.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.feedbackItems.createdAt)],
  });

  return c.json(list);
});

feedbackRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.feedbackItems).values({
    id,
    organizationId: orgId,
    deliverableId: data.deliverableId,
    versionNumber: data.versionNumber || 'V1',
    authorName: data.authorName || 'Client Reviewer',
    authorRole: data.authorRole || 'client',
    content: data.content,
    timestampOrSection: data.timestampOrSection || null,
    status: 'open',
    createdAt: now,
  });

  const created = await db.query.feedbackItems.findFirst({
    where: eq(schema.feedbackItems.id, id),
  });

  return c.json(created, 201);
});

feedbackRouter.patch('/:id/resolve', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const now = new Date().toISOString();

  const item = await db.query.feedbackItems.findFirst({
    where: and(eq(schema.feedbackItems.id, id), eq(schema.feedbackItems.organizationId, orgId)),
  });

  if (!item) {
    return c.json({ message: 'Feedback item not found' }, 404);
  }

  await db.update(schema.feedbackItems)
    .set({
      status: 'resolved',
      resolvedAt: now,
    })
    .where(eq(schema.feedbackItems.id, id));

  const updated = await db.query.feedbackItems.findFirst({
    where: eq(schema.feedbackItems.id, id),
  });

  return c.json(updated);
});
