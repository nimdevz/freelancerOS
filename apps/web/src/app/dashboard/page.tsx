'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, formatRelativeTime, getStatusBadgeClass } from '@freelanceros/ui';
import {
  AlertCircle,
  ArrowUpRight,
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  FolderKanban,
  FileText,
  Users,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function DashboardPage() {
  const { openQuickCreate } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.dashboard.getSummary(),
    refetchInterval: 15000,
  });

  const metrics = data?.metrics;
  const needsAttention = data?.needsAttention || [];
  const activeProjects = data?.activeProjects || [];
  const upcomingDates = data?.upcomingDates || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Top Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Good day, Nimish
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Here’s what needs your attention today across your freelance business.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openQuickCreate('invoice')}
              className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
            >
              + Invoice
            </button>
            <button
              onClick={() => openQuickCreate('project')}
              className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Actionable Financial Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Revenue This Month
            </span>
            <div className="text-lg font-semibold text-foreground font-mono mt-1">
              {formatCurrency(metrics?.monthlyRevenue || 0, metrics?.currency)}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
              Direct collected revenue
            </span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Outstanding Balance
            </span>
            <div className="text-lg font-semibold text-foreground font-mono mt-1">
              {formatCurrency(metrics?.outstandingRevenue || 0, metrics?.currency)}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Invoiced & awaiting payment
            </span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Overdue Amount
            </span>
            <div className={`text-lg font-semibold font-mono mt-1 ${metrics?.overdueRevenue ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
              {formatCurrency(metrics?.overdueRevenue || 0, metrics?.currency)}
            </div>
            <span className="text-[10px] text-rose-500 mt-1 block">
              {metrics?.overdueRevenue ? 'Action required immediately' : 'No overdue invoices'}
            </span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Tracked Hours This Month
            </span>
            <div className="text-lg font-semibold text-foreground font-mono mt-1">
              {metrics?.trackedHoursThisMonth || 0}h
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Active billable focus time
            </span>
          </div>
        </div>

        {/* 1. CRITICAL SECTION: NEEDS ATTENTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                Needs Attention
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono font-medium">
                {needsAttention.length}
              </span>
            </div>
          </div>

          {needsAttention.length === 0 ? (
            <div className="p-6 rounded-lg border border-border bg-card text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">You’re all caught up!</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                No overdue invoices, blocked deliverables, or pending client approvals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {needsAttention.map((item) => {
                const isCritical = item.severity === 'critical';
                const isWarning = item.severity === 'warning';

                return (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-3.5 rounded-lg border bg-card flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors ${
                      isCritical
                        ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                        : isWarning
                        ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isCritical ? (
                          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : isWarning ? (
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground leading-tight block">
                          {item.title}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1 sm:pt-0">
                      <Link
                        href={item.actionUrl}
                        className="px-2.5 py-1 text-[11px] font-medium text-foreground bg-background hover:bg-muted border border-border rounded transition-colors shrink-0 flex items-center gap-1 shadow-sm"
                      >
                        <span>{item.actionText}</span>
                        <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. ACTIVE PROJECTS TABLE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Active Projects</h2>
            <Link
              href="/projects"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <span>View all projects</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Project</th>
                  <th className="py-2.5 px-4 font-medium">Client</th>
                  <th className="py-2.5 px-4 font-medium">Health</th>
                  <th className="py-2.5 px-4 font-medium">Deadline</th>
                  <th className="py-2.5 px-4 font-medium">Progress</th>
                  <th className="py-2.5 px-4 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeProjects.map((project) => (
                  <tr key={project.id} className="table-row-hover transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      <Link href={`/projects/${project.id}`} className="hover:underline flex items-center gap-2">
                        <span>{project.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {project.code}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{project.clientName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(
                          project.health,
                        )}`}
                      >
                        {project.health === 'healthy'
                          ? 'Healthy'
                          : project.health === 'at_risk'
                          ? 'At Risk'
                          : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                      {formatDate(project.deadline)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-neutral-900 dark:bg-neutral-100 h-1.5 rounded-full"
                            style={{ width: `${project.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {project.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-foreground font-mono">
                      {formatCurrency(project.budget, project.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* 3. TWO-COLUMN: UPCOMING TIMELINE & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Timeline */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Upcoming</h2>
            <div className="p-4 rounded-lg border border-border bg-card space-y-3">
              {upcomingDates.length === 0 ? (
                <p className="text-xs text-muted-foreground">No upcoming dates scheduled.</p>
              ) : (
                upcomingDates.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="flex items-center justify-between text-xs py-1.5 hover:bg-muted/40 rounded px-1.5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground">{item.title}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatDate(item.date)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Recent Activity</h2>
            <div className="p-4 rounded-lg border border-border bg-card space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent activity recorded.</p>
              ) : (
                recentActivity.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start justify-between text-xs py-1 border-b border-border/40 last:border-none">
                    <div className="pr-4">
                      <p className="text-foreground leading-snug">{log.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(log.createdAt)}
                    </span>
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
