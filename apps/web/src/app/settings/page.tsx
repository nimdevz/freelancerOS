'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Building,
  CreditCard,
  Sliders,
  DollarSign,
  Shield,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch organization
  const { data: org, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: () => api.organizations.getCurrent(),
  });

  const [name, setName] = useState(org?.name || 'Nimish Studio');
  const [currency, setCurrency] = useState<string>(org?.currency || 'INR');
  const [defaultHourlyRate, setDefaultHourlyRate] = useState(String(org?.hourlyRate || org?.defaultHourlyRate || 1500));
  const [taxId, setTaxId] = useState('27AAAAA0000A1Z5');
  const [paymentTerms, setPaymentTerms] = useState('14');
  const [bankInfo, setBankInfo] = useState(
    'HDFC Bank • Account: 50100492817291 • IFSC: HDFC0000123 • UPI: nimish@hdfcbank'
  );

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => api.organizations.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name,
      currency,
      hourlyRate: Number(defaultHourlyRate),
    });
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="pb-2 border-b border-border">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Workspace Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure business identification, tax numbers, currencies, and invoice defaults.
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-4 border-b border-border text-xs font-medium">
          <Link
            href="/settings"
            className="pb-2 border-b-2 border-neutral-900 dark:border-white text-foreground"
          >
            General & Invoicing
          </Link>
          <Link
            href="/settings/billing"
            className="pb-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent"
          >
            Subscription & Billing
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Workspace settings updated successfully.</span>
            </div>
          )}

          {/* Business Profile */}
          <div className="p-5 rounded-lg border border-border bg-card space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Business Identity</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Workspace / Studio Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  GSTIN / VAT / Tax ID Number
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Commercial Defaults */}
          <div className="p-5 rounded-lg border border-border bg-card space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Commercial & Financial Defaults</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Primary Currency *
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Default Target Hourly Rate
                </label>
                <input
                  type="number"
                  min="0"
                  value={defaultHourlyRate}
                  onChange={(e) => setDefaultHourlyRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Standard Payment Due Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="0">Due Immediately on Receipt</option>
                  <option value="7">Net 7 Days</option>
                  <option value="14">Net 14 Days</option>
                  <option value="30">Net 30 Days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Bank & Wire Remittance Details (Printed on Invoices)
              </label>
              <textarea
                rows={2}
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updateMutation.isPending ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
