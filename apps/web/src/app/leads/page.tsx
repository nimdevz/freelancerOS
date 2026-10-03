'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@freelanceros/ui';
import {
  Target,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Share2,
  Copy,
  Clock,
  AlertCircle,
  X,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

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
  const openQuickCreate = useAppStore((s) => s.openQuickCreate);

  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Lead Intake Form states
  const [prospectName, setProspectName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Commercial Video Production');
  const [estimatedBudget, setEstimatedBudget] = useState(15000);
  const [targetTimeline, setTargetTimeline] = useState('4 Weeks');
  const [projectBrief, setProjectBrief] = useState('');
  const [referralSource, setReferralSource] = useState('Direct Referral');
  const [followUpDate, setFollowUpDate] = useState('2026-10-04');

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.leads.list(),
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: any) => api.leads.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsIntakeModalOpen(false);
      setProspectName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setProjectBrief('');
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.leads.update(id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateFollowUpMutation = useMutation({
    mutationFn: ({ id, nextActionDate, nextAction }: { id: string; nextActionDate: string; nextAction: string }) =>
      api.leads.update(id, { nextActionDate, nextAction }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => api.leads.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleCopyIntakeLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(window.location.origin + '/leads?intake=new');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName.trim()) return;

    createLeadMutation.mutate({
      title: `${serviceCategory} — ${company || prospectName}`,
      clientName: prospectName.trim(),
      company: company.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      value: Number(estimatedBudget) || 10000,
      currency: 'USD',
      stage: 'new',
      probabilityPercent: 20,
      nextAction: `Follow-up call on ${targetTimeline} project brief`,
      nextActionDate: followUpDate || null,
      source: referralSource,
      notes: projectBrief || 'Submitted via Client Intake Form.',
    });
  };

  const today = '2026-10-01';

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Sales Pipeline & CRM</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track prospects from client intake, scheduled follow-up reminders, to proposal and project conversion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyIntakeLink}
              className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border inline-flex items-center gap-1.5"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Intake Link'}</span>
            </button>
            <button
              onClick={() => setIsIntakeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture Lead</span>
            </button>
          </div>
        </div>

        {/* Pipeline Board */}
        {leads.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No prospective leads in pipeline"
            description="Track prospective opportunities, follow-up dates, deal probability, and convert won leads directly into active projects."
            primaryAction={{
              label: 'Capture New Lead',
              onClick: () => setIsIntakeModalOpen(true),
              icon: Plus,
            }}
          />
        ) : (
          <div className="flex md:grid md:grid-cols-7 gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            {STAGES.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage.id);
              const stageValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

              return (
                <div
                  key={stage.id}
                  className="bg-card rounded-lg border border-border p-3 flex flex-col w-[270px] sm:w-[280px] md:w-auto shrink-0 md:shrink snap-center"
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
                        {formatCurrency(stageValue, 'USD')}
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
                      stageLeads.map((lead) => {
                        const isOverdue = lead.nextActionDate && lead.nextActionDate < today;

                        return (
                          <div
                            key={lead.id}
                            className="p-2.5 rounded-md border border-border bg-background hover:border-foreground/40 transition-colors space-y-2 shadow-xs"
                          >
                            <div>
                              <span className="text-xs font-semibold text-foreground leading-tight block">
                                {lead.title}
                              </span>
                              <span className="text-[11px] text-muted-foreground block">
                                {lead.clientName} {lead.company ? `(${lead.company})` : ''}
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

                            {/* Follow-up Date & Reminder */}
                            {lead.nextActionDate && (
                              <div
                                className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                  isOverdue
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                    : 'bg-muted text-muted-foreground border-border'
                                }`}
                              >
                                {isOverdue ? (
                                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                                ) : (
                                  <Clock className="w-2.5 h-2.5 shrink-0" />
                                )}
                                <span>
                                  {isOverdue ? 'Overdue: ' : 'Follow-up: '}
                                  {formatDate(lead.nextActionDate)}
                                </span>
                              </div>
                            )}

                            {lead.nextAction && (
                              <div className="text-[10px] bg-muted/60 p-1 rounded text-foreground leading-tight">
                                {lead.nextAction}
                              </div>
                            )}

                            {/* Stage Controls */}
                            <div className="pt-1.5 border-t border-border/60 flex items-center justify-between gap-1">
                              {stage.id === 'won' ? (
                                <button
                                  onClick={() => convertLeadMutation.mutate(lead.id)}
                                  disabled={convertLeadMutation.isPending}
                                  className="flex-1 py-1 text-[10px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center gap-1 transition-colors"
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
                                  className="text-[10px] bg-muted text-foreground border border-border/80 rounded px-1.5 py-0.5 flex-1 focus:outline-none"
                                >
                                  {STAGES.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      Move to: {s.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete lead "${lead.title}"?`)) {
                                    deleteLeadMutation.mutate(lead.id);
                                  }
                                }}
                                title="Delete Lead"
                                className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Client Intake / Lead Capture Modal */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Client Intake & Inbound Lead Capture</h3>
              </div>
              <button
                onClick={() => setIsIntakeModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jessica Miller"
                    value={prospectName}
                    onChange={(e) => setProspectName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Media Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="jessica@client.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2811"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Service Required
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground focus:outline-none"
                  >
                    <option value="Commercial Video Production">Commercial Video Production</option>
                    <option value="Brand Identity & Design System">Brand Identity & Design System</option>
                    <option value="Full-Stack Web App Development">Full-Stack Web App Development</option>
                    <option value="Monthly Creative Retainer">Monthly Creative Retainer</option>
                    <option value="Motion Graphics & 3D">Motion Graphics & 3D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Estimated Budget (USD)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Target Timeline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3-4 Weeks / Launch in Nov"
                    value={targetTimeline}
                    onChange={(e) => setTargetTimeline(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1">
                  Project Brief & Client Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key deliverables, target audience, style preferences, and goals..."
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsIntakeModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLeadMutation.isPending}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors"
                >
                  {createLeadMutation.isPending ? 'Capturing...' : 'Capture Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
