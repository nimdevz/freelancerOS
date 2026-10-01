'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@freelanceros/ui';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  invoice: any | null;
  onClose: () => void;
}

export function RecordPaymentModal({ invoice, onClose }: RecordPaymentModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number>(invoice?.balanceDue || 0);
  const [method, setMethod] = useState<string>('bank_transfer');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  if (!invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.payments.create({
        invoiceId: invoice.id,
        amount: Number(amount),
        paymentMethod: method,
        paymentDate: date,
        reference: reference || null,
        notes: notes || null,
        currency: invoice.currency || 'INR',
      });

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoice.id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error recording payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-card rounded-lg border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-foreground">Record Payment</h2>
            <span className="text-xs text-muted-foreground">
              {invoice.invoiceNumber} — {invoice.clientName || 'Client'}
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-muted/50 rounded-md border border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Outstanding Balance</span>
            <span className="font-semibold text-foreground font-mono">
              {formatCurrency(invoice.balanceDue, invoice.currency)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Payment Amount ({invoice.currency}) *
            </label>
            <input
              required
              type="number"
              step="any"
              max={invoice.balanceDue}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="upi">UPI / GPay / PhonePe</option>
                <option value="stripe">Stripe / Card</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Transaction Reference / UTR
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC-NEFT-984123"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Internal Notes</label>
            <input
              type="text"
              placeholder="e.g. Received via client direct transfer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
