'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, formatRelativeTime, getStatusBadgeClass } from '@freelanceros/ui';
import {
  ArrowLeft,
  Plus,
  Play,
  Square,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageCheck,
  FileCheck2,
  CheckSquare,
  Upload,
  Send,
  Receipt,
  FileText,
  Activity,
  History,
  ShieldAlert,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const { startTimer, stopTimer, isTimerRunning, timerProjectId, activeTimeEntryId, openQuickCreate } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'deliverables' | 'time' | 'invoices' | 'activity'>('overview');
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.projects.get(id),
    enabled: Boolean(id),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['projectTasks', id],
    queryFn: () => api.tasks.list(id),
    enabled: Boolean(id),
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ['projectDeliverables', id],
    queryFn: () => api.deliverables.list(id),
    enabled: Boolean(id),
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['projectTime', id],
    queryFn: () => api.time.list(id),
    enabled: Boolean(id),
  });

  const { data: allInvoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: () => api.activity.list(20),
  });

  // Filter invoices for this project
  const projectInvoices = allInvoices.filter((inv) => inv.projectId === id);

  const createTaskMutation = useMutation({
    mutationFn: (title: string) =>
      api.tasks.create({
        projectId: id,
        title,
        priority: newTaskPriority,
        status: 'todo',
      }),
    onSuccess: () => {
      setNewTaskTitle('');
      queryClient.invalidateQueries({ queryKey: ['projectTasks', id] });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, currentStatus }: { taskId: string; currentStatus: string }) =>
      api.tasks.update(taskId, {
        status: currentStatus === 'done' ? 'todo' : 'done',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', id] });
    },
  });

  const createDeliverableMutation = useMutation({
    mutationFn: (title: string) =>
      api.deliverables.create({
        projectId: id,
        title,
        includedRevisions: project?.includedRevisions || 2,
      }),
    onSuccess: () => {
      setNewDeliverableTitle('');
      queryClient.invalidateQueries({ queryKey: ['projectDeliverables', id] });
    },
  });

  const requestApprovalMutation = useMutation({
    mutationFn: (deliverableId: string) =>
      api.approvals.request({
        deliverableId,
        clientEmail: 'client@example.com',
      }),
    onSuccess: () => {
      alert('Approval request sent to client successfully.');
      queryClient.invalidateQueries({ queryKey: ['projectDeliverables', id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });

  const isTimerRunningOnThisProject = isTimerRunning && timerProjectId === id;

  const handleToggleTimer = async () => {
    if (!project) return;
    if (isTimerRunningOnThisProject) {
      try {
        if (activeTimeEntryId) {
          await api.time.stopTimer(activeTimeEntryId);
        }
        stopTimer();
        queryClient.invalidateQueries({ queryKey: ['projectTime', id] });
      } catch (err) {
        alert('Could not stop timer: ' + err);
      }
    } else {
      try {
        const entry = await api.time.startTimer({
          projectId: project.id,
          description: `Working on ${project.name}`,
        });
        if (entry) {
          startTimer({
            id: entry.id,
            projectId: project.id,
            projectName: project.name,
            description: entry.description || 'Active Session',
          });
        }
      } catch (err) {
        alert('Could not start timer: ' + err);
      }
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'todo') return t.status !== 'done';
    if (taskFilter === 'done') return t.status === 'done';
    return true;
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">Loading project details...</div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="py-16 text-center space-y-3">
          <p className="text-xs text-muted-foreground">Project not found or ID is unavailable.</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{project.name}</h1>
                <span className="text-xs font-mono text-muted-foreground">{project.code}</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(project.health)}`}>
                  {project.health === 'healthy' ? 'Healthy' : project.health === 'at_risk' ? 'At Risk' : 'Blocked'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Client:{' '}
                <Link href={`/clients/${project.clientId}`} className="underline text-foreground font-medium">
                  {project.clientName}
                </Link>
                {project.healthReason && (
                  <span className="text-amber-600 dark:text-amber-400 ml-2 font-medium">
                    — {project.healthReason}
                  </span>
                )}
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleToggleTimer}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-xs ${
                  isTimerRunningOnThisProject
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100'
                }`}
              >
                {isTimerRunningOnThisProject ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isTimerRunningOnThisProject ? 'Stop Timer' : 'Start Timer'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('tasks');
                }}
                className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
              >
                + Task
              </button>

              <button
                onClick={() => {
                  setActiveTab('deliverables');
                }}
                className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
              >
                + Deliverable
              </button>

              <button
                onClick={() => openQuickCreate('invoice')}
                className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
              >
                + Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Profitability & Health Ledger */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <div className="p-3.5 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Budget
            </span>
            <div className="text-base font-semibold text-foreground font-mono mt-0.5">
              {formatCurrency(project.budget, project.currency)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Paid Revenue
            </span>
            <div className="text-base font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {formatCurrency(project.totalPaid, project.currency)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Direct Expenses
            </span>
            <div className="text-base font-semibold text-foreground font-mono mt-0.5">
              {formatCurrency(project.totalExpenses, project.currency)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Net Profit
            </span>
            <div className="text-base font-semibold text-foreground font-mono mt-0.5">
              {formatCurrency(project.profit, project.currency)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Tracked Hours
            </span>
            <div className="text-base font-semibold text-foreground font-mono mt-0.5">
              {project.totalHoursTracked}h
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block">
              Effective Hourly Rate
            </span>
            <div className="text-base font-semibold text-foreground font-mono mt-0.5">
              {project.effectiveHourlyRate > 0 ? `₹${project.effectiveHourlyRate}/h` : '—'}
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-border gap-5 sm:space-x-6 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'overview'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview & Scope
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'tasks'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('deliverables')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'deliverables'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Deliverables & Revisions ({deliverables.length})
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'time'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Logged Time ({timeEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'invoices'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Invoices ({projectInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'activity'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Activity Feed
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-5 rounded-lg border border-border bg-card space-y-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Scope & Objectives
              </h3>
              <p className="text-xs text-foreground leading-relaxed">
                {project.description || 'No detailed scope description provided.'}
              </p>

              <div className="pt-4 border-t border-border grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Start Date</span>
                  <span className="font-medium text-foreground">{formatDate(project.startDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Agreed Deadline</span>
                  <span className="font-medium text-foreground">{formatDate(project.deadline)}</span>
                </div>
              </div>

              {project.healthReason && (
                <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
                  <div className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Project Health Notice:</span>
                  </div>
                  <p className="mt-1 text-muted-foreground text-[11px] pl-6">
                    {project.healthReason}
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 rounded-lg border border-border bg-card space-y-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Revision Policy & Constraints
              </h3>
              <div className="p-3 bg-muted/40 rounded-md border border-border space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Included Revisions:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {project.includedRevisions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Revisions Completed:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {project.completedRevisions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Revisions Remaining:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {Math.max(0, project.includedRevisions - project.completedRevisions)}
                  </span>
                </div>
                {project.completedRevisions >= project.includedRevisions && (
                  <div className="pt-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium border-t border-border mt-2">
                    ⚠️ Included revisions exhausted. Scope change or extra billing applies.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-muted/40 p-0.5 rounded-md border border-border text-[11px]">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    taskFilter === 'all' ? 'bg-background text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setTaskFilter('todo')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    taskFilter === 'todo' ? 'bg-background text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  To Do ({tasks.filter((t) => t.status !== 'done').length})
                </button>
                <button
                  onClick={() => setTaskFilter('done')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    taskFilter === 'done' ? 'bg-background text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Done ({tasks.filter((t) => t.status === 'done').length})
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newTaskTitle.trim()) createTaskMutation.mutate(newTaskTitle);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Add new task and press enter..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <select
                value={newTaskPriority}
                onChange={(e: any) => setNewTaskPriority(e.target.value)}
                className="px-2 py-1.5 text-xs bg-background border border-border rounded-md text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md"
              >
                Add Task
              </button>
            </form>

            <div className="border border-border rounded-lg bg-card divide-y divide-border text-xs">
              {filteredTasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No tasks matching this filter.</div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="p-3 flex items-center justify-between hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          toggleTaskMutation.mutate({
                            taskId: task.id,
                            currentStatus: task.status,
                          })
                        }
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          task.status === 'done'
                            ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900'
                            : 'border-border'
                        }`}
                      >
                        {task.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <span
                        className={`${
                          task.status === 'done'
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground font-medium'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                      {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                      <span className={`px-2 py-0.5 rounded text-[10px] capitalize border ${getStatusBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Deliverables */}
        {activeTab === 'deliverables' && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newDeliverableTitle.trim()) createDeliverableMutation.mutate(newDeliverableTitle);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="New deliverable name (e.g. Master Video Edit, Final Brand Guide)..."
                value={newDeliverableTitle}
                onChange={(e) => setNewDeliverableTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <button
                type="submit"
                disabled={createDeliverableMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md"
              >
                Create Deliverable
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliverables.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-muted-foreground border border-border rounded-lg bg-card">
                  No deliverables created yet for this project.
                </div>
              ) : (
                deliverables.map((deliv) => (
                  <div key={deliv.id} className="p-4 rounded-lg border border-border bg-card space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">{deliv.title}</h4>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Current: {deliv.currentVersion} ({deliv.versionsCount} versions uploaded)
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(deliv.status)}`}>
                        {deliv.status}
                      </span>
                    </div>

                    {/* Versions history list */}
                    <div className="pt-2 border-t border-border space-y-1.5 text-xs">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                        Uploaded Versions & History
                      </span>
                      {deliv.versions?.map((v) => (
                        <div key={v.id} className="p-2 rounded bg-muted/40 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-foreground">{v.versionNumber}</span>
                            <span className="text-muted-foreground text-[11px] truncate max-w-[150px]">
                              {v.fileName || 'Asset'}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatDate(v.uploadedAt)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Approval Action */}
                    <div className="pt-2 border-t border-border flex justify-end">
                      <button
                        onClick={() => requestApprovalMutation.mutate(deliv.id)}
                        disabled={requestApprovalMutation.isPending}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition-colors"
                      >
                        <Send className="w-3 h-3 text-muted-foreground" />
                        <span>Request Client Approval</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Time Tracking */}
        {activeTab === 'time' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Date</th>
                    <th className="py-2.5 px-4 font-medium">Description</th>
                    <th className="py-2.5 px-4 font-medium">Duration</th>
                    <th className="py-2.5 px-4 font-medium">Billable</th>
                    <th className="py-2.5 px-4 font-medium text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {timeEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No time logged yet on this project.
                      </td>
                    </tr>
                  ) : (
                    timeEntries.map((entry) => (
                      <tr key={entry.id} className="table-row-hover">
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {formatDate(entry.startTime)}
                        </td>
                        <td className="py-3 px-4 text-foreground">{entry.description}</td>
                        <td className="py-3 px-4 font-mono">
                          {Math.floor(entry.durationMinutes / 60)}h {entry.durationMinutes % 60}m
                        </td>
                        <td className="py-3 px-4">
                          {entry.billable ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium">
                          {formatCurrency(entry.revenueAmount, 'INR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openQuickCreate('invoice')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Invoice For Project</span>
              </button>
            </div>

            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Invoice #</th>
                      <th className="py-2.5 px-4 font-medium">Title</th>
                      <th className="py-2.5 px-4 font-medium">Status</th>
                      <th className="py-2.5 px-4 font-medium">Due Date</th>
                      <th className="py-2.5 px-4 font-medium text-right">Total</th>
                      <th className="py-2.5 px-4 font-medium text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projectInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No invoices issued for this project yet.
                        </td>
                      </tr>
                    ) : (
                      projectInvoices.map((inv) => (
                        <tr key={inv.id} className="table-row-hover">
                          <td className="py-3 px-4 font-mono font-medium text-foreground">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{inv.title}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(inv.status)}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-mono">
                            {formatDate(inv.dueDate)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium">
                            {formatCurrency(inv.totalAmount || inv.total || 0, inv.currency)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {inv.balanceDue > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {formatCurrency(inv.balanceDue, inv.currency)}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Activity Feed */}
        {activeTab === 'activity' && (
          <div className="p-6 rounded-lg border border-border bg-card space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Project Timeline & Milestone Log
            </h3>
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-6">No historical activity logs recorded.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="relative pl-6 text-xs">
                    <span className="absolute left-1 top-1 w-2 h-2 rounded-full bg-neutral-900 dark:bg-white -translate-x-1/2" />
                    <p className="font-medium text-foreground leading-snug">{log.description}</p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
