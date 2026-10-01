'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, getStatusBadgeClass } from '@freelanceros/ui';
import {
  PackageCheck,
  Plus,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Layers,
  Upload,
  Send,
  FileCheck2,
} from 'lucide-react';

export default function DeliverablesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'deliverables' | 'approvals'>('deliverables');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');

  // Version modal form states
  const [versionNumber, setVersionNumber] = useState(2);
  const [fileUrl, setFileUrl] = useState('');
  const [versionNotes, setVersionNotes] = useState('');

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  // Fetch deliverables
  const { data: deliverables = [], isLoading } = useQuery({
    queryKey: ['deliverables', selectedProjectId],
    queryFn: () => api.deliverables.list(selectedProjectId === 'all' ? undefined : selectedProjectId),
  });

  // Fetch approvals
  const { data: approvals = [] } = useQuery({
    queryKey: ['approvals'],
    queryFn: () => api.approvals.list(),
  });

  // Fetch revisions for project scope tracking
  const { data: revisions = [] } = useQuery({
    queryKey: ['revisions'],
    queryFn: () => api.revisions.list(),
  });

  // Create deliverable mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.deliverables.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
    },
  });

  // Add version mutation
  const addVersionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.deliverables.addVersion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
      setIsVersionModalOpen(false);
      setFileUrl('');
      setVersionNotes('');
    },
  });

  // Request approval mutation
  const requestApprovalMutation = useMutation({
    mutationFn: (deliverableId: string) =>
      api.approvals.request({
        deliverableId,
        clientEmail: 'client@example.com',
      }),
    onSuccess: () => {
      alert('Approval link dispatched to client.');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
    },
  });

  // Decide approval mutation
  const decideApprovalMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approved' | 'changes_requested' }) =>
      api.approvals.decide(id, {
        status: decision,
        notes: decision === 'approved' ? 'Client approved without reservations' : 'Client requested changes',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !title) return;
    createMutation.mutate({
      projectId,
      title,
      description,
      status: 'client_review',
    });
  };

  const handleAddVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliverableId) return;
    addVersionMutation.mutate({
      id: selectedDeliverableId,
      data: {
        versionNumber: Number(versionNumber),
        fileUrl: fileUrl || 'https://drive.google.com/file/d/sample-preview',
        notes: versionNotes,
      },
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Deliverables & Approvals</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Client review assets, version iterations (V1, V2, Final), and contractual revision counters.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deliverable</span>
          </button>
        </div>

        {/* Tab Switcher: Deliverables vs Approvals */}
        <div className="flex border-b border-border gap-5 sm:space-x-6 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('deliverables')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'deliverables'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Deliverables ({deliverables.length})
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'approvals'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Client Approvals & Sign-offs ({approvals.length})
          </button>
        </div>

        {activeTab === 'deliverables' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
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
                {deliverables.length} {deliverables.length === 1 ? 'deliverable' : 'deliverables'}
              </span>
            </div>

            {/* Deliverables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliverables.length === 0 ? (
                <div className="col-span-full p-8 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
                  No deliverables found. Create one to share assets and collect frame-accurate client feedback.
                </div>
              ) : (
                deliverables.map((d) => {
                  const proj = projects.find((p) => p.id === d.projectId);
                  const maxIncluded = proj?.includedRevisions ?? 2;
                  const currVersionNum = typeof d.currentVersion === 'number' ? d.currentVersion : parseInt(String(d.currentVersion || 1), 10) || 1;
                  const isOverScope = currVersionNum > maxIncluded + 1;

                  return (
                    <div
                      key={d.id}
                      className="p-4 border border-border rounded-lg bg-card flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-muted-foreground">
                            {proj?.name || 'Project'}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              d.status === 'approved' || d.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : d.status === 'revision'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : d.status === 'client_review'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            {d.status.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-foreground line-clamp-1">{d.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {d.description || 'Deliverable ready for client presentation and sign-off.'}
                        </p>
                      </div>

                      {/* Version Scope pill & alert */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Current Version</span>
                          <span className="font-mono font-medium text-foreground">V{currVersionNum}</span>
                        </div>

                        {isOverScope ? (
                          <div className="flex items-center gap-1.5 p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-[11px] border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span>Outside agreed scope ({maxIncluded} revisions agreed). Bill extra.</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Revision {Math.min(currVersionNum, maxIncluded)} of {maxIncluded} agreed</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
                        <button
                          onClick={() => requestApprovalMutation.mutate(d.id)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                          title="Request approval"
                        >
                          <Send className="w-3 h-3" />
                          <span>Request Sign-off</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDeliverableId(d.id);
                            setVersionNumber(currVersionNum + 1);
                            setIsVersionModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-border hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload V{currVersionNum + 1}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Contextual Client Approvals */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                      <th className="py-2.5 px-4">Deliverable</th>
                      <th className="py-2.5 px-4">Recipient</th>
                      <th className="py-2.5 px-4">Requested Date</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Client Feedback</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {approvals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No client approval requests dispatched yet.
                        </td>
                      </tr>
                    ) : (
                      approvals.map((app) => (
                        <tr key={app.id} className="table-row-hover transition-colors">
                          <td className="py-3 px-4 font-medium text-foreground">
                            {app.deliverableTitle || 'Project Deliverable'}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {(app as any).clientEmail || app.decidedBy || 'Direct Client'}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-mono">
                            {formatDate(app.requestedAt)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase font-mono ${
                                app.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                                  : app.status === 'changes_requested'
                                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                              }`}
                            >
                              {app.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">
                            {app.feedbackComments || (app as any).notes || 'Awaiting response'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {app.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() =>
                                    decideApprovalMutation.mutate({
                                      id: app.id,
                                      decision: 'approved',
                                    })
                                  }
                                  className="px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    decideApprovalMutation.mutate({
                                      id: app.id,
                                      decision: 'changes_requested',
                                    })
                                  }
                                  className="px-2 py-1 text-[11px] font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800"
                                >
                                  Changes
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-mono">Completed</span>
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

        {/* Create Deliverable Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-4 sm:p-5 bg-card border border-border rounded-lg shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">Add Deliverable</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Project *
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
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
                    Deliverable Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hero Brand Video 4K Render, Figma UI Prototype"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Description & Scope Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on what this deliverable contains..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 rounded-md"
                  >
                    Create Deliverable
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Version Modal */}
        {isVersionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-4 sm:p-5 bg-card border border-border rounded-lg shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">Upload Iteration (V{versionNumber})</h3>
                <button
                  onClick={() => setIsVersionModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddVersion} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    File URL or Asset Link *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/file/... or Figma URL"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Revision Notes (What changed?)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Addressed client feedback on color grade, audio mix, and typography..."
                    value={versionNotes}
                    onChange={(e) => setVersionNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsVersionModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addVersionMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 rounded-md"
                  >
                    Save Version
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
