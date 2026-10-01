'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@freelanceros/ui';
import { Target, Plus, ArrowRight, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';

const STAGES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
] as const;

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const { openQuickCreate } = useAppStore();

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.leads.list(),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.leads.update(id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const convertLeadMutation = useMutation({
    mutationFn: (id: string) => api.leads.convert(id),
    onSuccess: (data) => {
      alert(`Lead converted! Created Client "${data.client.name}" and Project "${data.project?.name}".`);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Sales Pipeline</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track prospects from initial contact to proposal and project conversion.
            </p>
          </div>
          <button
            onClick={() => openQuickCreate('lead')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>

        {/* Pipeline Board */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            const stageValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

            return (
              <div
                key={stage.id}
                className="bg-card rounded-lg border border-border p-3 flex flex-col min-w-[200px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-mono">
                      {stageLeads.length}
                    </span>
                  </div>
                  {stageValue > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatCurrency(stageValue, 'INR')}
                    </span>
                  )}
                </div>

                {/* Lead Cards List */}
                <div className="space-y-2 flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-muted-foreground/60">
                      Empty
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-2.5 rounded-md border border-border bg-background hover:border-foreground/40 transition-colors space-y-2 shadow-xs"
                      >
                        <div>
                          <span className="text-xs font-semibold text-foreground leading-tight block">
                            {lead.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            {lead.clientName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-foreground font-mono">
                            {formatCurrency(lead.value, lead.currency)}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {lead.probabilityPercent}%
                          </span>
                        </div>

                        {lead.expectedCloseDate && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>Close: {formatDate(lead.expectedCloseDate)}</span>
                          </div>
                        )}

                        {lead.nextAction && (
                          <div className="text-[10px] bg-muted/60 p-1 rounded text-foreground leading-tight">
                            Next: {lead.nextAction}
                          </div>
                        )}

                        {/* Stage Controls */}
                        <div className="pt-1.5 border-t border-border/60 flex items-center justify-between gap-1">
                          {stage.id === 'won' ? (
                            <button
                              onClick={() => convertLeadMutation.mutate(lead.id)}
                              disabled={convertLeadMutation.isPending}
                              className="w-full py-1 text-[10px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center gap-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Convert to Project</span>
                            </button>
                          ) : (
                            <select
                              value={lead.stage}
                              onChange={(e) =>
                                updateStageMutation.mutate({ id: lead.id, stage: e.target.value })
                              }
                              className="text-[10px] bg-muted text-foreground border border-border/80 rounded px-1.5 py-0.5 w-full focus:outline-none"
                            >
                              {STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Move to: {s.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
