import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export const caseStudiesRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

caseStudiesRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;

  const list = await db.query.caseStudies.findMany({
    where: eq(schema.caseStudies.organizationId, orgId),
    orderBy: [desc(schema.caseStudies.createdAt)],
  });

  const allProjects = await db.query.projects.findMany({
    where: eq(schema.projects.organizationId, orgId),
  });

  const allClients = await db.query.clients.findMany({
    where: eq(schema.clients.organizationId, orgId),
  });

  const enriched = list.map((cs) => {
    const proj = allProjects.find((p) => p.id === cs.projectId);
    const client = allClients.find((cl) => cl.id === cs.clientId);
    return {
      ...cs,
      projectName: proj?.name || 'Project',
      clientName: client?.name || 'Client',
      services: typeof cs.services === 'string' ? JSON.parse(cs.services) : cs.services,
    };
  });

  return c.json(enriched);
});

caseStudiesRouter.post('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(schema.caseStudies).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    clientId: data.clientId || null,
    title: data.title,
    challenge: data.challenge,
    solution: data.solution,
    result: data.result,
    services: Array.isArray(data.services) ? JSON.stringify(data.services) : '[]',
    testimonialText: data.testimonialText || null,
    testimonialAuthor: data.testimonialAuthor || null,
    published: data.published ? 1 : 0,
    createdAt: now,
  });

  const created = await db.query.caseStudies.findFirst({
    where: eq(schema.caseStudies.id, id),
  });

  return c.json(created, 201);
});

caseStudiesRouter.patch('/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.challenge !== undefined) updateData.challenge = data.challenge;
  if (data.solution !== undefined) updateData.solution = data.solution;
  if (data.result !== undefined) updateData.result = data.result;
  if (data.services !== undefined) updateData.services = JSON.stringify(data.services);
  if (data.testimonialText !== undefined) updateData.testimonialText = data.testimonialText;
  if (data.testimonialAuthor !== undefined) updateData.testimonialAuthor = data.testimonialAuthor;
  if (data.published !== undefined) updateData.published = data.published ? 1 : 0;

  await db.update(schema.caseStudies)
    .set(updateData)
    .where(and(eq(schema.caseStudies.id, id), eq(schema.caseStudies.organizationId, orgId)));

  const updated = await db.query.caseStudies.findFirst({
    where: eq(schema.caseStudies.id, id),
  });

  return c.json(updated);
});
