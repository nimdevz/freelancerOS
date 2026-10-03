'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@freelanceros/ui';
import { Proposal } from '@freelanceros/types';
import {
  FileText,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Calendar,
  Building,
  DollarSign,
  ArrowRight,
  Calculator,
  Zap,
  Sparkles,
  Percent,
  Clock,
  Layers,
  X,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ClientSelector } from '@/components/common/ClientSelector';
import {
  CustomDetailsSection,
  CustomFieldItem,
  formatCustomDetailsSummary,
} from '@/components/common/CustomDetailsSection';

const PROPOSAL_TEMPLATES = [
  {
    id: 'commercial-video',
    name: 'Commercial Video Campaign ($12,500)',
    title: 'Commercial Brand Film & Digital Campaign',
    content: 'Full end-to-end commercial video production including pre-production scriptwriting, 2-day 4K multi-cam shoot, DaVinci Resolve color grading, sound design, and 3 client revision rounds.',
    items: [
      { description: 'Pre-Production, Treatment & Script Breakdown', quantity: 1, unitPrice: 25000 },
      { description: '2-Day 4K Cinema Production (Camera, Lighting, Audio Crew)', quantity: 1, unitPrice: 70000 },
      { description: 'Post-Production: Editing, Color Grading & Dolby Mix', quantity: 1, unitPrice: 30000 },
    ],
  },
  {
    id: 'web-platform',
    name: 'Full-Stack Web MVP ($16,500)',
    title: 'Full-Stack Edge Application MVP',
    content: 'Edge-first SaaS application architecture with Cloudflare Workers, Next.js, and libSQL/Turso. Includes authentication, responsive frontend dashboard, and production deployment.',
    items: [
      { description: 'Database Schema, Architecture & Security Guardrails', quantity: 1, unitPrice: 35000 },
      { description: 'Edge API Routes, Authentication & File Pipelines', quantity: 1, unitPrice: 65000 },
      { description: 'Next.js Frontend Dashboard & Responsive Tokens', quantity: 1, unitPrice: 65000 },
    ],
  },
  {
    id: 'brand-identity',
    name: 'Brand Identity & Guidelines ($5,000)',
    title: 'Brand Visual Identity & System Guidelines',
    content: 'Complete brand identity creation including discovery workshop, moodboards, logo suite, typography, color palette, design tokens, and comprehensive 35-page brand book PDF.',
    items: [
      { description: 'Creative Discovery Workshop & Art Direction Boards', quantity: 1, unitPrice: 15000 },
      { description: 'Core Brand Mark, Monogram & Vector Lockup Suite', quantity: 1, unitPrice: 25000 },
      { description: 'Brand Guidelines Documentation & Master Asset Kit', quantity: 1, unitPrice: 10000 },
    ],
  },
];

const ADDON_OPTIONS = [
  { id: 'rush-48h', name: '⚡ Rush 48-Hour Turnaround', price: 15000 },
  { id: 'raw-footage', name: '🎬 RAW Footage & Master Project Files Buyout', price: 25000 },
  { id: 'multilingual', name: '🌐 Multilingual Subtitling & Captioning', price: 8000 },
  { id: 'extended-licensing', name: '🛡️ 1-Year Extended Commercial Licensing', price: 18000 },
];

export default function ProposalsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'proposals' | 'quotes'>('proposals');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);

  // Form states for creating proposal
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  const [paymentMilestones, setPaymentMilestones] = useState({
    deposit: 50,
    interim: 25,
    final: 25,
  });

  const [items, setItems] = useState<Array<{ description: string; quantity: number; unitPrice: number }>>([
    { description: 'Initial Discovery & Concept Ideation', quantity: 1, unitPrice: 25000 },
    { description: 'Creative Production & Master Assets', quantity: 1, unitPrice: 75000 },
  ]);

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  // Fetch proposals
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => api.proposals.list(),
  });

  // Fetch quotes
  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => api.quotes.list(),
  });

  // Create proposal mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.proposals.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsCreateModalOpen(false);
      setTitle('');
      setContent('');
      setDiscountPercent(0);
      setSelectedAddons([]);
      setCustomFields([]);
      setCustomNotes('');
    },
  });

  // Status mutations
  const sendMutation = useMutation({
    mutationFn: (id: string) => api.proposals.send(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals'] }),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.proposals.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => api.proposals.decline(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals'] }),
  });

  // Proposal -> Project conversion
  const convertProposalMutation = useMutation({
    mutationFn: async (proposal: Proposal) => {
      const proj = await api.projects.create({
        clientId: proposal.clientId,
        name: proposal.title,
        description: proposal.content || 'Scope defined in proposal agreement.',
        budget: proposal.totalAmount || proposal.total || proposal.subtotal,
        currency: proposal.currency || 'USD',
        status: 'active',
      });
      if (proposal.status !== 'accepted') {
        await api.proposals.accept(proposal.id);
      }
      return proj;
    },
    onSuccess: (proj) => {
      alert(`Proposal converted! Active project "${proj.name}" is now ready.`);
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const convertQuoteMutation = useMutation({
    mutationFn: (id: string) => api.quotes.convertToProject(id),
    onSuccess: () => {
      alert('Quote converted to active project successfully!');
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProposalMutation = useMutation({
    mutationFn: (id: string) => api.proposals.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: (id: string) => api.quotes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 10000 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;
    setItems(updated);
  };

  const handleApplyTemplate = (tmpl: (typeof PROPOSAL_TEMPLATES)[0]) => {
    setTitle(tmpl.title);
    setContent(tmpl.content);
    setItems(tmpl.items.map((it) => ({ ...it })));
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // Financial calculations
  const addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const addon = ADDON_OPTIONS.find((a) => a.id === addonId);
    return acc + (addon ? addon.price : 0);
  }, 0);

  const baseSubtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) + addonsTotal;
  const discountAmount = Math.round(baseSubtotal * (discountPercent / 100));
  const calculatedSubtotal = Math.max(0, baseSubtotal - discountAmount);
  const calculatedTax = Math.round(calculatedSubtotal * 0.18); // 18% GST default
  const calculatedTotal = calculatedSubtotal + calculatedTax;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title) return;

    // Combine regular line items with selected add-ons
    const finalItems = [
      ...items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        amount: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
      ...selectedAddons.map((addonId) => {
        const addon = ADDON_OPTIONS.find((a) => a.id === addonId)!;
        return {
          description: `Add-on: ${addon.name}`,
          quantity: 1,
          unitPrice: addon.price,
          amount: addon.price,
        };
      }),
    ];

    const customDetails = formatCustomDetailsSummary(customFields, customNotes);

    createMutation.mutate({
      clientId,
      title,
      content: content || 'Comprehensive scope of work and production milestones.',
      validUntil: validUntil || new Date(Date.now() + 14 * 86400000).toISOString(),
      items: finalItems,
      subtotal: calculatedSubtotal,
      discountPercent,
      discountAmount,
      tax: calculatedTax,
      total: calculatedTotal,
      notes: customDetails || undefined,
      terms: `Payment schedule: ${paymentMilestones.deposit}% upon signing, ${paymentMilestones.interim}% upon interim milestone, ${paymentMilestones.final}% upon final delivery sign-off.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'sent':
      case 'viewed':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'declined':
      case 'rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'expired':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Proposals & Estimates</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Send clean, high-conversion commercial proposals, add-on packages, and automated payment schedules.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Proposal</span>
          </button>
        </div>

        {/* Tab Switcher: Proposals vs Quotes */}
        <div className="flex border-b border-border gap-5 sm:space-x-6 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('proposals')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'proposals'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Proposals ({proposals.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'quotes'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Quotes & Estimates ({quotes.length})
          </button>
        </div>

        {/* Tab 1: Proposals */}
        {activeTab === 'proposals' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4">Client</th>
                    <th className="py-2.5 px-4">Value</th>
                    <th className="py-2.5 px-4">Valid Until</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {proposals.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          compact
                          icon={FileText}
                          title="No proposals created yet"
                          description="Pitch your creative services with clear deliverables, milestone payment breakdowns, and validity deadlines."
                          primaryAction={{
                            label: 'Draft Proposal',
                            onClick: () => setIsCreateModalOpen(true),
                            icon: Plus,
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    proposals.map((proposal) => {
                      const client = clients.find((c) => c.id === proposal.clientId);
                      return (
                        <tr key={proposal.id} className="table-row-hover transition-colors">
                          <td className="py-3 px-4 font-semibold text-foreground">
                            {proposal.title}
                          </td>
                          <td className="py-3 px-4 text-foreground">
                            {client ? `${client.name} (${client.company || 'Direct'})` : 'Client'}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-foreground">
                            {formatCurrency(proposal.totalAmount || proposal.total || 0)}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-mono">
                            {proposal.validUntil ? formatDate(proposal.validUntil) : '14 Days'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono border ${getStatusBadge(
                                proposal.status
                              )}`}
                            >
                              {proposal.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewProposal(proposal)}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-muted-foreground hover:text-foreground"
                                title="Preview Document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {proposal.status === 'draft' && (
                                <button
                                  onClick={() => sendMutation.mutate(proposal.id)}
                                  className="px-2 py-1 text-[11px] font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded hover:opacity-90"
                                >
                                  Send
                                </button>
                              )}

                              {(proposal.status === 'sent' || proposal.status === 'viewed') && (
                                <button
                                  onClick={() => convertProposalMutation.mutate(proposal)}
                                  className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1"
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>Accept & Convert</span>
                                </button>
                              )}

                              {proposal.status === 'accepted' && (
                                <button
                                  onClick={() => convertProposalMutation.mutate(proposal)}
                                  className="px-2 py-1 text-[11px] font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded inline-flex items-center gap-1 hover:opacity-90"
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>Convert to Project</span>
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete proposal "${proposal.title}"?`)) {
                                    deleteProposalMutation.mutate(proposal.id);
                                  }
                                }}
                                title="Delete Proposal"
                                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Contextual Quotes & Estimates */}
        {activeTab === 'quotes' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                    <th className="py-2.5 px-4">Quote #</th>
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4">Estimated Value</th>
                    <th className="py-2.5 px-4">Valid Until</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quotes.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          compact
                          icon={Calculator}
                          title="No quotes generated yet"
                          description="Generate rapid estimates and formal quotes with instant 1-click conversion into active client projects."
                          primaryAction={{
                            label: 'Draft Proposal / Quote',
                            onClick: () => setIsCreateModalOpen(true),
                            icon: Plus,
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    quotes.map((q) => (
                      <tr key={q.id} className="table-row-hover transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                          {q.quoteNumber || q.id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {q.title}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {formatCurrency(q.totalAmount || q.total || 0, q.currency)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          {q.validUntil ? formatDate(q.validUntil) : '14 Days'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              q.status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                                : q.status === 'sent'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200'
                                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200'
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => convertQuoteMutation.mutate(q.id)}
                              disabled={convertQuoteMutation.isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded hover:opacity-90 transition-opacity"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Convert to Project</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete quote "${q.title}"?`)) {
                                  deleteQuoteMutation.mutate(q.id);
                                }
                              }}
                              title="Delete Quote"
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded text-muted-foreground hover:text-rose-500 transition-colors"
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
        )}

        {/* Create Proposal Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 bg-card border border-border rounded-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Create Commercial Proposal</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Template Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Load Proposal Template</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PROPOSAL_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="text-left p-2 rounded-md border border-border bg-background hover:border-foreground/40 transition-colors"
                    >
                      <div className="text-[11px] font-semibold text-foreground truncate">{tmpl.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{tmpl.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ClientSelector
                    value={clientId}
                    onChange={(id) => setClientId(id)}
                    label="Target Client"
                    required
                  />

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Valid Until Date
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Proposal Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Brand Film Campaign"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Scope Overview & Deliverables Narrative
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe scope, objectives, milestones, and deliverables..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                  />
                </div>

                {/* Line Items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Line Items & Deliverables</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Service description"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none font-mono"
                        />
                        <input
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-28 px-2 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none font-mono"
                        />
                        <span className="w-24 text-right text-xs font-mono font-medium text-foreground">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-muted-foreground hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Add-on Packages */}
                <div className="space-y-1.5 p-3 rounded-lg border border-border bg-background">
                  <label className="text-[11px] font-semibold text-foreground block">
                    Optional Add-on Packages & Rights
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ADDON_OPTIONS.map((addon) => (
                      <label
                        key={addon.id}
                        className="flex items-center justify-between p-2 rounded border border-border/80 hover:border-foreground/30 text-xs cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedAddons.includes(addon.id)}
                            onChange={() => toggleAddon(addon.id)}
                            className="rounded border-border text-foreground w-3.5 h-3.5"
                          />
                          <span className="text-foreground">{addon.name}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">+{formatCurrency(addon.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Discount & Payment Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Promotional Discount (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Math.max(0, Math.min(50, Number(e.target.value))))}
                        className="w-24 px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground font-mono focus:outline-none"
                      />
                      {discountAmount > 0 && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                          -{formatCurrency(discountAmount)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Milestone Payment Schedule
                    </label>
                    <div className="text-[11px] font-mono text-muted-foreground space-y-0.5">
                      <div>Deposit (50%): {formatCurrency(Math.round(calculatedTotal * 0.5))}</div>
                      <div>Rough Cut (25%): {formatCurrency(Math.round(calculatedTotal * 0.25))}</div>
                      <div>Final Sign-off (25%): {formatCurrency(Math.round(calculatedTotal * 0.25))}</div>
                    </div>
                  </div>
                </div>

                {/* Custom Details & Specifications */}
                <CustomDetailsSection
                  fields={customFields}
                  onChange={setCustomFields}
                  notes={customNotes}
                  onNotesChange={setCustomNotes}
                  title="Custom Proposal Details & Specifications"
                  buttonLabel="+ Add Custom Detail / Scope Spec"
                  notesPlaceholder="Add custom client requirements, special deliverables, or billing clauses..."
                />

                {/* Calculations Summary */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Services & Add-ons</span>
                    <span>{formatCurrency(baseSubtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST / Sales Tax (18%)</span>
                    <span>{formatCurrency(calculatedTax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground text-sm pt-1 border-t border-border">
                    <span>Total Investment</span>
                    <span>{formatCurrency(calculatedTotal)}</span>
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
                    className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-xs"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save Proposal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Editorial Proposal Preview Modal */}
        {previewProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 bg-card border border-border rounded-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                  <span className="text-xs uppercase font-mono tracking-widest text-muted-foreground">
                    Proposal Document
                  </span>
                </div>
                <button
                  onClick={() => setPreviewProposal(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕ Close Preview
                </button>
              </div>

              {/* Document Header */}
              <div className="space-y-2">
                <div className="text-2xl font-semibold tracking-tight text-foreground">
                  {previewProposal.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  Issued on {formatDate(previewProposal.createdAt)} • Valid until{' '}
                  {previewProposal.validUntil ? formatDate(previewProposal.validUntil) : '14 Days'}
                </div>
              </div>

              {/* Content / Terms */}
              <div className="text-xs leading-relaxed text-foreground/90 p-4 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 border border-border">
                {previewProposal.content || 'Scope of work, milestone timelines, and creative deliverables.'}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground uppercase font-mono">Investment Breakdown</div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="p-3 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-between text-xs text-muted-foreground font-medium border-b border-border">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    {(previewProposal.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-foreground">
                        <span>{it.description}</span>
                        <span className="font-mono">{formatCurrency(it.amount || it.unitPrice * (it.quantity || 1))}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-mono text-muted-foreground pt-2 border-t border-border">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(
                          previewProposal.subtotal ||
                            (previewProposal.totalAmount || previewProposal.total || 0) * 0.85
                        )}
                      </span>
                    </div>
                    {previewProposal.discountAmount ? (
                      <div className="flex justify-between font-mono text-emerald-600 dark:text-emerald-400">
                        <span>Discount ({previewProposal.discountPercent}%)</span>
                        <span>-{formatCurrency(previewProposal.discountAmount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between font-mono text-muted-foreground">
                      <span>Tax (18% GST)</span>
                      <span>
                        {formatCurrency(
                          previewProposal.tax ||
                            (previewProposal.totalAmount || previewProposal.total || 0) * 0.15
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono font-semibold text-sm text-foreground pt-2 border-t border-border">
                      <span>Total Project Investment</span>
                      <span>{formatCurrency(previewProposal.totalAmount || previewProposal.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Milestones Breakdown */}
              <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2 text-xs">
                <div className="font-semibold text-foreground">Payment Milestones & Schedule:</div>
                <div className="grid grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="p-2.5 rounded bg-background border border-border">
                    <span className="text-muted-foreground block text-[10px]">50% Kickoff Deposit</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(Math.round((previewProposal.totalAmount || previewProposal.total || 0) * 0.5))}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-background border border-border">
                    <span className="text-muted-foreground block text-[10px]">25% Interim Review</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(Math.round((previewProposal.totalAmount || previewProposal.total || 0) * 0.25))}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-background border border-border">
                    <span className="text-muted-foreground block text-[10px]">25% Final Sign-off</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(Math.round((previewProposal.totalAmount || previewProposal.total || 0) * 0.25))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => setPreviewProposal(null)}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    convertProposalMutation.mutate(previewProposal);
                    setPreviewProposal(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white rounded-md shadow-xs inline-flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Convert to Active Project</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
