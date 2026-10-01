'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@freelanceros/ui';
import {
  ArrowLeft,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageCheck,
  FileCheck2,
  CheckSquare,
  Upload,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const { startTimer } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'deliverables' | 'time'>('overview');
  const [newTaskTitle, setNewTaskTitle] = useState('');
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

  const createTaskMutation = useMutation({
    mutationFn: (title: string) =>
      api.tasks.create({
        projectId: id,
        title,
        priority: 'medium',
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

  const handleStartTimer = async () => {
    if (!project) return;
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
  };

  if (isLoading || !project) {
    return (
      <AppShell>
        <div className="py-20 text-center text-xs text-muted-foreground">Loading project...</div>
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{project.name}</h1>
                <span className="text-xs font-mono text-muted-foreground">{project.code}</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(project.health)}`}>
                  {project.health === 'healthy' ? 'Healthy' : project.health === 'at_risk' ? 'At Risk' : 'Blocked'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Client: <Link href={`/clients/${project.clientId}`} className="underline text-foreground font-medium">{project.clientName}</Link>
                {project.healthReason && (
                  <span className="text-amber-600 dark:text-amber-400 ml-2 font-medium">
                    ({project.healthReason})
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartTimer}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Timer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profitability & Health Banner (Prompt Section 39 formulas) */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
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
        <div className="flex border-b border-border space-x-6 text-xs">
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
            </div>

            <div className="p-5 rounded-lg border border-border bg-card space-y-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Revision Policy
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
                {project.completedRevisions > project.includedRevisions && (
                  <div className="pt-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    ⚠️ Additional revision outside agreed scope
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
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
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md"
              >
                Add Task
              </button>
            </form>

            <div className="border border-border rounded-lg bg-card divide-y divide-border text-xs">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No tasks added yet.</div>
              ) : (
                tasks.map((task) => (
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
                placeholder="New deliverable name (e.g. Master Video Edit)..."
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
              {deliverables.map((deliv) => (
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
                      Uploaded Versions
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Time Tracking */}
        {activeTab === 'time' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <table className="w-full text-left text-xs">
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
                {timeEntries.map((entry) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
