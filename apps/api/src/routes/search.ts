import { Hono } from 'hono';
import { Env, AppVariables } from '../env';
import { getDb, schema } from '../db';
import { eq } from 'drizzle-orm';

export const searchRouter = new Hono<{ Bindings: Env; Variables: AppVariables }>();

searchRouter.get('/', async (c) => {
  const db = getDb(c.env);
  const orgId = c.get('organizationId')!;
  const query = (c.req.query('q') || '').toLowerCase().trim();

  if (!query) {
    return c.json({
      clients: [],
      projects: [],
      invoices: [],
      tasks: [],
      leads: [],
      proposals: [],
      deliverables: [],
    });
  }

  const [allClients, allProjects, allInvoices, allTasks, allLeads, allProposals, allDeliverables] =
    await Promise.all([
      db.query.clients.findMany({ where: eq(schema.clients.organizationId, orgId) }),
      db.query.projects.findMany({ where: eq(schema.projects.organizationId, orgId) }),
      db.query.invoices.findMany({ where: eq(schema.invoices.organizationId, orgId) }),
      db.query.tasks.findMany({ where: eq(schema.tasks.organizationId, orgId) }),
      db.query.leads.findMany({ where: eq(schema.leads.organizationId, orgId) }),
      db.query.proposals.findMany({ where: eq(schema.proposals.organizationId, orgId) }),
      db.query.deliverables.findMany({ where: eq(schema.deliverables.organizationId, orgId) }),
    ]);

  const matchedClients = allClients.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.company && c.company.toLowerCase().includes(query)),
  );

  const matchedProjects = allProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)),
  );

  const matchedInvoices = allInvoices.filter(
    (i) =>
      i.invoiceNumber.toLowerCase().includes(query) ||
      i.title.toLowerCase().includes(query),
  );

  const matchedTasks = allTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)),
  );

  const matchedLeads = allLeads.filter(
    (l) =>
      l.title.toLowerCase().includes(query) ||
      l.clientName.toLowerCase().includes(query) ||
      (l.company && l.company.toLowerCase().includes(query)) ||
      (l.email && l.email.toLowerCase().includes(query)),
  );

  const matchedProposals = allProposals.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.proposalNumber.toLowerCase().includes(query),
  );

  const matchedDeliverables = allDeliverables.filter(
    (d) =>
      d.title.toLowerCase().includes(query) ||
      (d.description && d.description.toLowerCase().includes(query)),
  );

  return c.json({
    clients: matchedClients,
    projects: matchedProjects,
    invoices: matchedInvoices,
    tasks: matchedTasks,
    leads: matchedLeads,
    proposals: matchedProposals,
    deliverables: matchedDeliverables,
  });
});
