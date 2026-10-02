'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency } from '@freelanceros/ui';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Target,
  Sparkles,
  ArrowRight,
  Save,
  Check,
} from 'lucide-react';

export default function CalculatorsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'rate' | 'runway' | 'goals'>('rate');

  // Rate calculator state
  const [desiredIncome, setDesiredIncome] = useState(8000);
  const [workingDays, setWorkingDays] = useState(20);
  const [hoursPerDay, setHoursPerDay] = useState(7);
  const [nonBillablePercent, setNonBillablePercent] = useState(35);
  const [monthlyExpenses, setMonthlyExpenses] = useState(1200);
  const [taxPercent, setTaxPercent] = useState(25);
  const [isRateSaved, setIsRateSaved] = useState(false);

  // Runway calculator state
  const [currentSavings, setCurrentSavings] = useState(35000);
  const [burnRate, setBurnRate] = useState(4500);
  const [recurringIncome, setRecurringIncome] = useState(2500);

  // Goal state
  const [revenueTarget, setRevenueTarget] = useState(15000);
  const [targetClients, setTargetClients] = useState(5);
  const [targetHours, setTargetHours] = useState(80);
  const [isGoalSaved, setIsGoalSaved] = useState(false);

  // Fetch current organization
  const { data: org } = useQuery({
    queryKey: ['currentOrg'],
    queryFn: () => api.organizations.getCurrent(),
  });

  // Fetch dashboard summary for live revenue comparison
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.dashboard.getSummary(),
  });

  // Calculate live rate metrics
  const rateMetrics = useMemo(() => {
    const totalWorkingHours = workingDays * hoursPerDay;
    const billableRatio = Math.max(0.05, 1 - nonBillablePercent / 100);
    const billableHoursPerMonth = Math.max(1, Math.round(totalWorkingHours * billableRatio));
    const grossIncomeNeeded = desiredIncome / Math.max(0.05, 1 - taxPercent / 100);
    const totalMonthlyCost = grossIncomeNeeded + monthlyExpenses;
    const requiredHourlyRate = Math.round(totalMonthlyCost / billableHoursPerMonth);
    const requiredDailyRate = Math.round(requiredHourlyRate * hoursPerDay);

    return {
      requiredHourlyRate,
      requiredDailyRate,
      requiredMonthlyRevenue: Math.round(totalMonthlyCost),
      billableHoursPerMonth,
      annualRevenue: Math.round(totalMonthlyCost * 12),
    };
  }, [desiredIncome, workingDays, hoursPerDay, nonBillablePercent, monthlyExpenses, taxPercent]);

  // Calculate live runway metrics
  const runwayMetrics = useMemo(() => {
    const netBurn = Math.max(0, burnRate - recurringIncome);
    const months = netBurn > 0 ? Number((currentSavings / netBurn).toFixed(1)) : 999;
    const status: 'healthy' | 'moderate' | 'critical' =
      months < 3 ? 'critical' : months < 6 ? 'moderate' : 'healthy';

    return {
      netBurn,
      months,
      status,
    };
  }, [currentSavings, burnRate, recurringIncome]);

  // Save rate to organization profile
  const saveRateMutation = useMutation({
    mutationFn: () =>
      api.organizations.update({
        hourlyRate: rateMetrics.requiredHourlyRate,
        defaultHourlyRate: rateMetrics.requiredHourlyRate,
      }),
    onSuccess: () => {
      setIsRateSaved(true);
      queryClient.invalidateQueries({ queryKey: ['currentOrg'] });
      setTimeout(() => setIsRateSaved(false), 2500);
    },
  });

  // Save business goal
  const saveGoalMutation = useMutation({
    mutationFn: () =>
      api.calculators.setGoal({
        period: '2026-Q4',
        monthlyRevenueTarget: revenueTarget,
        targetClients,
        targetHours,
      }),
    onSuccess: () => {
      setIsGoalSaved(true);
      setTimeout(() => setIsGoalSaved(false), 2500);
    },
  });

  const liveMonthlyRevenue = dashboardData?.metrics?.monthlyRevenue || 14750;
  const goalProgressPercent = Math.min(100, Math.round((liveMonthlyRevenue / revenueTarget) * 100));

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-500" />
              Business & Rate Calculators
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Financial modeling, hourly rate calibration, runway safety margins, and quarterly revenue targets.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center p-0.5 rounded-lg border border-border bg-muted/40 text-xs">
            <button
              onClick={() => setActiveTab('rate')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'rate'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Rate Calculator
            </button>
            <button
              onClick={() => setActiveTab('runway')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'runway'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Runway Estimator
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'goals'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Revenue Goals
            </button>
          </div>
        </div>

        {/* Tab 1: Rate Calculator */}
        {activeTab === 'rate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form (7 cols) */}
            <div className="lg:col-span-7 border border-border rounded-xl bg-card p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Target Income & Operating Parameters
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Desired Net Take-Home ($ / mo)
                  </label>
                  <input
                    type="number"
                    value={desiredIncome}
                    onChange={(e) => setDesiredIncome(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">What you want deposited into your pocket</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Monthly Studio Expenses ($ / mo)
                  </label>
                  <input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Software, gear amortization, insurance</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Tax Reserve Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Estimated self-employment & income tax</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Non-Billable Overhead (%)
                  </label>
                  <input
                    type="number"
                    value={nonBillablePercent}
                    onChange={(e) => setNonBillablePercent(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Admin, sales, client calls, proposals</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Working Days / Month
                  </label>
                  <input
                    type="number"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Default 20 days (4 weeks x 5 days)</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Working Hours / Day
                  </label>
                  <input
                    type="number"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Focus hours per work day</span>
                </div>
              </div>
            </div>

            {/* Results Card (5 cols) */}
            <div className="lg:col-span-5 border border-border rounded-xl bg-gradient-to-br from-card to-muted/30 p-5 space-y-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Recommended Pricing Structure
                </span>

                <div className="mt-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Minimum Target Hourly Rate</span>
                  <div className="text-3xl font-extrabold font-mono text-foreground">
                    ${rateMetrics.requiredHourlyRate} <span className="text-sm font-normal text-muted-foreground">/ hr</span>
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Day Rate: <span className="font-mono font-bold">${rateMetrics.requiredDailyRate}</span> (based on {hoursPerDay}h day)
                  </div>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Required Monthly Gross Invoicing:</span>
                    <span className="font-mono font-semibold text-foreground">
                      ${rateMetrics.requiredMonthlyRevenue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Billable Hours Target / Mo:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {rateMetrics.billableHoursPerMonth} hrs
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-muted-foreground">Projected Annual Revenue:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${rateMetrics.annualRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => saveRateMutation.mutate()}
                  disabled={saveRateMutation.isPending}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  {isRateSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Rate Applied to Studio Profile!
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Apply ${rateMetrics.requiredHourlyRate}/hr as Studio Default
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Runway Estimator */}
        {activeTab === 'runway' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 border border-border rounded-xl bg-card p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Reserves & Burn Rate Parameters
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Current Liquid Cash Reserves ($)
                  </label>
                  <input
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Bank balances immediately accessible without debt</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Total Monthly Expenses & Commitments ($ / mo)
                  </label>
                  <input
                    type="number"
                    value={burnRate}
                    onChange={(e) => setBurnRate(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Personal cost of living + studio fixed software/rent</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Guaranteed Recurring Monthly Retainers ($ / mo)
                  </label>
                  <input
                    type="number"
                    value={recurringIncome}
                    onChange={(e) => setRecurringIncome(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Predictable locked retainer contracts</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 border border-border rounded-xl bg-card p-5 space-y-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Runway Health Assessment
                </span>

                <div
                  className={`mt-3 p-4 rounded-xl border text-center space-y-1 ${
                    runwayMetrics.status === 'healthy'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : runwayMetrics.status === 'moderate'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <span className="text-xs opacity-80 font-medium">Estimated Financial Runway</span>
                  <div className="text-3xl font-extrabold font-mono text-foreground">
                    {runwayMetrics.months === 999 ? '∞ Zero Burn' : `${runwayMetrics.months} Months`}
                  </div>
                  <span className="text-xs font-semibold capitalize">
                    Status: {runwayMetrics.status} safety cushion
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Net Monthly Cash Burn:</span>
                    <span className="font-mono font-semibold text-foreground">
                      ${runwayMetrics.netBurn.toLocaleString()} / mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-muted-foreground">Benchmark Safety Target:</span>
                    <span className="font-mono font-semibold text-muted-foreground">
                      6.0 Months recommended
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border text-[11px] text-muted-foreground space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Financial Rule of Thumb:
                </span>
                <p>
                  Maintain at least 3-6 months of net operating expenses in liquid reserves so you never feel forced to accept underpriced client briefs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Revenue Goals */}
        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 border border-border rounded-xl bg-card p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                Quarterly Studio Targets (2026-Q4)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Monthly Revenue Target ($ / mo)
                  </label>
                  <input
                    type="number"
                    value={revenueTarget}
                    onChange={(e) => setRevenueTarget(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Active Clients Target
                    </label>
                    <input
                      type="number"
                      value={targetClients}
                      onChange={(e) => setTargetClients(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Billable Hours / Mo
                    </label>
                    <input
                      type="number"
                      value={targetHours}
                      onChange={(e) => setTargetHours(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => saveGoalMutation.mutate()}
                  disabled={saveGoalMutation.isPending}
                  className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {isGoalSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {isGoalSaved ? 'Goal Saved!' : 'Save Quarterly Target'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 border border-border rounded-xl bg-card p-5 space-y-5 shadow-xs">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Current Q4 Pacing
              </span>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Invoiced Revenue This Month:</span>
                  <span className="font-mono font-bold text-foreground">
                    ${liveMonthlyRevenue.toLocaleString()} / ${revenueTarget.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${goalProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{goalProgressPercent}% of monthly target reached</span>
                  <span>${Math.max(0, revenueTarget - liveMonthlyRevenue).toLocaleString()} remaining</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1 text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Studio Trajectory Insight
                </span>
                <p className="text-[11px] text-muted-foreground">
                  At your current billing rate, closing 1 additional mid-sized brand project or securing Northstar&apos;s extension will surpass your Q4 goal by 18%.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
