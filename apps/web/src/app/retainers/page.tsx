'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@freelanceros/ui';
import {
  Repeat,
  Plus,
  Clock,
  AlertCircle,
  Calendar,
  Building,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function RetainersPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('50000');
  const [includedHours, setIncludedHours] = useState('20');
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  // Fetch retainers
  const { data: retainers = [], isLoading } = useQuery({
    queryKey: ['retainers'],
    queryFn: () => api.retainers.list(),
  });

  // Create retainer mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.retainers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retainers'] });
      setIsCreateModalOpen(false);
      setTitle('');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title) return;

    createMutation.mutate({
      clientId,
      title,
      monthlyRate: Number(monthlyRate),
      includedHours: Number(includedHours),
      billingCycle,
      status: 'active',
      startDate: new Date().toISOString(),
    });
  };

  const totalMRR = retainers
    .filter((r) => r.status === 'active')
    .reduce((acc, r) => acc + (r.monthlyAmount || r.monthlyRate || 0), 0);

  const totalCommittedHours = retainers
    .filter((r) => r.status === 'active')
    .reduce((acc, r) => acc + (r.includedHours || 0), 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Retainers & MRR</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monthly recurring client agreements, allocated creative hours, and utilization tracking.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Retainer</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Monthly Recurring Revenue (MRR)
            </span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatCurrency(totalMRR)}/mo
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Predictable baseline cash flow
            </span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Committed Retainer Hours
            </span>
            <div className="text-xl font-semibold text-foreground mt-1 font-mono">
              {totalCommittedHours} hrs/mo
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Capacity dedicated to retainers
            </span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Active Retainers
            </span>
            <div className="text-xl font-semibold text-foreground mt-1 font-mono">
              {retainers.filter((r) => r.status === 'active').length}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Recurring client accounts</span>
          </div>
        </div>

        {/* Retainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {retainers.length === 0 ? (
            <div className="col-span-full p-8 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
              No retainer agreements set up. Lock in predictable recurring monthly revenue.
            </div>
          ) : (
            retainers.map((retainer) => {
              const client = clients.find((c) => c.id === retainer.clientId);
              const usedHours = (retainer as any).usedHours || 14;
              const totalHours = retainer.includedHours || 20;
              const usagePercent = Math.min(Math.round((usedHours / totalHours) * 100), 100);

              return (
                <div
                  key={retainer.id}
                  className="p-4 border border-border rounded-lg bg-card flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-muted-foreground">
                        {client?.company || client?.name || 'Client'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                          retainer.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {retainer.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-foreground">{retainer.title || `${client?.name || 'Client'} Retainer`}</h3>
                    <div className="text-xl font-mono font-semibold text-foreground">
                      {formatCurrency(retainer.monthlyAmount || retainer.monthlyRate || 0)}
                      <span className="text-xs font-normal text-muted-foreground"> / month</span>
                    </div>
                  </div>

                  {/* Hours Capacity Gauge */}
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Monthly Capacity</span>
                      <span className="font-mono font-medium text-foreground">
                        {usedHours} / {totalHours} hrs ({usagePercent}%)
                      </span>
                    </div>

                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          usagePercent > 90 ? 'bg-amber-500' : 'bg-neutral-900 dark:bg-white'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Renews 1st of month</span>
                      <span>{totalHours - usedHours} hrs left</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create Retainer Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-5 bg-card border border-border rounded-lg shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">Create Retainer Agreement</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Client *
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="">Select Client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Retainer Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly Design & Video Editing Retainer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Monthly Rate (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={monthlyRate}
                      onChange={(e) => setMonthlyRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Included Hours / Month *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={includedHours}
                      onChange={(e) => setIncludedHours(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Set Up Retainer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
