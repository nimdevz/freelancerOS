'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@freelanceros/ui';
import { FolderKanban, Plus, Search, ChevronRight, ArrowUpRight } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export default function ProjectsPage() {
  const { openQuickCreate } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'review' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  const filteredProjects = projects
    .filter((p) => {
      if (filter === 'active') return p.status === 'active';
      if (filter === 'review') return p.status === 'review';
      if (filter === 'completed') return p.status === 'completed';
      return true;
    })
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Projects</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track deliverables, client reviews, revision limits, and profitability.
            </p>
          </div>
          <button
            onClick={() => openQuickCreate('project')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['all', 'active', 'review', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                  filter === tab
                    ? 'bg-neutral-900 text-white font-medium dark:bg-white dark:text-neutral-900'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
        </div>

        {/* Projects Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-2.5 px-4 font-medium">Project Name</th>
                <th className="py-2.5 px-4 font-medium">Client</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Health</th>
                <th className="py-2.5 px-4 font-medium">Deadline</th>
                <th className="py-2.5 px-4 font-medium">Revisions</th>
                <th className="py-2.5 px-4 font-medium">Hours</th>
                <th className="py-2.5 px-4 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      compact
                      icon={FolderKanban}
                      title={searchTerm || filter !== 'all' ? 'No projects matching filter' : 'No projects yet'}
                      description="Projects keep client deliverables organized, revisions bounded, and billable hours on track."
                      primaryAction={{
                        label: 'Create First Project',
                        onClick: () => openQuickCreate('project'),
                        icon: Plus,
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="table-row-hover transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      <Link href={`/projects/${p.id}`} className="hover:underline flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {p.code}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{p.clientName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(p.health)}`}>
                        {p.health === 'healthy' ? 'Healthy' : p.health === 'at_risk' ? 'At Risk' : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                      {formatDate(p.deadline)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {p.completedRevisions > p.includedRevisions ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          {p.completedRevisions}/{p.includedRevisions} (Exceeded)
                        </span>
                      ) : (
                        <span>
                          {p.completedRevisions}/{p.includedRevisions}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">{p.totalHoursTracked}h</td>
                    <td className="py-3 px-4 text-right font-medium font-mono text-foreground">
                      {formatCurrency(p.budget, p.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
