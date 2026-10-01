'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate } from '@freelanceros/ui';
import { Contract } from '@freelanceros/types';
import {
  FileCheck,
  Plus,
  PenTool,
  Eye,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export default function ContractsPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('Nimish (Authorized Client Signatory)');
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);

  // Form state
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch clients & projects
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  // Fetch contracts
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => api.contracts.list(),
  });

  // Create contract mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.contracts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsCreateModalOpen(false);
      setTitle('');
      setContent('');
    },
  });

  // Sign contract mutation
  const signMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.contracts.sign(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsSignModalOpen(false);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title) return;

    createMutation.mutate({
      clientId,
      projectId: projectId || undefined,
      title,
      content:
        content ||
        'Standard Master Services Agreement covering intellectual property transfer upon receipt of final payment, revision policies (max 2 included), and cancellation terms.',
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 90 * 86400000).toISOString(),
    });
  };

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId || !signerName) return;
    signMutation.mutate({
      id: selectedContractId,
      name: signerName,
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Contracts & MSAs</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Legally binding Master Service Agreements, NDAs, and project scope sign-offs.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Agreement</span>
          </button>
        </div>

        {/* Contracts Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                  <th className="py-2.5 px-4">Agreement Title</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4">Project</th>
                  <th className="py-2.5 px-4">Term</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No contracts registered. Protect your work by generating an agreement before project kick-off.
                    </td>
                  </tr>
                ) : (
                  contracts.map((contract) => {
                    const client = clients.find((c) => c.id === contract.clientId);
                    const project = projects.find((p) => p.id === contract.projectId);
                    return (
                      <tr key={contract.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {contract.title}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {client?.name || 'Client'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {project?.name || 'All Projects'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              contract.status === 'signed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            {contract.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewContract(contract)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-muted-foreground hover:text-foreground"
                              title="View Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {contract.status !== 'signed' && (
                              <button
                                onClick={() => {
                                  setSelectedContractId(contract.id);
                                  setIsSignModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                              >
                                <PenTool className="w-3 h-3" />
                                <span>Sign</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Contract Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-card border border-border rounded-lg shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-semibold text-foreground">Create Agreement</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Client *
                    </label>
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      <option value="">Select Client...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Associated Project (Optional)
                    </label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      <option value="">General MSA / Retainer</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Agreement Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Services Agreement & Scope Addendum"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Contract Terms & Legal Clauses
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Standard terms regarding payment schedules, IP ownership upon clearance, confidentiality, and revision limits..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Effective Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      End / Renewal Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
                  >
                    {createMutation.isPending ? 'Drafting...' : 'Create Contract'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* E-Signature Modal */}
        {isSignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-5 bg-card border border-border rounded-lg shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">Digital Signature Execution</h3>
                <button
                  onClick={() => setIsSignModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSignSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Signatory Legal Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-900 border border-border text-[11px] text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic Signature Timestamp</span>
                  </div>
                  <p>
                    By signing, you confirm that you have the authority to bind the party to the terms of this agreement.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsSignModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={signMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm"
                  >
                    {signMutation.isPending ? 'Executing...' : 'Execute Digital Signature'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contract Preview Modal */}
        {previewContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 bg-card border border-border rounded-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                  <span className="text-xs uppercase font-mono tracking-widest text-muted-foreground">
                    Contract Agreement
                  </span>
                </div>
                <button
                  onClick={() => setPreviewContract(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground">{previewContract.title}</h2>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  Term: {formatDate(previewContract.startDate)} to {formatDate(previewContract.endDate)}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 border border-border text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {previewContract.content || 'Standard contract terms.'}
              </div>

              {previewContract.signedAt && (
                <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Legally Executed & Signed</span>
                    </div>
                    <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                      Signed by {previewContract.signerName || 'Client Signatory'} on{' '}
                      {formatDate(previewContract.signedAt)}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                    SIGNED
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => setPreviewContract(null)}
                  className="px-3.5 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
