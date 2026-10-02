'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  FileSignature,
  Repeat,
  PenTool,
  UserPlus,
  Star,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';

export default function ClientDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const openQuickCreate = useAppStore((s) => s.openQuickCreate);

  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'invoices' | 'contracts' | 'timeline'>('overview');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any | null>(null);

  // Multiple contacts state
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState('Creative Lead');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => api.clients.get(id),
    enabled: Boolean(id),
  });

  const addContactMutation = useMutation({
    mutationFn: (data: any) => api.clients.addContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      setIsAddContactOpen(false);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactRole('Creative Lead');
      setContactIsPrimary(false);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => api.clients.deleteContact(id, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
    },
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['clientTimeline', id],
    queryFn: () => api.clients.getTimeline(id),
    enabled: Boolean(id),
  });

  const { data: allContracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => api.contracts.list(),
  });

  const { data: allRetainers = [] } = useQuery({
    queryKey: ['retainers'],
    queryFn: () => api.retainers.list(),
  });

  const signContractMutation = useMutation({
    mutationFn: ({ contractId, signer }: { contractId: string; signer: string }) =>
      api.contracts.sign(contractId, signer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
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

  // Filter contracts and retainers for this client
  const clientContracts = allContracts.filter((c) => c.clientId === id);
  const clientRetainers = allRetainers.filter((r) => r.clientId === id);

  // Client profitability calculations
  const totalClientExpenses = projects.reduce((sum: number, p: any) => sum + (p.totalExpenses || 0), 0);
  const clientNetProfit = (client.totalRevenue || 0) - totalClientExpenses;
  const clientProfitMargin = (client.totalRevenue || 0) > 0 ? Math.round((clientNetProfit / client.totalRevenue) * 100) : 0;
  const contactsList = client.contacts || [];

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
                onClick={() => setIsAddContactOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Contact</span>
              </button>
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

        {/* Client Financials Banner & Profitability */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Lifetime Revenue
            </span>
            <div className="text-base sm:text-lg font-semibold text-foreground font-mono mt-1">
              {formatCurrency(client.totalRevenue, client.currency)}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Direct Expenses
            </span>
            <div className="text-base sm:text-lg font-semibold text-foreground font-mono mt-1">
              {formatCurrency(totalClientExpenses, client.currency)}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Net Profit
            </span>
            <div className={`text-base sm:text-lg font-semibold font-mono mt-1 ${clientNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {formatCurrency(clientNetProfit, client.currency)}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Profit Margin
            </span>
            <div className={`text-base sm:text-lg font-semibold font-mono mt-1 ${clientProfitMargin >= 40 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
              {clientProfitMargin}%
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Outstanding Balance
            </span>
            <div className="text-base sm:text-lg font-semibold font-mono mt-1 text-amber-600 dark:text-amber-400">
              {formatCurrency(client.outstandingBalance, client.currency)}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Projects Active
            </span>
            <div className="text-base sm:text-lg font-semibold text-foreground font-mono mt-1">
              {client.activeProjectsCount} / {projects.length}
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
            Overview & Contacts ({contactsList.length})
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
            onClick={() => setActiveTab('contracts')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'contracts'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Contracts & Retainers ({clientContracts.length + clientRetainers.length})
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

        {/* Tab 1: Overview, Contacts Directory & Notes */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 p-5 rounded-lg border border-border bg-card space-y-4">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Primary Location & Office
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
                <div className="p-3 bg-muted/40 rounded-md border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {client.notes || 'No client notes entered.'}
                </div>
              </div>
            </div>

            {/* Multiple Contacts Directory */}
            <div className="p-5 rounded-lg border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Key Contacts & Stakeholders
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Manage direct decision makers, accounts payable officers, and creative leads for this client.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddContactOpen(true)}
                  className="px-2.5 py-1 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md border border-border inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Contact</span>
                </button>
              </div>

              {contactsList.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-md">
                  No additional contacts listed. Add client stakeholders to maintain multi-party communications.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {contactsList.map((ct: any) => (
                    <div
                      key={ct.id}
                      className="p-3.5 rounded-md border border-border bg-background space-y-2 hover:border-foreground/30 transition-colors relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">{ct.name}</span>
                            {ct.isPrimary ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium inline-flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                Primary
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[11px] text-muted-foreground block">{ct.role || 'Contact'}</span>
                        </div>

                        {!ct.isPrimary && (
                          <button
                            onClick={() => deleteContactMutation.mutate(ct.id)}
                            className="text-muted-foreground/50 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 text-xs pt-1 border-t border-border/60">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="w-3 h-3 shrink-0" />
                          <a href={`mailto:${ct.email}`} className="text-foreground hover:underline truncate">
                            {ct.email}
                          </a>
                        </div>
                        {ct.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3 h-3 shrink-0" />
                            <a href={`tel:${ct.phone}`} className="text-foreground hover:underline">
                              {ct.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Projects */}
        {activeTab === 'projects' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-xs">
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
          </div>
        )}

        {/* Tab 3: Invoices */}
        {activeTab === 'invoices' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-xs">
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
                          {formatCurrency(inv.totalAmount || inv.total, inv.currency)}
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
          </div>
        )}

        {/* Tab 4: Contracts & Retainers (Contextual) */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            {/* Contracts Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Service Agreements & Contracts
                  </h3>
                </div>
              </div>

              <div className="border border-border rounded-lg bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">Agreement Title</th>
                        <th className="py-2.5 px-4 font-medium">Status</th>
                        <th className="py-2.5 px-4 font-medium">Value</th>
                        <th className="py-2.5 px-4 font-medium">Valid Until</th>
                        <th className="py-2.5 px-4 font-medium text-right">Signature Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {clientContracts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No contracts registered for this client.
                          </td>
                        </tr>
                      ) : (
                        clientContracts.map((c) => (
                          <tr key={c.id} className="table-row-hover">
                            <td className="py-3 px-4 font-medium text-foreground">
                              {c.title}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(c.status)}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium">
                              {(c as any).value ? formatCurrency((c as any).value) : 'Standard MSA'}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-mono">
                              {c.endDate ? formatDate(c.endDate) : 'Ongoing'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {c.status === 'signed' ? (
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Signed by {c.signerName || 'Client'}</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    signContractMutation.mutate({
                                      contractId: c.id,
                                      signer: client.name,
                                    })
                                  }
                                  disabled={signContractMutation.isPending}
                                  className="px-2.5 py-1 text-[11px] font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded transition-colors"
                                >
                                  Sign Agreement
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Retainers Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Recurring Retainers
                </h3>
              </div>

              <div className="border border-border rounded-lg bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">Billing Period</th>
                        <th className="py-2.5 px-4 font-medium">Monthly Retainer</th>
                        <th className="py-2.5 px-4 font-medium">Allocated Hours</th>
                        <th className="py-2.5 px-4 font-medium">Rollover Policy</th>
                        <th className="py-2.5 px-4 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {clientRetainers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No active retainers established for this client.
                          </td>
                        </tr>
                      ) : (
                        clientRetainers.map((r) => (
                          <tr key={r.id} className="table-row-hover">
                            <td className="py-3 px-4 font-medium text-foreground capitalize">
                              {r.title || 'Monthly Retainer'}
                            </td>
                            <td className="py-3 px-4 font-mono font-medium">
                              {formatCurrency(r.monthlyAmount, r.currency)}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              {r.includedHours} hrs / month
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-mono">
                              {r.usedHours} used ({r.remainingHours} remaining)
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(r.status)}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Relationship Timeline */}
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

      {/* Add Contact Modal */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Add Client Contact</h3>
              </div>
              <button
                onClick={() => setIsAddContactOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!contactName.trim() || !contactEmail.trim()) return;
                addContactMutation.mutate({
                  name: contactName.trim(),
                  email: contactEmail.trim(),
                  phone: contactPhone.trim() || null,
                  role: contactRole.trim() || 'Contact',
                  isPrimary: contactIsPrimary,
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya@client.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Billing & Accounts"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="contact-is-primary"
                  checked={contactIsPrimary}
                  onChange={(e) => setContactIsPrimary(e.target.checked)}
                  className="rounded border-border text-foreground focus:ring-0"
                />
                <label htmlFor="contact-is-primary" className="text-xs text-muted-foreground cursor-pointer select-none">
                  Set as primary decision maker for this client
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addContactMutation.isPending}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors"
                >
                  {addContactMutation.isPending ? 'Saving...' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
