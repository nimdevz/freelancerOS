'use client';

import React, { useState, useDeferredValue, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, getStatusBadgeClass } from '@freelanceros/ui';
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronRight,
  Layers,
  Lock,
  Sparkles,
  X,
  Link2,
  Search,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

const STATUS_COLUMNS = [
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'waiting', label: 'Waiting on Client' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
] as const;

const TASK_TEMPLATES = [
  {
    id: 'commercial-video',
    name: 'Commercial Video Sprint',
    description: '5-phase production workflow with chained dependencies & subtasks',
    tasks: [
      {
        title: 'Phase 1: Pre-Production Breakdown & Location Scout',
        priority: 'high',
        status: 'todo',
        subtasks: [
          { id: 'st-1', title: 'Script breakdown & visual shotlist', completed: false },
          { id: 'st-2', title: 'Location filming permits & tech scout', completed: false },
          { id: 'st-3', title: 'Crew & talent call sheet distribution', completed: false },
        ],
      },
      {
        title: 'Phase 2: Principal Photography Shoot Day',
        priority: 'urgent',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-4', title: 'Dual-card RAW backup on set (ShotPut Pro)', completed: false },
          { id: 'st-5', title: 'Multi-cam audio timecode sync verification', completed: false },
        ],
      },
      {
        title: 'Phase 3: Rough Cut Assembly & Audio Sync',
        priority: 'high',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-6', title: 'Proxy workflow setup in Premiere / DaVinci', completed: false },
          { id: 'st-7', title: 'Scene 1-4 pacing cut & sound design bed', completed: false },
        ],
      },
      {
        title: 'Phase 4: DaVinci Resolve Color Grade & Dolby Mix',
        priority: 'high',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-8', title: 'Color match ARRI LogC to client brand LUT', completed: false },
          { id: 'st-9', title: 'Master broadcast loudness (-14 LUFS / -24 LKFS)', completed: false },
        ],
      },
      {
        title: 'Phase 5: Client Review Sign-Off & 4K ProRes Export',
        priority: 'medium',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-10', title: 'Upload review version to Client Portal', completed: false },
          { id: 'st-11', title: 'Deliver master ProRes 422 HQ archive', completed: false },
        ],
      },
    ],
  },
  {
    id: 'web-mvp',
    name: 'Full-Stack Web MVP Sprint',
    description: 'Edge-native Cloudflare Workers + Next.js production launch sequence',
    tasks: [
      {
        title: 'Phase 1: Database Schema & Tenant Isolation',
        priority: 'high',
        status: 'todo',
        subtasks: [
          { id: 'st-w1', title: 'Design Drizzle ORM schema tables', completed: false },
          { id: 'st-w2', title: 'Apply Turso / libSQL migration scripts', completed: false },
        ],
      },
      {
        title: 'Phase 2: Cloudflare Workers & Hono API Routes',
        priority: 'high',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-w3', title: 'Implement JWT auth & organization guard', completed: false },
          { id: 'st-w4', title: 'R2 signed upload & download proxy routes', completed: false },
        ],
      },
      {
        title: 'Phase 3: Next.js Interactive Dashboard UI',
        priority: 'medium',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-w5', title: 'Dark mode design tokens & responsive shell', completed: false },
          { id: 'st-w6', title: 'TanStack Query optimistic data sync', completed: false },
        ],
      },
      {
        title: 'Phase 4: Cloudflare Pages Deployment & Smoke Test',
        priority: 'urgent',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-w7', title: 'Wrangler edge build & dry-run test', completed: false },
          { id: 'st-w8', title: 'Custom domain DNS routing & health checks', completed: false },
        ],
      },
    ],
  },
  {
    id: 'brand-system',
    name: 'Brand Identity & Visual System',
    description: 'End-to-end branding from creative discovery to asset kit export',
    tasks: [
      {
        title: 'Phase 1: Discovery Workshop & Visual Strategy',
        priority: 'high',
        status: 'todo',
        subtasks: [
          { id: 'st-b1', title: 'Stakeholder intake questionnaire synthesis', completed: false },
          { id: 'st-b2', title: 'Curate 2 distinct art direction moodboards', completed: false },
        ],
      },
      {
        title: 'Phase 2: Logo Concept Exploration & Monogram',
        priority: 'high',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-b3', title: 'Vector sketch 3 primary mark directions', completed: false },
          { id: 'st-b4', title: 'Horizontal, vertical & badge lockups', completed: false },
        ],
      },
      {
        title: 'Phase 3: Typography & Color Token System',
        priority: 'medium',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-b5', title: 'Primary display font & body pairing', completed: false },
          { id: 'st-b6', title: 'Color contrast WCAG AA audit', completed: false },
        ],
      },
      {
        title: 'Phase 4: Brand Guidelines PDF & Master Asset Kit',
        priority: 'high',
        status: 'todo',
        dependsOnPrevious: true,
        subtasks: [
          { id: 'st-b7', title: 'Export all SVG, PNG, EPS vector marks', completed: false },
          { id: 'st-b8', title: 'Compile 30-page brand guidelines PDF', completed: false },
        ],
      },
    ],
  },
];

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [expandedSubtaskIds, setExpandedSubtaskIds] = useState<Record<string, boolean>>({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(TASK_TEMPLATES[0].id);
  const [templateProjectId, setTemplateProjectId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => api.tasks.list(selectedProjectId || undefined),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  const filteredTasks = useMemo(() => {
    if (!deferredSearch) return tasks;
    const term = deferredSearch.toLowerCase();
    return tasks.filter((t) => t.title.toLowerCase().includes(term));
  }, [tasks, deferredSearch]);

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

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.tasks.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async ({ templateId, targetProjId }: { templateId: string; targetProjId: string }) => {
      const template = TASK_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;

      let lastCreatedTaskId: string | null = null;
      let lastCreatedTaskTitle: string | null = null;

      for (const t of template.tasks) {
        const payload: any = {
          projectId: targetProjId,
          title: t.title,
          priority: t.priority,
          status: t.status,
          subtasks: t.subtasks,
        };

        if (t.dependsOnPrevious && lastCreatedTaskId) {
          payload.dependsOnTaskId = lastCreatedTaskId;
          payload.dependsOnTaskTitle = lastCreatedTaskTitle;
        }

        const created = await api.tasks.create(payload);
        lastCreatedTaskId = created.id;
        lastCreatedTaskTitle = created.title;
      }
    },
    onSuccess: () => {
      setIsTemplateModalOpen(false);
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

  const toggleSubtasksView = (taskId: string) => {
    setExpandedSubtaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleToggleSubtask = (task: any, subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map((st: any) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTaskMutation.mutate({ id: task.id, data: { subtasks: updatedSubtasks } });
  };

  const handleAddSubtask = (task: any) => {
    const title = (newSubtaskInputs[task.id] || '').trim();
    if (!title) return;
    const newSubtask = { id: `st-${Date.now()}`, title, completed: false };
    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    updateTaskMutation.mutate({ id: task.id, data: { subtasks: updatedSubtasks } });
    setNewSubtaskInputs((prev) => ({ ...prev, [task.id]: '' }));
  };

  const renderDependencyBadge = (task: any) => {
    if (!task.dependsOnTaskId) return null;
    const depTask = tasks.find((t) => t.id === task.dependsOnTaskId);
    const isCompleted = depTask ? depTask.status === 'done' : false;
    const title = task.dependsOnTaskTitle || depTask?.title || 'Prior Task';

    return (
      <div
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border ${
          isCompleted
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
        }`}
        title={isCompleted ? `Dependency satisfied: ${title}` : `Blocked until completed: ${title}`}
      >
        <Lock className="w-2.5 h-2.5 shrink-0" />
        <span className="truncate max-w-[130px]">
          {isCompleted ? `Dep met: ${title}` : `Blocked by: ${title}`}
        </span>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Tasks & Execution</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Break projects into actionable steps, track subtasks, dependencies, and automated workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTemplateProjectId(selectedProjectId || (projects[0]?.id || ''));
                setIsTemplateModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Apply Task Template</span>
            </button>

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
              id="new-task-input"
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filter tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none w-full sm:w-auto"
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

        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={selectedProjectId ? 'No tasks in this project' : 'No tasks yet'}
            description="Break projects down into actionable steps. Track subtasks, dependency blockers, and workflow templates."
            primaryAction={{
              label: 'Add Task Above',
              onClick: () => {
                const el = document.getElementById('new-task-input');
                el?.focus();
              },
            }}
          />
        ) : (
          <>
            {/* Kanban Board View */}
            {viewMode === 'kanban' && (
              <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                {STATUS_COLUMNS.map((col) => {
                  const colTasks = filteredTasks.filter((t) => t.status === col.id);

                  return (
                    <div
                      key={col.id}
                      className="bg-card rounded-lg border border-border p-3 flex flex-col w-[280px] sm:w-[300px] md:w-auto shrink-0 md:shrink snap-center"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                        <span className="text-xs font-semibold text-foreground">{col.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-mono">
                          {colTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 flex-1">
                        {colTasks.length === 0 ? (
                          <div className="py-8 text-center text-[11px] text-muted-foreground/60">
                            No tasks
                          </div>
                        ) : (
                          colTasks.map((task) => {
                            const subtasks = task.subtasks || [];
                            const completedCount = subtasks.filter((s: any) => s.completed).length;
                            const isExpanded = expandedSubtaskIds[task.id];

                            return (
                              <div
                                key={task.id}
                                className="p-3 rounded-md border border-border bg-background hover:border-foreground/40 transition-colors space-y-2.5 shadow-xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs font-medium text-foreground leading-snug">
                                    {task.title}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-medium border shrink-0 ${getStatusBadgeClass(
                                      task.priority
                                    )}`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>

                                {/* Dependency Indicator */}
                                {renderDependencyBadge(task)}

                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                  <span className="truncate max-w-[120px] font-mono">
                                    {task.projectName}
                                  </span>
                                  {task.dueDate && (
                                    <span className="font-mono">{formatDate(task.dueDate)}</span>
                                  )}
                                </div>

                                {/* Subtasks Bar & Toggle */}
                                {subtasks.length > 0 && (
                                  <div className="pt-1.5 border-t border-border/60">
                                    <button
                                      onClick={() => toggleSubtasksView(task.id)}
                                      className="flex items-center justify-between w-full text-[10px] text-muted-foreground hover:text-foreground transition-colors py-0.5"
                                    >
                                      <span className="flex items-center gap-1">
                                        {isExpanded ? (
                                          <ChevronDown className="w-3 h-3" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3" />
                                        )}
                                        <span>Subtasks</span>
                                      </span>
                                      <span className="font-mono">
                                        {completedCount}/{subtasks.length}
                                      </span>
                                    </button>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-muted rounded-full h-1 mt-1 overflow-hidden">
                                      <div
                                        className="bg-emerald-500 h-1 transition-all"
                                        style={{
                                          width: `${(completedCount / subtasks.length) * 100}%`,
                                        }}
                                      />
                                    </div>

                                    {/* Expandable Subtask Checklist */}
                                    {isExpanded && (
                                      <div className="mt-2 space-y-1.5 pl-1 pt-1.5 border-t border-border/40">
                                        {subtasks.map((st: any) => (
                                          <label
                                            key={st.id}
                                            className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={st.completed}
                                              onChange={() => handleToggleSubtask(task, st.id)}
                                              className="rounded border-border text-foreground w-3 h-3"
                                            />
                                            <span className={st.completed ? 'line-through text-muted-foreground/60' : ''}>
                                              {st.title}
                                            </span>
                                          </label>
                                        ))}

                                        {/* Add subtask input */}
                                        <div className="flex items-center gap-1.5 pt-1">
                                          <input
                                            type="text"
                                            placeholder="+ Add subtask..."
                                            value={newSubtaskInputs[task.id] || ''}
                                            onChange={(e) =>
                                              setNewSubtaskInputs((prev) => ({
                                                ...prev,
                                                [task.id]: e.target.value,
                                              }))
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSubtask(task);
                                              }
                                            }}
                                            className="flex-1 px-1.5 py-0.5 text-[10px] bg-muted/60 border border-border rounded text-foreground focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="pt-1 border-t border-border/60">
                                  <select
                                    value={task.status}
                                    onChange={(e) =>
                                      updateTaskMutation.mutate({
                                        id: task.id,
                                        data: { status: e.target.value },
                                      })
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
                            );
                          })
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
                  <table className="w-full min-w-[620px] text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">Task</th>
                        <th className="py-2.5 px-4 font-medium">Project</th>
                        <th className="py-2.5 px-4 font-medium">Dependencies</th>
                        <th className="py-2.5 px-4 font-medium">Subtasks</th>
                        <th className="py-2.5 px-4 font-medium">Status</th>
                        <th className="py-2.5 px-4 font-medium">Priority</th>
                        <th className="py-2.5 px-4 font-medium">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredTasks.map((task) => {
                        const subtasks = task.subtasks || [];
                        const completedCount = subtasks.filter((s: any) => s.completed).length;
                        const isExpanded = expandedSubtaskIds[task.id];

                        return (
                          <React.Fragment key={task.id}>
                            <tr className="table-row-hover">
                              <td className="py-3 px-4 font-medium text-foreground flex items-center gap-2.5">
                                <button
                                  onClick={() =>
                                    updateTaskMutation.mutate({
                                      id: task.id,
                                      data: { status: task.status === 'done' ? 'todo' : 'done' },
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
                              <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">{task.projectName}</td>
                              <td className="py-3 px-4">
                                {task.dependsOnTaskId ? (
                                  renderDependencyBadge(task)
                                ) : (
                                  <span className="text-muted-foreground/50 text-[10px]">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {subtasks.length > 0 ? (
                                  <button
                                    onClick={() => toggleSubtasksView(task.id)}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-muted hover:bg-muted/80 border border-border"
                                  >
                                    <span>
                                      {completedCount}/{subtasks.length}
                                    </span>
                                    {isExpanded ? (
                                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => toggleSubtasksView(task.id)}
                                    className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                                  >
                                    + Add subtask
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={task.status}
                                  onChange={(e) =>
                                    updateTaskMutation.mutate({
                                      id: task.id,
                                      data: { status: e.target.value },
                                    })
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
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                                {formatDate(task.dueDate)}
                              </td>
                            </tr>

                            {/* Subtask checklist row in list view */}
                            {isExpanded && (
                              <tr className="bg-muted/20">
                                <td colSpan={7} className="px-8 py-3">
                                  <div className="space-y-2 max-w-md">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                      Subtasks for: {task.title}
                                    </div>
                                    <div className="space-y-1.5">
                                      {subtasks.map((st: any) => (
                                        <label
                                          key={st.id}
                                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={st.completed}
                                            onChange={() => handleToggleSubtask(task, st.id)}
                                            className="rounded border-border text-foreground"
                                          />
                                          <span className={st.completed ? 'line-through text-muted-foreground/60' : ''}>
                                            {st.title}
                                          </span>
                                        </label>
                                      ))}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                      <input
                                        type="text"
                                        placeholder="Add subtask and press Enter..."
                                        value={newSubtaskInputs[task.id] || ''}
                                        onChange={(e) =>
                                          setNewSubtaskInputs((prev) => ({
                                            ...prev,
                                            [task.id]: e.target.value,
                                          }))
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSubtask(task);
                                          }
                                        }}
                                        className="flex-1 px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAddSubtask(task)}
                                        className="px-2.5 py-1 text-xs font-medium bg-muted hover:bg-muted/80 rounded-md border border-border"
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Task Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-foreground">Apply Structured Task Template</h3>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1.5">
                  Select Target Project *
                </label>
                <select
                  value={templateProjectId}
                  onChange={(e) => setTemplateProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none"
                >
                  <option value="">Choose project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1.5">
                  Choose Template Preset
                </label>
                <div className="space-y-2">
                  {TASK_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTemplateId === tmpl.id
                          ? 'border-neutral-900 bg-muted/60 dark:border-white font-medium'
                          : 'border-border bg-background hover:border-foreground/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{tmpl.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                          {tmpl.tasks.length} Phases
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{tmpl.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Tasks Preview */}
              {selectedTemplateId && (
                <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-1.5 max-h-40 overflow-y-auto">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Phases & Chained Dependencies:
                  </div>
                  {TASK_TEMPLATES.find((t) => t.id === selectedTemplateId)?.tasks.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-foreground">
                      <span className="text-[10px] font-mono text-muted-foreground w-4">{idx + 1}.</span>
                      <span className="truncate flex-1">{t.title}</span>
                      {t.dependsOnPrevious && (
                        <span className="text-[9px] text-amber-500 font-mono flex items-center gap-0.5">
                          <Link2 className="w-2.5 h-2.5" /> Chained
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!templateProjectId || applyTemplateMutation.isPending}
                  onClick={() =>
                    applyTemplateMutation.mutate({
                      templateId: selectedTemplateId,
                      targetProjId: templateProjectId,
                    })
                  }
                  className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                >
                  {applyTemplateMutation.isPending ? 'Generating Tasks...' : 'Apply Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
