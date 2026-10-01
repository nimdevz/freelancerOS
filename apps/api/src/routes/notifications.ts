import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const notificationsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

notificationsRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const list = await db.query.notifications.findMany({
    where: eq(schema.notifications.organizationId, orgId),
    orderBy: [desc(schema.notifications.createdAt)],
  });

  return c.json(list);
});

notificationsRouter.post('/:id/read', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');

  await db.update(schema.notifications)
    .set({ isRead: 1 })
    .where(and(eq(schema.notifications.id, id), eq(schema.notifications.organizationId, orgId)));

  return c.json({ success: true });
});

notificationsRouter.post('/read-all', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  await db.update(schema.notifications)
    .set({ isRead: 1 })
    .where(eq(schema.notifications.organizationId, orgId));

  return c.json({ success: true });
});
