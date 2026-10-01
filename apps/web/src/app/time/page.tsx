'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDurationHours, formatDate } from '@freelanceros/ui';
import {
  Clock,
  Play,
  Square,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  FolderKanban,
} from 'lucide-react';

export default function TimePage() {
  const queryClient = useQueryClient();
  const {
    isTimerRunning,
    timerElapsedSeconds,
    timerProjectId,
    timerDescription,
    activeTimeEntryId,
    startTimer,
    stopTimer,
  } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Form state for manual entry or timer start
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('30');
  const [isBillable, setIsBillable] = useState(true);
  const [hourlyRate, setHourlyRate] = useState('1500');

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  // Fetch time entries
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['time', selectedProjectId],
    queryFn: () => api.time.list(selectedProjectId === 'all' ? undefined : selectedProjectId),
  });

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: (data: any) => api.time.startTimer(data),
    onSuccess: (entry) => {
      const proj = projects.find((p) => p.id === entry.projectId);
      startTimer({
        id: entry.id,
        projectId: entry.projectId,
        projectName: proj?.name || 'Project Session',
        description: entry.description || 'Active Session',
      });
      queryClient.invalidateQueries({ queryKey: ['time'] });
    },
  });

  // Stop timer mutation
  const stopTimerMutation = useMutation({
    mutationFn: (id: string) => api.time.stopTimer(id),
    onSuccess: () => {
      stopTimer();
      queryClient.invalidateQueries({ queryKey: ['time'] });
    },
  });

  // Create manual entry mutation
  const createEntryMutation = useMutation({
    mutationFn: (data: any) => api.time.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time'] });
      setIsManualModalOpen(false);
      setDescription('');
      setHours('1');
      setMinutes('0');
    },
  });

  const handleStartTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    startTimerMutation.mutate({
      projectId,
      description: description || 'Focused deep work',
      isBillable,
      hourlyRate: Number(hourlyRate) || 1500,
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    const durationSeconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;
    createEntryMutation.mutate({
      projectId,
      description: description || 'Development session',
      durationSeconds,
      isBillable,
      hourlyRate: Number(hourlyRate) || 1500,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    });
  };

  // Calculations
  const totalSeconds = timeEntries.reduce((acc, entry) => acc + (entry.durationSeconds || 0), 0);
  const billableSeconds = timeEntries
    .filter((e) => e.isBillable)
    .reduce((acc, entry) => acc + (entry.durationSeconds || 0), 0);
  const billableRatio = totalSeconds > 0 ? Math.round((billableSeconds / totalSeconds) * 100) : 0;
  const billableValue = timeEntries
    .filter((e) => e.isBillable)
    .reduce((acc, e) => {
      const hrs = (e.durationSeconds || 0) / 3600;
      return acc + hrs * (e.hourlyRate || 1500);
    }, 0);

  const formatTimerClock = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Time Tracking</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Accurately log hours, calculate effective hourly rate, and convert billable time to invoices.
            </p>
          </div>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Time Manually</span>
          </button>
        </div>

        {/* Live Stopwatch Tracker Widget */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <Clock className={`w-5 h-5 ${isTimerRunning ? 'text-amber-500 animate-spin-slow' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {isTimerRunning ? 'Timer Active' : 'Ready to Track'}
                </span>
                <div className="text-2xl font-mono font-semibold tracking-tight text-foreground mt-0.5">
                  {formatTimerClock(timerElapsedSeconds)}
                </div>
              </div>
            </div>

            {isTimerRunning ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-foreground">{timerDescription || 'Session'}</div>
                  <div className="text-[11px] text-muted-foreground">Recording live...</div>
                </div>
                <button
                  onClick={() => activeTimeEntryId && stopTimerMutation.mutate(activeTimeEntryId)}
                  disabled={stopTimerMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop & Save Session</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleStartTimer} className="flex flex-wrap items-center gap-2.5">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                  className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="What are you working on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground w-48 sm:w-64"
                />
                <button
                  type="submit"
                  disabled={!projectId || startTimerMutation.isPending}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Timer</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Time</span>
            <div className="text-xl font-semibold text-foreground mt-1 font-mono">
              {formatDurationHours(totalSeconds)}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Logged sessions</span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Billable Ratio</span>
            <div className="text-xl font-semibold text-foreground mt-1 font-mono">
              {billableRatio}%
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              {formatDurationHours(billableSeconds)} billable
            </span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Billable Value</span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatCurrency(billableValue)}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Estimated revenue</span>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Projects</span>
            <div className="text-xl font-semibold text-foreground mt-1 font-mono">
              {projects.filter((p) => p.status === 'active').length}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Receiving tracked hours</span>
          </div>
        </div>

        {/* Project Filter */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {timeEntries.length} {timeEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Time Entries Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Project</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4">Billable</th>
                  <th className="py-2.5 px-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {timeEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No time entries logged yet. Start the stopwatch above or log time manually.
                    </td>
                  </tr>
                ) : (
                  timeEntries.map((entry) => {
                    const proj = projects.find((p) => p.id === entry.projectId);
                    const hrs = (entry.durationSeconds || 0) / 3600;
                    const value = entry.isBillable ? hrs * (entry.hourlyRate || 1500) : 0;
                    return (
                      <tr key={entry.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          {formatDate(entry.startTime || entry.createdAt)}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {proj?.name || 'Project'}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {entry.description || 'No description provided'}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {formatDurationHours(entry.durationSeconds || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              entry.isBillable
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {entry.isBillable ? 'Billable' : 'Non-billable'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-foreground">
                          {entry.isBillable ? formatCurrency(value) : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Time Entry Modal */}
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-5 bg-card border border-border rounded-lg shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">Log Time Manually</h3>
                <button
                  onClick={() => setIsManualModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Project *
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="">Select Project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Work Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design review, client call, code refactoring"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Minutes
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={isBillable}
                        onChange={(e) => setIsBillable(e.target.checked)}
                        className="rounded border-border text-neutral-900 focus:ring-0"
                      />
                      <span>Is Billable Time</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createEntryMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
                  >
                    {createEntryMutation.isPending ? 'Logging...' : 'Save Time Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
