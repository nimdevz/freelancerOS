import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';

export const seedRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

seedRouter.post('/demo', async (c) => {
  const db = getDb(c.env);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const pastDate = (days: number) =>
    new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const futureDate = (days: number) =>
    new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

  const userId = '11111111-1111-1111-1111-111111111111';
  const orgId = '22222222-2222-2222-2222-222222222222';

  // Ensure user exists
  await db.insert(schema.users).values({
    id: userId,
    email: 'nimish@freelanceros.com',
    firstName: 'Nimish',
    lastName: 'Prabhu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'owner',
    createdAt: pastDate(60),
    updatedAt: todayStr,
  }).onConflictDoNothing();

  // Ensure organization exists
  await db.insert(schema.organizations).values({
    id: orgId,
    name: 'Nimish Studio',
    slug: 'nimish-studio',
    currency: 'USD',
    timezone: 'Asia/Kolkata',
    defaultPaymentTermsDays: 14,
    taxRatePercent: 18,
    plan: 'pro',
    freelancerType: 'video_editor',
    hourlyRate: 150,
    createdAt: pastDate(60),
    updatedAt: todayStr,
  }).onConflictDoNothing();

  await db.insert(schema.organizationMembers).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    userId,
    role: 'owner',
    createdAt: pastDate(60),
  }).onConflictDoNothing();

  return c.json({
    message: 'Demo workspace validated and ready',
    workspace: 'Nimish Studio',
  });
});
