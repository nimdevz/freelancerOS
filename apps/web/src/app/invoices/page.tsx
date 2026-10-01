'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@freelanceros/ui';
import { RecordPaymentModal } from '@/components/modals/RecordPaymentModal';
import { Invoice } from '@freelanceros/types';
import {
  CreditCard,
  Plus,
  Eye,
  Send,
  AlertCircle,
  CheckCircle2,
  Filter,
  DollarSign,
  Download,
  Building,
  Printer,
} from 'lucide-react';

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const { openQuickCreate } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  // Send invoice mutation
  const sendMutation = useMutation({
    mutationFn: (id: string) => api.invoices.send(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  // Metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.totalAmount || inv.total || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
  const totalOverdue = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'unpaid') return inv.status !== 'paid';
    return inv.status === filterStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Invoices</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track outstanding balances, payment collections, and automated reminder alerts.
            </p>
          </div>
          <button
            onClick={() => openQuickCreate('invoice')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="text-xl font-semibold text-foreground mt-1 font-mono">
              {formatCurrency(totalInvoiced)}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              {invoices.length} total issued
            </span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Collected
            </span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatCurrency(totalPaid)}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Received payments</span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Outstanding
            </span>
            <div className="text-xl font-semibold text-foreground mt-1 font-mono">
              {formatCurrency(totalOutstanding)}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Awaiting clearance</span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Overdue
            </span>
            <div className="text-xl font-semibold text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {formatCurrency(totalOverdue)}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Requires action</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2">
          {['all', 'unpaid', 'overdue', 'paid', 'draft'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'all'
                ? 'All Invoices'
                : status === 'unpaid'
                  ? 'Unpaid / Pending'
                  : status}
            </button>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Balance Due</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No invoices found. Generate an invoice to get paid on time.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const client = clients.find((c) => c.id === inv.clientId);
                    return (
                      <tr key={inv.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {inv.number}
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          {client ? client.name : 'Client'}
                          {client?.company && (
                            <span className="block text-[11px] text-muted-foreground font-normal">
                              {client.company}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          {inv.dueDate ? formatDate(inv.dueDate) : 'On Receipt'}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                          {formatCurrency(inv.totalAmount || inv.total || 0)}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {inv.balanceDue > 0 ? (
                            <span className={inv.status === 'overdue' ? 'text-amber-600 dark:text-amber-400' : ''}>
                              {formatCurrency(inv.balanceDue)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">Paid in Full</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : inv.status === 'overdue'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : inv.status === 'partially_paid'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            {inv.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewInvoice(inv)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-muted-foreground hover:text-foreground"
                              title="Preview PDF"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {inv.status === 'draft' && (
                              <button
                                onClick={() => sendMutation.mutate(inv.id)}
                                className="px-2 py-1 text-[11px] font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded hover:opacity-90"
                              >
                                Send
                              </button>
                            )}

                            {inv.balanceDue > 0 && (
                              <button
                                onClick={() => setPaymentInvoice(inv)}
                                className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                              >
                                Record Payment
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

        {/* Record Payment Dialog */}
        {paymentInvoice && (
          <RecordPaymentModal
            invoice={paymentInvoice}
            onClose={() => setPaymentInvoice(null)}
          />
        )}

        {/* Printable Editorial Invoice Preview */}
        {previewInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 bg-card border border-border rounded-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                  <span className="text-xs uppercase font-mono tracking-widest text-muted-foreground">
                    Tax Invoice Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => setPreviewInvoice(null)}
                    className="text-xs text-muted-foreground hover:text-foreground ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Invoice Top */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">INVOICE</h2>
                  <div className="font-mono text-xs text-muted-foreground mt-0.5">{previewInvoice.number}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold text-foreground">Nimish Studio</div>
                  <div className="text-muted-foreground">GSTIN: 27AAAAA0000A1Z5</div>
                  <div className="text-muted-foreground">nimish@example.com</div>
                </div>
              </div>

              {/* Dates & Client */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 border border-border text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block mb-1">Billed To</span>
                  <div className="font-semibold text-foreground">
                    {clients.find((c) => c.id === previewInvoice.clientId)?.name || 'Client'}
                  </div>
                  <div className="text-muted-foreground">
                    {clients.find((c) => c.id === previewInvoice.clientId)?.company || 'Direct Client'}
                  </div>
                </div>
                <div className="text-right space-y-1 font-mono">
                  <div>
                    <span className="text-muted-foreground">Issue Date: </span>
                    <span className="text-foreground">{formatDate(previewInvoice.issueDate || previewInvoice.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date: </span>
                    <span className="text-foreground">{formatDate(previewInvoice.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="space-y-2 border border-border rounded-lg p-4 bg-card">
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(previewInvoice.subtotal || (previewInvoice.totalAmount || previewInvoice.total || 0) * 0.85)}</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Tax (18% GST)</span>
                  <span>{formatCurrency(previewInvoice.taxAmount || previewInvoice.tax || (previewInvoice.totalAmount || previewInvoice.total || 0) * 0.15)}</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Amount Paid</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    -{formatCurrency(previewInvoice.amountPaid || 0)}
                  </span>
                </div>
                <div className="flex justify-between font-mono font-bold text-base text-foreground pt-3 border-t border-border">
                  <span>Balance Due</span>
                  <span>{formatCurrency(previewInvoice.balanceDue)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-3.5 rounded bg-neutral-50 dark:bg-neutral-900 border border-border text-xs space-y-1">
                <div className="font-semibold text-foreground">Bank & UPI Payment Instructions:</div>
                <div className="text-muted-foreground font-mono">
                  HDFC Bank • A/C: 50100492817291 • IFSC: HDFC0000123 • UPI: nimish@hdfcbank
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="px-4 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
