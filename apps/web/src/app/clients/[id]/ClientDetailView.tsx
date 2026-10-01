'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, formatRelativeTime, getStatusBadgeClass } from '@freelanceros/ui';
import {
  Users,
  Mail,
  Phone,
  MapPin,
  FolderKanban,
  FileCheck2,
  Calendar,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';

export default function ClientDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { openQuickCreate } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'invoices' | 'timeline'>('overview');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any | null>(null);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => api.clients.get(id),
    enabled: Boolean(id),
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['clientTimeline', id],
    queryFn: () => api.clients.getTimeline(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">Loading client details...</div>
      </AppShell>
    );
  }

  if (!client) {
    return (
      <AppShell>
        <div className="py-16 text-center space-y-3">
          <p className="text-xs text-muted-foreground">Client profile not found or ID is unavailable.</p>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Clients</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  const projects = client.projects || [];
  const invoices = client.invoices || [];
  const payments = client.payments || [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Clients</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{client.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded border border-border bg-muted/50 font-mono text-muted-foreground">
                  {client.currency}
                </span>
              </div>
              {client.company && (
                <p className="text-xs text-muted-foreground mt-0.5">{client.company}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openQuickCreate('project')}
                className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
              >
                + New Project
              </button>
              <button
                onClick={() => openQuickCreate('invoice')}
                className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors"
              >
                + New Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Client Financials Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Lifetime Revenue
            </span>
            <div className="text-base sm:text-lg font-semibold text-foreground font-mono mt-1">
              {formatCurrency(client.totalRevenue, client.currency)}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Outstanding Balance
            </span>
            <div className="text-base sm:text-lg font-semibold font-mono mt-1 text-amber-600 dark:text-amber-400">
              {formatCurrency(client.outstandingBalance, client.currency)}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Active Projects
            </span>
            <div className="text-base sm:text-lg font-semibold text-foreground font-mono mt-1">
              {client.activeProjectsCount}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Total Projects
            </span>
            <div className="text-base sm:text-lg font-semibold text-foreground font-mono mt-1">
              {projects.length}
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-border gap-5 sm:space-x-6 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'overview'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview & Notes
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'projects'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'invoices'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Invoices & Payments ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'timeline'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Relationship Timeline
          </button>
        </div>

        {/* Tab 1: Overview & Contact Info */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 p-5 rounded-lg border border-border bg-card space-y-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Contact Details
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-foreground">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-foreground">{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="text-foreground">{client.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 p-5 rounded-lg border border-border bg-card space-y-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Client Notes & Scope Guidelines
              </h3>
              <div className="p-3 bg-muted/40 rounded-md border border-border text-xs text-foreground leading-relaxed">
                {client.notes || 'No client notes entered.'}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Projects */}
        {activeTab === 'projects' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Project</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium">Deadline</th>
                  <th className="py-2.5 px-4 font-medium">Progress</th>
                  <th className="py-2.5 px-4 font-medium text-right">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No projects created for this client yet.
                    </td>
                  </tr>
                ) : (
                  projects.map((p: any) => (
                    <tr key={p.id} className="table-row-hover">
                      <td className="py-3 px-4 font-medium text-foreground">
                        <Link href={`/projects/${p.id}`} className="hover:underline">
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {formatDate(p.deadline)}
                      </td>
                      <td className="py-3 px-4 font-mono">{p.progressPercent}%</td>
                      <td className="py-3 px-4 text-right font-medium font-mono">
                        {formatCurrency(p.budget, p.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Invoices */}
        {activeTab === 'invoices' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Invoice #</th>
                  <th className="py-2.5 px-4 font-medium">Title</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium">Due Date</th>
                  <th className="py-2.5 px-4 font-medium">Total</th>
                  <th className="py-2.5 px-4 font-medium">Balance Due</th>
                  <th className="py-2.5 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No invoices issued to this client yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv: any) => (
                    <tr key={inv.id} className="table-row-hover">
                      <td className="py-3 px-4 font-medium font-mono text-foreground">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{inv.title}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {formatCurrency(inv.totalAmount, inv.currency)}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {inv.balanceDue > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {formatCurrency(inv.balanceDue, inv.currency)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => setSelectedInvoiceForPayment(inv)}
                            className="px-2 py-1 text-[11px] font-medium bg-muted hover:bg-muted/80 rounded border border-border"
                          >
                            Record Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Relationship Timeline */}
        {activeTab === 'timeline' && (
          <div className="p-6 rounded-lg border border-border bg-card space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Chronological Memory of Client Relationship
            </h3>
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {timeline.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-6">No historical logs recorded yet.</p>
              ) : (
                timeline.map((item: any) => (
                  <div key={item.id} className="relative pl-6 text-xs">
                    <span className="absolute left-1 top-1 w-2 h-2 rounded-full bg-neutral-900 dark:bg-white -translate-x-1/2" />
                    <p className="font-medium text-foreground">{item.description}</p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          invoice={selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
        />
      )}
    </AppShell>
  );
}
