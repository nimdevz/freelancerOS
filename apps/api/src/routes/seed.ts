import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb } from '../db';
import { seedDemoData } from '../seed';

export const seedRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

seedRouter.post('/demo', async (c) => {
  const db = getDb(c.env);
  const result = await seedDemoData(db);
  return c.json(result);
});

