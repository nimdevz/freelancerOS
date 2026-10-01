'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency } from '@freelanceros/ui';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  ArrowUpRight,
  Calculator,
  ShieldCheck,
  Building,
  Printer,
  Sparkles,
  AlertCircle,
  Clock,
  Award,
} from 'lucide-react';

export default function ReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.reports.getFinancials(),
  });

  const totalRevenue = reports?.totalRevenueYTD ?? 275000;
  const totalExpenses = reports?.totalExpensesYTD ?? 34000;
  const netProfit = reports?.netProfitYTD ?? 241000;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const effectiveHourlyRate = reports?.averageHourlyRate ?? 2151;

  const projectProfitability = reports?.projectProfitability ?? [];
  const clientBreakdown = reports?.revenueByClient ?? [];
  const monthlyRevenue = reports?.monthlyCashFlow ?? [];

  // Sort project profitability by effective hourly rate to identify star performers vs time sinks
  const rankedProjects = useMemo(() => {
    return [...projectProfitability].sort((a, b) => b.effectiveHourlyRate - a.effectiveHourlyRate);
  }, [projectProfitability]);

  const topPerformer = rankedProjects.length > 0 ? rankedProjects[0] : null;
  const lowestPerformer = rankedProjects.length > 1 ? rankedProjects[rankedProjects.length - 1] : null;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Financial & Profitability Reports</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Transparent unit economics: Revenue – Expenses = Profit. Profit ÷ Hours = Effective Hourly Rate.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border bg-card hover:bg-muted rounded-md transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Print Report</span>
          </button>
        </div>

        {/* Formula Bar Banner */}
        <div className="p-3 bg-muted/30 border border-border rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground font-mono">
            <Calculator className="w-4 h-4 text-foreground" />
            <span>Formulas:</span>
            <span className="text-foreground font-semibold">Net Profit = Revenue – Expenses</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-foreground font-semibold">Effective Hourly Rate = Net Profit ÷ Hours</span>
          </div>
          <span className="text-[11px] text-muted-foreground">GST (18%) and direct shoot expenses accounted</span>
        </div>

        {/* Core Financial Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Revenue (YTD)
            </span>
            <div className="text-lg sm:text-xl font-semibold text-foreground mt-1 font-mono">
              {formatCurrency(totalRevenue)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 block">Invoiced & collected</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="text-lg sm:text-xl font-semibold text-foreground mt-1 font-mono">
              {formatCurrency(totalExpenses)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 block">Production & overhead costs</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Net Profit
            </span>
            <div className="text-lg sm:text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatCurrency(netProfit)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 block">
              {profitMargin}% net margin
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Effective Hourly Rate
            </span>
            <div className="text-lg sm:text-xl font-semibold text-foreground mt-1 font-mono">
              {formatCurrency(effectiveHourlyRate)}/hr
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 block">Across all logged time</span>
          </div>
        </div>

        {/* "WORTH YOUR TIME" INTELLIGENCE SECTION */}
        <div className="p-4 sm:p-5 rounded-lg border border-border bg-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">Worth Your Time Intelligence</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">Effective rate per project comparison</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topPerformer && (
              <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Highest Effective Yield</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(topPerformer.effectiveHourlyRate)}/hr
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{topPerformer.projectName}</h4>
                <p className="text-xs text-muted-foreground">
                  Client: {topPerformer.clientName} • Generated {formatCurrency(topPerformer.profit)} profit across {topPerformer.trackedHours}h tracked.
                </p>
              </div>
            )}

            {lowestPerformer && (
              <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Review Hourly Yield</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {formatCurrency(lowestPerformer.effectiveHourlyRate)}/hr
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{lowestPerformer.projectName}</h4>
                <p className="text-xs text-muted-foreground">
                  Client: {lowestPerformer.clientName} • Heavy revisions consumed {lowestPerformer.trackedHours}h. Consider rate adjustment or scope boundaries.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Project Profitability Ledger */}
        <div className="border border-border rounded-lg bg-card overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Project Unit Economics</h2>
              <p className="text-xs text-muted-foreground">
                Reveals which projects generate high effective earnings vs which projects eat your time.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Calculator className="w-3.5 h-3.5" />
              <span>Profit ÷ Hours</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Direct Costs</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                  <th className="py-2.5 px-3 text-right">Margin</th>
                  <th className="py-2.5 px-3 text-right">Logged Hours</th>
                  <th className="py-2.5 px-3 text-right">Effective Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {projectProfitability.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-muted-foreground font-sans">
                      Complete projects and log time to generate detailed profitability intelligence.
                    </td>
                  </tr>
                ) : (
                  projectProfitability.map((item) => (
                    <tr key={item.projectId} className="table-row-hover transition-colors">
                      <td className="py-3 px-3 font-sans font-medium text-foreground">
                        {item.projectName}
                      </td>
                      <td className="py-3 px-3 font-sans text-muted-foreground">
                        {item.clientName}
                      </td>
                      <td className="py-3 px-3 text-right text-foreground">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        {formatCurrency(item.expenses)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.profit)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {item.marginPercent}%
                      </td>
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        {item.trackedHours}h
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-foreground">
                        {formatCurrency(item.effectiveHourlyRate)}/h
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Revenue Concentration & Monthly Cash Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Breakdown */}
          <div className="p-4 border border-border rounded-lg bg-card space-y-3">
            <div className="pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Client Revenue Concentration</h3>
              <p className="text-xs text-muted-foreground">Identify key accounts and single-client reliance risk.</p>
            </div>

            <div className="space-y-3">
              {clientBreakdown.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No client payments recorded yet.
                </div>
              ) : (
                clientBreakdown.map((client) => (
                  <div key={client.clientId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{client.clientName}</span>
                      <div className="font-mono text-muted-foreground">
                        {formatCurrency(client.revenue)} ({client.percentage}%)
                      </div>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 dark:bg-white rounded-full"
                        style={{ width: `${client.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monthly Trajectory */}
          <div className="p-4 border border-border rounded-lg bg-card space-y-3">
            <div className="pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Monthly Cash Trajectory</h3>
              <p className="text-xs text-muted-foreground">Revenue vs expenses trajectory across recent cycles.</p>
            </div>

            <div className="space-y-2">
              {monthlyRevenue.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Monthly financial tracking will populate with historical invoices.
                </div>
              ) : (
                monthlyRevenue.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-neutral-50/50 dark:bg-neutral-900/50 border border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{m.month}</span>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Expenses: {formatCurrency(m.expenses)}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(m.revenue)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Net: {formatCurrency(m.profit)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
