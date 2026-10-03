'use client';

import React, { useState, useDeferredValue } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatRelativeTime } from '@freelanceros/ui';
import { Users, Plus, Search, Mail, Phone, ArrowUpRight, Download, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { exportClientsToCsv } from '@/lib/csv-export';

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const openQuickCreate = useAppStore((s) => s.openQuickCreate);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => api.clients.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(deferredSearch.toLowerCase())) ||
      c.email.toLowerCase().includes(deferredSearch.toLowerCase()),
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportClientsToCsv(clients)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => openQuickCreate('client')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Client</span>
            </button>
          </div>
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
                  <td colSpan={7}>
                    <EmptyState
                      compact
                      icon={Users}
                      title={searchTerm ? 'No clients matching search' : 'No clients yet'}
                      description="Clients are the foundation of your business. Every project, contract, and invoice connects directly to a client."
                      primaryAction={{
                        label: 'Add First Client',
                        onClick: () => openQuickCreate('client'),
                        icon: Plus,
                      }}
                    />
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/clients/${client.id}`}
                          className="p-1 text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 text-[11px] font-medium"
                        >
                          <span>View</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete client "${client.name}"?`)) {
                              deleteClientMutation.mutate(client.id);
                            }
                          }}
                          title="Delete Client"
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
