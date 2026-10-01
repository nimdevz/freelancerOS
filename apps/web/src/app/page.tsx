'use client';

import React from 'react';
import Link from 'next/link';
import { PRICING_PLANS } from '@freelanceros/config';
import { formatCurrency } from '@freelanceros/ui';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  TrendingUp,
  Receipt,
  FolderKanban,
  FileCheck,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neutral-900 selection:text-white dark:selection:bg-neutral-100 dark:selection:text-black">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold font-mono">
              OS
            </div>
            <span className="text-sm font-semibold tracking-tight">FreelancerOS</span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-border">
              v1.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-foreground transition-colors">
              The Lifecycle
            </a>
            <a href="#profitability" className="hover:text-foreground transition-colors">
              Unit Economics
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
            >
              <span>Sign up</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-[11px] font-medium text-muted-foreground shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Built for video editors, designers, developers & boutique studios</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]">
            Your freelance business, <br />
            <span className="text-muted-foreground font-normal">in one calm place.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            Stop stitching together Notion, WhatsApp, Google Sheets, Trello, and scattered PDF invoices.
            FreelancerOS eliminates administrative friction and answers the only questions that matter:
            what needs attention, what is waiting on clients, and how much you are actually making.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors shadow-sm"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border border-border bg-card hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors text-foreground shadow-xs"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Sign in with Google</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Demo Workspace</span>
            </Link>
          </div>

          {/* Interactive UI Mockup Hero Card */}
          <div className="pt-10">
            <div className="p-2 sm:p-4 rounded-xl border border-border bg-card/60 shadow-2xl backdrop-blur-sm max-w-4xl mx-auto text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    app.freelanceros.io/dashboard — Nimish Studio
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  ● 3 Active Clients
                </span>
              </div>

              {/* Needs Attention Queue UI snippet */}
              <div className="p-4 rounded-lg bg-background border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-muted-foreground">
                    Needs Attention Queue (2 urgent items)
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">Sorted by urgency</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="font-medium text-foreground">
                        Invoice #INV-2026-003 overdue by 3 days (₹45,000)
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">— Nexus Media</span>
                    </div>
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                      Send Reminder
                    </span>
                  </div>

                  <div className="p-2.5 rounded-md border border-border bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="font-medium text-foreground">
                        Deliverable V2 awaiting client sign-off (Commercial Cut)
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">— Apex Innovations</span>
                    </div>
                    <span className="text-[11px] font-medium text-foreground">View Approval</span>
                  </div>
                </div>
              </div>

              {/* Mini KPI row */}
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg border border-border bg-background">
                  <span className="text-[10px] uppercase text-muted-foreground block">Net Profit</span>
                  <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹2,41,000
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-background">
                  <span className="text-[10px] uppercase text-muted-foreground block">Effective Hourly</span>
                  <span className="text-base font-semibold text-foreground">₹2,151 / hr</span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-background">
                  <span className="text-[10px] uppercase text-muted-foreground block">Outstanding</span>
                  <span className="text-base font-semibold text-foreground">₹45,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Lifecycle Section */}
      <section id="workflow" className="py-20 border-b border-border bg-neutral-50/40 dark:bg-neutral-950/40">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              End-to-End Operating System
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              The Complete Freelancer Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Every stage seamlessly connected in one single continuous database thread.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-foreground">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">1. Lead Pipeline</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                7-stage Kanban tracking probability, deal value, and next follow-up dates. 1-click project conversion.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-foreground">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">2. Scope & Contracts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Itemized quotes, commercial proposals, and Master Service Agreements with digital signatures.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-foreground">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">3. Revisions & Versions</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track V1, V2, and Final deliverables. Automatic alerts when client feedback exceeds agreed revision scope.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-foreground">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">4. Invoicing & Retainers</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clean GST tax invoices, partial payments reconciliation, and predictable monthly recurring retainer hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Unit Economics & Profitability Principle */}
      <section id="profitability" className="py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Core Financial Principle
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Know Exactly How Much You Are Making
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Never guess if a flat-fee project was profitable. Transparent unit economics calculated in real time.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  The Profitability Formula
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-border font-mono text-xs space-y-2">
                  <div className="text-foreground font-semibold">
                    1. Revenue – Direct Costs = Net Project Profit
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    2. Net Profit ÷ Logged Hours = Effective Hourly Rate
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When you charge ₹1,50,000 for a project, spend ₹20,000 on stock assets and music licenses,
                  and log 50 hours of work, your effective rate is exactly ₹2,600/hr. FreelancerOS tracks
                  this automatically across every single client job.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-border bg-background space-y-3 font-mono text-xs">
                <div className="flex justify-between text-muted-foreground border-b border-border pb-2">
                  <span>Brand Video Commercial</span>
                  <span>Metrics</span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Invoiced:</span>
                  <span className="font-semibold text-foreground">₹1,50,000</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Direct Contractor Costs:</span>
                  <span>-₹20,000</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-border">
                  <span>Net Studio Profit:</span>
                  <span>₹1,30,000</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Deep Work Logged:</span>
                  <span>50 hrs</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-sm pt-1 border-t border-border">
                  <span>Effective Hourly Rate:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹2,600 / hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-b border-border bg-neutral-50/40 dark:bg-neutral-950/40">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Fair, Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Simple Plans for Every Stage
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Start free today. Upgrade only when your client volume expands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-xl border bg-card flex flex-col justify-between space-y-6 ${
                  plan.popular ? 'border-neutral-900 dark:border-white shadow-md' : 'border-border'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-foreground">{plan.name}</span>
                    {plan.popular && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-mono font-bold text-foreground">
                    {plan.priceINR === 0 ? 'Free' : formatCurrency(plan.priceINR)}
                    {plan.priceINR > 0 && <span className="text-xs font-normal text-muted-foreground"> / month</span>}
                  </div>

                  <p className="text-xs text-muted-foreground min-h-[32px]">{plan.description}</p>

                  <div className="space-y-2.5 pt-4 border-t border-border text-xs">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-foreground/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Link
                    href="/dashboard"
                    className={`block w-full py-2 text-center text-xs font-medium rounded-md transition-colors ${
                      plan.popular
                        ? 'bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white shadow-sm'
                        : 'border border-border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground'
                    }`}
                  >
                    Start with {plan.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Questions & Answers
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-lg border border-border bg-card space-y-1.5">
              <h3 className="font-semibold text-foreground">Can I use FreelancerOS for flat-rate/fixed-fee projects?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes, absolutely. FreelancerOS is built specifically for freelancers who charge fixed fees. By tracking
                your time and expenses against fixed contracts, you discover your true Effective Hourly Rate.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-1.5">
              <h3 className="font-semibold text-foreground">How does revision scope protection work?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every project defines the agreed number of included revisions (e.g. 2). When clients request a third
                iteration, FreelancerOS flags it as outside scope, prompting you to bill extra rather than doing unpaid work.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-1.5">
              <h3 className="font-semibold text-foreground">Can my clients view deliverables without creating an account?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes! When you share a deliverable approval or invoice, the client receives a tokenized link to inspect,
                provide feedback, and sign off with zero login friction.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-1.5">
              <h3 className="font-semibold text-foreground">Is my data secure and exportable?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your data is scoped strictly to your workspace organization in PostgreSQL. All invoices and reports
                can be printed or exported anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-neutral-50/50 dark:bg-neutral-950/50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-bold font-mono">
              OS
            </div>
            <span className="font-semibold text-foreground">FreelancerOS</span>
            <span>— Your freelance business, in one place.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign up
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/onboarding" className="hover:text-foreground">
              Onboarding
            </Link>
            <Link href="/settings" className="hover:text-foreground">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
