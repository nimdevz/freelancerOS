'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate } from '@freelanceros/ui';
import {
  PackageCheck,
  Plus,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  Upload,
} from 'lucide-react';

export default function DeliverablesPage() {
  const queryClient = useQueryClient();
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
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Deliverables</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Client review assets, version iterations (V1, V2, Final), and contractual revision counters.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deliverable</span>
          </button>
        </div>

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

        {/* Deliverables Grid / Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliverables.length === 0 ? (
            <div className="col-span-full p-8 text-center border border-border rounded-lg bg-card text-muted-foreground text-xs">
              No deliverables found. Create one to share assets and collect frame-accurate client feedback.
            </div>
          ) : (
            deliverables.map((d) => {
              const proj = projects.find((p) => p.id === d.projectId);
              const projRevisions = revisions.filter((r) => r.projectId === d.projectId);
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
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Link
                      href={`/projects/${d.projectId}`}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <span>Project View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

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

        {/* Create Deliverable Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-5 bg-card border border-border rounded-lg shadow-xl space-y-4">
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
                    Deliverable Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hero Brand Video 4K Render, Figma UI Prototype"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
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
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Deliverable'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Version Modal */}
        {isVersionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-5 bg-card border border-border rounded-lg shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">Upload Deliverable Version</h3>
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
                    Version Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={versionNumber}
                    onChange={(e) => setVersionNumber(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Asset / Cloudflare R2 URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://preview.freelanceros.app/asset-v2.mp4"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Version Changelog / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Corrected color grading in scene 3 as requested; updated typography."
                    value={versionNotes}
                    onChange={(e) => setVersionNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsVersionModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addVersionMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
                  >
                    {addVersionMutation.isPending ? 'Saving...' : 'Add Version'}
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
