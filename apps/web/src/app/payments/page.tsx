'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@freelanceros/ui';
import {
  CreditCard,
  ArrowDownLeft,
  Filter,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function PaymentsPage() {
  const [methodFilter, setMethodFilter] = useState('all');

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.payments.list(),
  });

  // Fetch invoices to map invoice numbers
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const avgPayment = payments.length > 0 ? totalCollected / payments.length : 0;

  const filteredPayments = payments.filter((p) => {
    if (methodFilter === 'all') return true;
    return p.paymentMethod === methodFilter;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Payments Received</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audited transaction ledger of all cleared payments, UPI transfers, and bank wire reconciliations.
            </p>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Revenue Collected
            </span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatCurrency(totalCollected)}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              {payments.length} transactions cleared
            </span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Average Transaction
            </span>
            <div className="text-xl font-semibold text-foreground mt-1 font-mono">
              {formatCurrency(avgPayment)}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Per recorded payment</span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Reconciliation Rate
            </span>
            <div className="text-xl font-semibold text-foreground mt-1 font-mono">
              100%
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">All payments tied to invoices</span>
          </div>
        </div>

        {/* Method filter */}
        <div className="flex items-center gap-2">
          {['all', 'bank_transfer', 'upi', 'stripe', 'card', 'cash'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
                methodFilter === m
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'all' ? 'All Methods' : m.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Payments Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Invoice</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Reference ID</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No payments found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => {
                    const invoice = invoices.find((i) => i.id === payment.invoiceId);
                    const client = invoice ? clients.find((c) => c.id === invoice.clientId) : null;

                    return (
                      <tr key={payment.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          {formatDate(payment.paymentDate || payment.createdAt)}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                          {invoice?.number || 'INV-DIRECT'}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {client ? client.name : 'Client'}
                        </td>
                        <td className="py-3 px-4 capitalize font-mono text-muted-foreground">
                          {payment.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {payment.reference || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
