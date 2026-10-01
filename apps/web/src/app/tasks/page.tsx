'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, getStatusBadgeClass } from '@freelanceros/ui';
import { CheckSquare, Plus, CheckCircle2, LayoutGrid, List } from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'waiting', label: 'Waiting on Client' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
] as const;

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => api.tasks.list(selectedProjectId || undefined),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  const createTaskMutation = useMutation({
    mutationFn: ({ title, projectId }: { title: string; projectId: string }) =>
      api.tasks.create({
        title,
        projectId,
        priority: 'medium',
        status: 'todo',
      }),
    onSuccess: () => {
      setNewTaskTitle('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.tasks.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const targetProjId = selectedProjectId || (projects[0] ? projects[0].id : '');
    if (!targetProjId) {
      alert('Please select or create a project first');
      return;
    }
    createTaskMutation.mutate({ title: newTaskTitle, projectId: targetProjId });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Tasks</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              What do I need to do? What is waiting on client review?
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-md p-0.5 border border-border">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'kanban' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
                title="Board view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Add & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleCreate} className="flex-1 max-w-lg flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a new task and press Enter..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md"
            >
              Add
            </button>
          </form>

          <div className="w-full sm:w-auto">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none w-full"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kanban Board View */}
        {viewMode === 'kanban' && (
          <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            {STATUS_COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-card rounded-lg border border-border p-3 flex flex-col w-[260px] sm:w-[280px] md:w-auto shrink-0 md:shrink snap-center"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                    <span className="text-xs font-semibold text-foreground">{col.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-mono">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {colTasks.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-muted-foreground/60">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-2.5 rounded-md border border-border bg-background hover:border-foreground/40 transition-colors space-y-2 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-medium text-foreground leading-snug">
                              {task.title}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-medium border shrink-0 ${getStatusBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="truncate max-w-[120px] font-mono">
                              {task.projectName}
                            </span>
                            {task.dueDate && (
                              <span className="font-mono">{formatDate(task.dueDate)}</span>
                            )}
                          </div>

                          <div className="pt-1 border-t border-border/60">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                updateStatusMutation.mutate({ id: task.id, status: e.target.value })
                              }
                              className="text-[10px] bg-muted text-foreground border border-border/80 rounded px-1.5 py-0.5 w-full focus:outline-none"
                            >
                              {STATUS_COLUMNS.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Move to: {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Task</th>
                  <th className="py-2.5 px-4 font-medium">Project</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium">Priority</th>
                  <th className="py-2.5 px-4 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr key={task.id} className="table-row-hover">
                    <td className="py-3 px-4 font-medium text-foreground flex items-center gap-2.5">
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: task.id,
                            status: task.status === 'done' ? 'todo' : 'done',
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
                      <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                        {task.title}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{task.projectName}</td>
                    <td className="py-3 px-4">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({ id: task.id, status: e.target.value })
                        }
                        className="text-[11px] bg-transparent border-none text-foreground font-medium focus:outline-none"
                      >
                        {STATUS_COLUMNS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                      {formatDate(task.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
