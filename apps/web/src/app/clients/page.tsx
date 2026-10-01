'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatRelativeTime } from '@freelanceros/ui';
import { Users, Plus, Search, Mail, Phone, ArrowUpRight } from 'lucide-react';

export default function ClientsPage() {
  const { openQuickCreate } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Clients</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage client relationships, financials, projects, and contracts.
            </p>
          </div>
          <button
            onClick={() => openQuickCreate('client')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search clients by name, company, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
          </span>
        </div>

        {/* Clients Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-2.5 px-4 font-medium">Client / Company</th>
                <th className="py-2.5 px-4 font-medium">Contact</th>
                <th className="py-2.5 px-4 font-medium">Active Projects</th>
                <th className="py-2.5 px-4 font-medium">Outstanding</th>
                <th className="py-2.5 px-4 font-medium">Lifetime Revenue</th>
                <th className="py-2.5 px-4 font-medium">Last Activity</th>
                <th className="py-2.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Users className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-xs text-foreground">No clients found</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Your first client starts everything. Add one to start tracking projects and invoices.
                    </p>
                    <button
                      onClick={() => openQuickCreate('client')}
                      className="mt-3 px-3 py-1.5 text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add client</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="table-row-hover transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-foreground hover:underline block leading-snug"
                      >
                        {client.name}
                      </Link>
                      {client.company && (
                        <span className="text-[11px] text-muted-foreground block">
                          {client.company}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                          <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {client.activeProjectsCount}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {client.outstandingBalance > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {formatCurrency(client.outstandingBalance, client.currency)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-foreground">
                      {formatCurrency(client.totalRevenue, client.currency)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {formatRelativeTime(client.lastActivityAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/clients/${client.id}`}
                        className="p-1 text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 text-[11px] font-medium"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
