import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq, and, desc, asc } from 'drizzle-orm';

export const creativeRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// Call Sheets
creativeRouter.get('/call-sheets', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');

  const conditions = [eq(schema.productionCallSheets.organizationId, orgId)];
  if (projectId) conditions.push(eq(schema.productionCallSheets.projectId, projectId));

  const list = await db.query.productionCallSheets.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.productionCallSheets.shootDate)],
  });

  return c.json(list);
});

creativeRouter.post('/call-sheets', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const id = crypto.randomUUID();

  await db.insert(schema.productionCallSheets).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    title: data.title,
    shootDate: data.shootDate,
    location: data.location,
    callTimes: data.callTimes || null,
    crew: data.crew || null,
    talent: data.talent || null,
    equipment: data.equipment || null,
    notes: data.notes || null,
    emergencyContact: data.emergencyContact || null,
    createdAt: new Date().toISOString(),
  });

  const created = await db.query.productionCallSheets.findFirst({
    where: eq(schema.productionCallSheets.id, id),
  });

  return c.json(created, 201);
});

// Shot Lists
creativeRouter.get('/shots', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');

  const conditions = [eq(schema.productionShots.organizationId, orgId)];
  if (projectId) conditions.push(eq(schema.productionShots.projectId, projectId));

  const list = await db.query.productionShots.findMany({
    where: and(...conditions),
    orderBy: [asc(schema.productionShots.shotNumber)],
  });

  return c.json(list);
});

creativeRouter.post('/shots', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const id = crypto.randomUUID();

  await db.insert(schema.productionShots).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    shotNumber: data.shotNumber,
    description: data.description,
    location: data.location || null,
    framing: data.framing || null,
    movement: data.movement || null,
    lens: data.lens || null,
    talent: data.talent || null,
    notes: data.notes || null,
    status: data.status || 'planned',
    createdAt: new Date().toISOString(),
  });

  const created = await db.query.productionShots.findFirst({
    where: eq(schema.productionShots.id, id),
  });

  return c.json(created, 201);
});

creativeRouter.patch('/shots/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();

  await db.update(schema.productionShots)
    .set({
      status: data.status,
      notes: data.notes,
    })
    .where(and(eq(schema.productionShots.id, id), eq(schema.productionShots.organizationId, orgId)));

  const updated = await db.query.productionShots.findFirst({
    where: eq(schema.productionShots.id, id),
  });

  return c.json(updated);
});

// Equipment Items
creativeRouter.get('/equipment', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const projectId = c.req.query('projectId');

  const conditions = [eq(schema.equipmentItems.organizationId, orgId)];
  if (projectId) conditions.push(eq(schema.equipmentItems.projectId, projectId));

  const list = await db.query.equipmentItems.findMany({
    where: and(...conditions),
    orderBy: [asc(schema.equipmentItems.category), asc(schema.equipmentItems.item)],
  });

  return c.json(list);
});

creativeRouter.post('/equipment', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const data = await c.req.json();
  const id = crypto.randomUUID();

  await db.insert(schema.equipmentItems).values({
    id,
    organizationId: orgId,
    projectId: data.projectId,
    item: data.item,
    category: data.category || 'Camera',
    quantity: data.quantity !== undefined ? Number(data.quantity) : 1,
    status: data.status || 'needed',
    notes: data.notes || null,
    createdAt: new Date().toISOString(),
  });

  const created = await db.query.equipmentItems.findFirst({
    where: eq(schema.equipmentItems.id, id),
  });

  return c.json(created, 201);
});

creativeRouter.patch('/equipment/:id', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const id = c.req.param('id');
  const data = await c.req.json();

  await db.update(schema.equipmentItems)
    .set({
      status: data.status,
      notes: data.notes,
    })
    .where(and(eq(schema.equipmentItems.id, id), eq(schema.equipmentItems.organizationId, orgId)));

  const updated = await db.query.equipmentItems.findFirst({
    where: eq(schema.equipmentItems.id, id),
  });

  return c.json(updated);
});
