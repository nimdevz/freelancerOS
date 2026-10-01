import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { clients, projects, invoices, tasks, leads } from '../../database/schema';
import { eq, ilike } from 'drizzle-orm';

@Injectable()
export class SearchService {
  constructor(private readonly dbService: DatabaseService) {}

  async search(organizationId: string, query: string) {
    if (!query || query.trim().length === 0) {
      return { clients: [], projects: [], invoices: [], tasks: [], leads: [] };
    }

    const q = query.toLowerCase();

    const allClients = await this.dbService.db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
    });
    const matchedClients = allClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.email.toLowerCase().includes(q),
    ).slice(0, 5);

    const allProjects = await this.dbService.db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
    });
    const matchedProjects = allProjects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    ).slice(0, 5);

    const allInvoices = await this.dbService.db.query.invoices.findMany({
      where: eq(invoices.organizationId, organizationId),
    });
    const matchedInvoices = allInvoices.filter(
      (i) => i.invoiceNumber.toLowerCase().includes(q) || i.title.toLowerCase().includes(q),
    ).slice(0, 5);

    const allTasks = await this.dbService.db.query.tasks.findMany({
      where: eq(tasks.organizationId, organizationId),
    });
    const matchedTasks = allTasks.filter(
      (t) => t.title.toLowerCase().includes(q),
    ).slice(0, 5);

    const allLeads = await this.dbService.db.query.leads.findMany({
      where: eq(leads.organizationId, organizationId),
    });
    const matchedLeads = allLeads.filter(
      (l) => l.title.toLowerCase().includes(q) || l.clientName.toLowerCase().includes(q),
    ).slice(0, 5);

    return {
      clients: matchedClients,
      projects: matchedProjects,
      invoices: matchedInvoices,
      tasks: matchedTasks,
      leads: matchedLeads,
    };
  }
}
