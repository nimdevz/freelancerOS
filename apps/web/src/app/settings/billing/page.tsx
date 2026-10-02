'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import { PRICING_PLANS, resolveUserTier, getTierLimits } from '@freelanceros/config';
import { formatCurrency } from '@freelanceros/ui';
import {
  CreditCard,
  CheckCircle2,
  Lock,
  X,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function BillingPage() {
  const [isTierLockedModalOpen, setIsTierLockedModalOpen] = useState(false);
  const [selectedPlanAttempt, setSelectedPlanAttempt] = useState<string | null>(null);

  // Fetch current user and organization
  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.getMe(),
  });

  const user = meData?.user;
  const org = meData?.organization;
  const userEmail = user?.email || '';

  const isLifetimeStudio =
    org?.plan === 'studio' || resolveUserTier(userEmail) === 'studio';
  const currentPlanId = isLifetimeStudio ? 'studio' : 'free';
  const tierLimits = getTierLimits(currentPlanId);

  const handlePlanClick = (planId: string) => {
    setSelectedPlanAttempt(planId);
    setIsTierLockedModalOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="pb-2 border-b border-border">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Subscription & Billing</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your FreelancerOS tier, client limits, and subscription access.
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

        {/* Current Plan Overview */}
        <div className="p-5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Active Plan</span>
              {isLifetimeStudio ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  LIFETIME STUDIO ACTIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-border">
                  FREE STARTER ACTIVE
                </span>
              )}
            </div>

            <div className="text-lg font-semibold text-foreground">
              {isLifetimeStudio ? (
                <span>{org?.name || 'Studio'} • Lifetime Studio Subscription</span>
              ) : (
                <span>{org?.name || 'Workspace'} • Free Starter Plan (3 Clients Limit)</span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {isLifetimeStudio ? (
                <span>
                  Studio tier active for <strong className="text-foreground">{userEmail}</strong>. Unlimited clients, unlimited projects, and team seats.
                </span>
              ) : (
                <span>
                  Free tier active for <strong className="text-foreground">{userEmail}</strong>. Includes up to 3 active clients and 3 active projects.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedPlanAttempt('stripe_portal');
                setIsTierLockedModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-foreground shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Details</span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Available Tiers</h2>
            <span className="text-xs text-muted-foreground font-mono">
              Current limits: {tierLimits.activeClients === Infinity ? 'Unlimited' : `${tierLimits.activeClients} clients`}
            </span>
          </div>

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
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-mono font-bold text-foreground">
                      {plan.priceUSD === 0 ? 'Free' : formatCurrency(plan.priceUSD, 'USD')}
                      {plan.priceUSD > 0 && <span className="text-xs font-normal text-muted-foreground"> / month</span>}
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
                      type="button"
                      onClick={() => handlePlanClick(plan.id)}
                      disabled={isCurrent}
                      className={`w-full py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isCurrent
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground cursor-default'
                          : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white shadow-xs'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TIER LOCK POPUP MODAL */}
      {isTierLockedModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTierLockedModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
        >
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-foreground">
                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-border">
                  <Lock className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Tier Changes Currently Disabled
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Online Checkout in Final Testing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTierLockedModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-2.5 leading-relaxed">
              <p>
                Self-service subscription upgrades and card checkout are currently locked while our Stripe billing infrastructure is undergoing final deployment.
              </p>
              <div className="space-y-1.5 pt-1 text-[11px] text-foreground">
                <div className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>New accounts:</strong> Assigned to the <strong>Starter Free tier</strong> (3 active clients, 3 projects).
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Payment processing:</strong> Stripe checkout and automated tier switching are currently undergoing maintenance.
                  </span>
                </div>
              </div>
              <p className="text-[11px] pt-1">
                You will receive an in-app prompt as soon as paid tier upgrading and Stripe customer billing are live.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsTierLockedModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
