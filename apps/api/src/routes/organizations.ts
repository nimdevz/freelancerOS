import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq } from 'drizzle-orm';

export const organizationsRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

organizationsRouter.get('/current', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId');

  let org = orgId
    ? await db.query.organizations.findFirst({
        where: eq(schema.organizations.id, orgId),
      })
    : null;

  if (!org) {
    org = await db.query.organizations.findFirst();
  }

  if (!org) {
    return c.json({ message: 'Organization not found' }, 404);
  }

  return c.json(org);
});

organizationsRouter.patch('/current', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId');
  const data = await c.req.json().catch(() => ({}));

  if (!orgId) {
    return c.json({ message: 'Organization required' }, 400);
  }

  if (data.plan !== undefined) {
    return c.json({ message: 'Changing tier is not allowed as of now.' }, 403);
  }

  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.hourlyRate !== undefined) updateData.hourlyRate = Number(data.hourlyRate);
  if (data.taxRatePercent !== undefined) updateData.taxRatePercent = Number(data.taxRatePercent);
  if (data.defaultPaymentTermsDays !== undefined) updateData.defaultPaymentTermsDays = Number(data.defaultPaymentTermsDays);

  await db.update(schema.organizations)
    .set(updateData)
    .where(eq(schema.organizations.id, orgId));

  const updated = await db.query.organizations.findFirst({
    where: eq(schema.organizations.id, orgId),
  });

  return c.json(updated);
});

organizationsRouter.post('/onboard', async (c) => {
  const db = getDb(c.env);
  const data = await c.req.json().catch(() => ({}));
  const now = new Date().toISOString();

  const orgId = crypto.randomUUID();
  const orgName = data.studioName || data.name || 'Creative Studio';
  const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 899 + 100);

  await db.insert(schema.organizations).values({
    id: orgId,
    name: orgName,
    slug,
    currency: data.currency || 'USD',
    hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : 125,
    freelancerType: data.freelancerType || 'creative',
    createdAt: now,
    updatedAt: now,
  });

  let client: any = null;
  if (data.clientName) {
    const clientId = crypto.randomUUID();
    await db.insert(schema.clients).values({
      id: clientId,
      organizationId: orgId,
      name: data.clientName,
      company: data.clientCompany || null,
      email: data.clientEmail || 'client@example.com',
      currency: data.currency || 'USD',
      createdAt: now,
      updatedAt: now,
    });
    client = await db.query.clients.findFirst({ where: eq(schema.clients.id, clientId) });
  }

  let project: any = null;
  if (client && data.projectName) {
    const projectId = crypto.randomUUID();
    await db.insert(schema.projects).values({
      id: projectId,
      organizationId: orgId,
      clientId: client.id,
      name: data.projectName,
      code: 'PRJ-01',
      startDate: now.split('T')[0],
      budget: data.projectBudget ? Number(data.projectBudget) : 5000,
      currency: data.currency || 'USD',
      createdAt: now,
      updatedAt: now,
    });
    project = await db.query.projects.findFirst({ where: eq(schema.projects.id, projectId) });
  }

  const organization = await db.query.organizations.findFirst({ where: eq(schema.organizations.id, orgId) });
  return c.json({ organization, client, project });
});
