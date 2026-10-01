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
} from 'lucide-react';

export default function ProposalsPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);

  // Form states for creating proposal
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [validUntil, setValidUntil] = useState('');
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.proposals.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsCreateModalOpen(false);
      setTitle('');
      setContent('');
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

  const calculatedSubtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const calculatedTax = calculatedSubtotal * 0.18; // 18% GST default
  const calculatedTotal = calculatedSubtotal + calculatedTax;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title) return;

    createMutation.mutate({
      clientId,
      title,
      content: content || 'Comprehensive scope of work and production milestones.',
      validUntil: validUntil || new Date(Date.now() + 14 * 86400000).toISOString(),
      items: items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        amount: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: calculatedTotal,
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Proposals</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Send clean, high-conversion commercial proposals with automated pricing and project conversion.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Proposal</span>
          </button>
        </div>

        {/* Proposals Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left border-collapse text-xs">
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
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No proposals created yet. Pitch your creative services with a high-conversion proposal.
                    </td>
                  </tr>
                ) : (
                  proposals.map((proposal) => {
                    const client = clients.find((c) => c.id === proposal.clientId);
                    return (
                      <tr key={proposal.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
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
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              proposal.status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : proposal.status === 'sent' || proposal.status === 'viewed'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : proposal.status === 'declined'
                                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
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
                                onClick={() => acceptMutation.mutate(proposal.id)}
                                className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800"
                              >
                                Accept & Convert
                              </button>
                            )}
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

        {/* Create Proposal Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-card border border-border rounded-lg shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-semibold text-foreground">Draft Proposal</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Target Client *
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
                      Proposal Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brand Identity & Design System Package"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Project Overview & Terms
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
                    <label className="text-xs font-semibold text-foreground">Line Items</label>
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
                            className="p-1 text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(calculatedSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST (18%)</span>
                      <span>{formatCurrency(calculatedTax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-foreground text-sm pt-1 border-t border-border">
                      <span>Total Estimated</span>
                      <span>{formatCurrency(calculatedTotal)}</span>
                    </div>
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
                  Prepared by <span className="font-medium text-foreground">Nimish Studio</span> • Issued on{' '}
                  {formatDate(previewProposal.createdAt)}
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
                    <div className="flex justify-between font-mono text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(previewProposal.subtotal || (previewProposal.totalAmount || previewProposal.total || 0) * 0.85)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-muted-foreground">
                      <span>Tax (18% GST)</span>
                      <span>{formatCurrency(previewProposal.tax || (previewProposal.totalAmount || previewProposal.total || 0) * 0.15)}</span>
                    </div>
                    <div className="flex justify-between font-mono font-semibold text-sm text-foreground pt-2 border-t border-border">
                      <span>Total Project Investment</span>
                      <span>{formatCurrency(previewProposal.totalAmount || previewProposal.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Valid until {previewProposal.validUntil ? formatDate(previewProposal.validUntil) : '14 Days'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewProposal(null)}
                    className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Done
                  </button>
                  {previewProposal.status !== 'accepted' && (
                    <button
                      onClick={() => {
                        acceptMutation.mutate(previewProposal.id);
                        setPreviewProposal(null);
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-sm"
                    >
                      Accept & Convert to Project
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
