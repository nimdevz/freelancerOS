'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Sparkles,
  RefreshCw,
  ArrowRight,
  Building,
} from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const openQuickCreate = useAppStore((s) => s.openQuickCreate);
  const [attentionFilter, setAttentionFilter] = useState<'all' | 'high' | 'invoices' | 'projects'>('all');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.getMe(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.dashboard.getSummary(),
  });

  const resetDemoMutation = useMutation({
    mutationFn: () => api.seed.resetDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const metrics = data?.metrics;
  const rawNeedsAttention = data?.needsAttention || [];
  const activeProjects = data?.activeProjects || [];
  const upcomingDates = data?.upcomingDates || [];
  const recentActivity = data?.recentActivity || [];

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = (user as any)?.user?.fullName?.split(' ')[0] || (user as any)?.fullName?.split(' ')[0] || 'Nimish';

  // Filtered attention items
  const filteredAttention = useMemo(() => {
    if (attentionFilter === 'all') return rawNeedsAttention;
    if (attentionFilter === 'high') {
      return rawNeedsAttention.filter((item) => item.urgency === 'high' || item.severity === 'critical');
    }
    if (attentionFilter === 'invoices') {
      return rawNeedsAttention.filter((item) => item.category === 'invoice' || item.title.toLowerCase().includes('invoice'));
    }
    if (attentionFilter === 'projects') {
      return rawNeedsAttention.filter((item) => item.category === 'project' || item.category === 'approval' || item.category === 'revision' || item.title.toLowerCase().includes('project'));
    }
    return rawNeedsAttention;
  }, [rawNeedsAttention, attentionFilter]);

  const isEmptyWorkspace = !isLoading && activeProjects.length === 0 && rawNeedsAttention.length === 0;

  return (
    <AppShell>
      <div className="space-y-7">
        {/* Top Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {greeting}, {firstName}
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

        {/* Actionable Financial Metrics Strip (Money Snapshot) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Revenue This Month
            </span>
            <div className="text-lg sm:text-xl font-semibold text-foreground font-mono mt-1">
              {formatCurrency(metrics?.monthlyRevenue || 0, metrics?.currency)}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
              Direct collected revenue
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Outstanding Balance
            </span>
            <div className="text-lg sm:text-xl font-semibold text-foreground font-mono mt-1">
              {formatCurrency(metrics?.outstandingRevenue || 0, metrics?.currency)}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Invoiced & awaiting payment
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Overdue Amount
            </span>
            <div className={`text-lg sm:text-xl font-semibold font-mono mt-1 ${metrics?.overdueRevenue ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
              {formatCurrency(metrics?.overdueRevenue || 0, metrics?.currency)}
            </div>
            <span className="text-[10px] text-rose-500 mt-1 block font-medium">
              {metrics?.overdueRevenue ? 'Action required immediately' : 'No overdue invoices'}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Projected Incoming
            </span>
            <div className="text-lg sm:text-xl font-semibold text-foreground font-mono mt-1">
              {formatCurrency(metrics?.projectedIncoming || 0, metrics?.currency)}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Unbilled active project milestones
            </span>
          </div>
        </div>

        {/* Empty State Banner if workspace is empty */}
        {isEmptyWorkspace && (
          <div className="p-8 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-foreground">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Your workspace is clean</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                Start tracking your freelance business by creating a client or exploring the pre-seeded demo workspace with real creative projects.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => openQuickCreate('client')}
                className="px-3.5 py-2 text-xs font-medium text-foreground bg-background hover:bg-muted border border-border rounded-md shadow-sm transition-colors"
              >
                + Add Client
              </button>
              <button
                onClick={() => openQuickCreate('project')}
                className="px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 rounded-md shadow-sm transition-colors"
              >
                + Create Project
              </button>
              <button
                onClick={() => resetDemoMutation.mutate()}
                disabled={resetDemoMutation.isPending}
                className="px-3.5 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-foreground border border-transparent hover:border-border rounded-md transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resetDemoMutation.isPending ? 'animate-spin' : ''}`} />
                <span>Explore Demo Workspace</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. CRITICAL SECTION: NEEDS ATTENTION */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                Needs Attention
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono font-medium">
                {rawNeedsAttention.length}
              </span>
            </div>

            {rawNeedsAttention.length > 0 && (
              <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md border border-border text-[11px]">
                <button
                  onClick={() => setAttentionFilter('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    attentionFilter === 'all'
                      ? 'bg-background text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({rawNeedsAttention.length})
                </button>
                <button
                  onClick={() => setAttentionFilter('high')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    attentionFilter === 'high'
                      ? 'bg-background text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Urgent
                </button>
                <button
                  onClick={() => setAttentionFilter('invoices')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    attentionFilter === 'invoices'
                      ? 'bg-background text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Invoices
                </button>
                <button
                  onClick={() => setAttentionFilter('projects')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    attentionFilter === 'projects'
                      ? 'bg-background text-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Work
                </button>
              </div>
            )}
          </div>

          {rawNeedsAttention.length === 0 ? (
            <div className="p-6 rounded-lg border border-border bg-card text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">You’re all caught up!</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                No overdue invoices, blocked deliverables, or pending client approvals.
              </p>
            </div>
          ) : filteredAttention.length === 0 ? (
            <div className="p-6 rounded-lg border border-border bg-card text-center">
              <p className="text-xs text-muted-foreground">No items in this category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAttention.map((item) => {
                const isHigh = item.urgency === 'high' || item.severity === 'critical';
                const isMedium = item.urgency === 'medium' || item.severity === 'warning';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-lg border bg-card flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors ${
                      isHigh
                        ? 'border-rose-300 dark:border-rose-900/70 bg-rose-50/20 dark:bg-rose-950/20'
                        : isMedium
                        ? 'border-amber-300 dark:border-amber-900/70 bg-amber-50/20 dark:bg-amber-950/20'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isHigh ? (
                          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : isMedium ? (
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground leading-tight">
                            {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold border ${
                              isHigh
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : isMedium
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {item.urgency || item.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          {item.description}
                        </p>
                        {item.amount && item.amount > 0 && (
                          <div className="text-[11px] font-mono font-medium text-foreground pt-0.5">
                            Amount: {formatCurrency(item.amount)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end pt-1 sm:pt-0">
                      <Link
                        href={item.actionUrl}
                        className="px-2.5 py-1 text-[11px] font-medium text-foreground bg-background hover:bg-muted border border-border rounded transition-colors shrink-0 flex items-center gap-1 shadow-xs"
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
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Active Projects</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono font-medium">
                {activeProjects.length}
              </span>
            </div>
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
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Project</th>
                    <th className="py-2.5 px-4 font-medium">Client</th>
                    <th className="py-2.5 px-4 font-medium">Health & Condition</th>
                    <th className="py-2.5 px-4 font-medium">Deadline</th>
                    <th className="py-2.5 px-4 font-medium">Progress</th>
                    <th className="py-2.5 px-4 font-medium text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeProjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No active projects currently underway.
                      </td>
                    </tr>
                  ) : (
                    activeProjects.map((project) => (
                      <tr key={project.id} className="table-row-hover transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">
                          <Link href={`/projects/${project.id}`} className="hover:underline flex items-center gap-2">
                            <span>{project.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {project.code}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <Link href={`/clients/${project.clientId}`} className="hover:underline">
                            {project.clientName}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
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
                            {project.healthReason && (
                              <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]" title={project.healthReason}>
                                {project.healthReason}
                              </p>
                            )}
                          </div>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. TWO-COLUMN: UPCOMING TIMELINE & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Timeline */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Upcoming Deadlines & Milestones</h2>
            <div className="p-4 rounded-lg border border-border bg-card space-y-2.5">
              {upcomingDates.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No upcoming dates scheduled.</p>
              ) : (
                upcomingDates.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="flex items-center justify-between text-xs py-1.5 hover:bg-muted/40 rounded px-2 transition-colors border border-transparent hover:border-border/60"
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Recent Activity</h2>
              <span className="text-[10px] text-muted-foreground">Live feed</span>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No recent activity recorded.</p>
              ) : (
                recentActivity.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start justify-between text-xs py-1.5 border-b border-border/40 last:border-none">
                    <div className="pr-4">
                      <p className="text-foreground leading-snug">{log.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
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
