'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PRICING_PLANS } from '@freelanceros/config';
import { formatCurrency } from '@freelanceros/ui';
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Shield,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function BillingPage() {
  const [currentPlanId, setCurrentPlanId] = useState('pro');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlanId) return;
    setIsUpgrading(true);
    setTimeout(() => {
      setCurrentPlanId(planId);
      setIsUpgrading(false);
      setSuccessMsg(`Workspace subscription switched to ${planId.toUpperCase()} tier.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 600);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="pb-2 border-b border-border">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Subscription & Billing</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your FreelancerOS tier, card details, and commercial SaaS limits.
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-4 border-b border-border text-xs font-medium">
          <Link
            href="/settings"
            className="pb-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent"
          >
            General & Invoicing
          </Link>
          <Link
            href="/settings/billing"
            className="pb-2 border-b-2 border-neutral-900 dark:border-white text-foreground"
          >
            Subscription & Billing
          </Link>
        </div>

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Current Plan Overview */}
        <div className="p-5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Active Plan</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                PRO ACTIVE
              </span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              Nimish Studio • Unlimited Clients & Projects
            </div>
            <p className="text-xs text-muted-foreground">
              Billed monthly via Stripe. Next renewal on 1st November.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Redirecting to Stripe Customer Portal...')}
              className="px-3.5 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Stripe Customer Portal</span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Available Tiers</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING_PLANS.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-lg border flex flex-col justify-between transition-all space-y-4 ${
                    isCurrent
                      ? 'border-neutral-900 dark:border-white bg-card shadow-sm'
                      : 'border-border bg-card/50 hover:border-neutral-400 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{plan.name}</span>
                      {plan.popular && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                          POPULAR
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-mono font-bold text-foreground">
                      {plan.priceINR === 0 ? 'Free' : formatCurrency(plan.priceINR)}
                      {plan.priceINR > 0 && <span className="text-xs font-normal text-muted-foreground"> / month</span>}
                    </div>

                    <p className="text-xs text-muted-foreground min-h-[32px]">{plan.description}</p>

                    <div className="space-y-2 pt-3 border-t border-border text-xs">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-foreground/90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isCurrent || isUpgrading}
                      className={`w-full py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isCurrent
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground cursor-default'
                          : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white shadow-sm'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : isUpgrading ? 'Updating...' : `Switch to ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
