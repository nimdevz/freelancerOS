import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, desc } from 'drizzle-orm';

export const activityRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

activityRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const limitParam = c.req.query('limit');
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 30;

  const list = await db.query.activityLogs.findMany({
    where: eq(schema.activityLogs.organizationId, orgId),
    orderBy: [desc(schema.activityLogs.createdAt)],
    limit,
  });

  return c.json(list);
});
