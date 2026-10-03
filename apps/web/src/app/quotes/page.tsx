'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@freelanceros/ui';
import { Quote } from '@freelanceros/types';
import {
  Receipt,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  Trash2,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { ClientSelector } from '@/components/common/ClientSelector';
import {
  CustomDetailsSection,
  CustomFieldItem,
  formatCustomDetailsSummary,
} from '@/components/common/CustomDetailsSection';

export default function QuotesPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);

  // Form states
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<Array<{ description: string; quantity: number; unitPrice: number }>>([
    { description: 'Motion Graphics Animation (60s)', quantity: 1, unitPrice: 45000 },
    { description: 'Sound Design & Mastering', quantity: 1, unitPrice: 15000 },
  ]);

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  // Fetch quotes
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => api.quotes.list(),
  });

  // Create quote mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.quotes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setIsCreateModalOpen(false);
      setTitle('');
      setNotes('');
      setCustomFields([]);
    },
  });

  // Convert to project mutation
  const convertMutation = useMutation({
    mutationFn: (id: string) => api.quotes.convertToProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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

  const calculatedSubtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const calculatedTax = calculatedSubtotal * 0.18;
  const calculatedTotal = calculatedSubtotal + calculatedTax;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title) return;

    const compiledDetails = formatCustomDetailsSummary(customFields, notes);

    createMutation.mutate({
      clientId,
      title,
      notes: compiledDetails || undefined,
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Quotes & Estimates</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Detailed itemized estimates with 1-click project initialization upon acceptance.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quote</span>
          </button>
        </div>

        {/* Quotes Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                  <th className="py-2.5 px-4">Quote # / Title</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Valid Until</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No quotes generated yet. Create an estimate for pending client leads.
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => {
                    const client = clients.find((c) => c.id === quote.clientId);
                    return (
                      <tr key={quote.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {quote.title}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {client?.name || 'Client'}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {formatCurrency(quote.totalAmount || quote.total || 0)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          {quote.validUntil ? formatDate(quote.validUntil) : '14 Days'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              quote.status === 'accepted' || quote.status === 'converted'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : quote.status === 'sent'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            {quote.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewQuote(quote)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-muted-foreground hover:text-foreground"
                              title="Preview Quote"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {quote.status !== 'converted' && (
                              <button
                                onClick={() => convertMutation.mutate(quote.id)}
                                disabled={convertMutation.isPending}
                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                              >
                                <Briefcase className="w-3 h-3" />
                                <span>Convert to Project</span>
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete quote "${quote.title}"?`)) {
                                  deleteQuoteMutation.mutate(quote.id);
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Quote Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-card border border-border rounded-lg shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-semibold text-foreground">Generate Quote</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ClientSelector
                    value={clientId}
                    onChange={(id) => setClientId(id)}
                    label="Client"
                    required
                  />

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Quote Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Q3 Video Production Retainer Estimate"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                </div>

                <CustomDetailsSection
                  fields={customFields}
                  onChange={setCustomFields}
                  notes={notes}
                  onNotesChange={setNotes}
                  title="Payment Terms & Custom Notes"
                  buttonLabel="+ Add Custom Detail / Spec"
                  notesPlaceholder="e.g. 50% upfront deposit upon approval, 50% upon final delivery..."
                />

                {/* Line Items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Scope Line Items</label>
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
                          placeholder="Item description"
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
                          placeholder="Unit Price"
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
                      <span>Total Quote</span>
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
                    {createMutation.isPending ? 'Generating...' : 'Create Quote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quote Preview Modal */}
        {previewQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 bg-card border border-border rounded-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                  <span className="text-xs uppercase font-mono tracking-widest text-muted-foreground">
                    Estimate / Quote
                  </span>
                </div>
                <button
                  onClick={() => setPreviewQuote(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground">{previewQuote.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Issued by Nimish Studio • {formatDate(previewQuote.createdAt)}
                </p>
              </div>

              {previewQuote.notes && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded border border-border text-xs text-muted-foreground">
                  {previewQuote.notes}
                </div>
              )}

              <div className="p-4 bg-card border border-border rounded-lg space-y-2 text-xs">
                <div className="flex justify-between font-mono text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(previewQuote.subtotal || (previewQuote.totalAmount || previewQuote.total || 0) * 0.85)}</span>
                </div>
                <div className="flex justify-between font-mono text-muted-foreground">
                  <span>GST (18%)</span>
                  <span>{formatCurrency(previewQuote.taxAmount || previewQuote.tax || (previewQuote.totalAmount || previewQuote.total || 0) * 0.15)}</span>
                </div>
                <div className="flex justify-between font-mono font-semibold text-sm text-foreground pt-2 border-t border-border">
                  <span>Total Amount</span>
                  <span>{formatCurrency(previewQuote.totalAmount || previewQuote.total || 0)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => setPreviewQuote(null)}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Close
                </button>
                {previewQuote.status !== 'converted' && (
                  <button
                    onClick={() => {
                      convertMutation.mutate(previewQuote.id);
                      setPreviewQuote(null);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-sm"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Convert to Project</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
