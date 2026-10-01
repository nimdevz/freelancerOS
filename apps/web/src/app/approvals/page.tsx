'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate } from '@freelanceros/ui';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Filter,
  Check,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDecideModalOpen, setIsDecideModalOpen] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [decideAction, setDecideAction] = useState<'approved' | 'changes_requested'>('approved');
  const [decideComments, setDecideComments] = useState('');
  const [deciderName, setDeciderName] = useState('Nimish (Client Representative)');

  // Request form state
  const [deliverableId, setDeliverableId] = useState('');

  // Fetch approvals
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: () => api.approvals.list(),
  });

  // Fetch deliverables
  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => api.deliverables.list(),
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  // Decide approval mutation
  const decideMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.approvals.decide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      setIsDecideModalOpen(false);
      setDecideComments('');
    },
  });

  // Request approval mutation
  const requestMutation = useMutation({
    mutationFn: (data: any) => api.approvals.request(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      setIsRequestModalOpen(false);
      setDeliverableId('');
    },
  });

  const handleDecideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApprovalId) return;
    decideMutation.mutate({
      id: selectedApprovalId,
      data: {
        status: decideAction,
        decidedBy: deciderName,
        comments: decideComments,
      },
    });
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableId) return;
    requestMutation.mutate({
      deliverableId,
    });
  };

  const filteredApprovals = approvals.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const changesCount = approvals.filter((a) => a.status === 'changes_requested').length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Client Approvals</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official client sign-offs, revision checkpoints, and deliverable approvals.
            </p>
          </div>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Sign-off</span>
          </button>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg bg-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Awaiting Client</span>
              <div className="text-2xl font-mono font-semibold text-amber-600 dark:text-amber-400 mt-0.5">{pendingCount}</div>
            </div>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>

          <div className="p-4 border border-border rounded-lg bg-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Approved & Signed</span>
              <div className="text-2xl font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{approvedCount}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="p-4 border border-border rounded-lg bg-card flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Changes Requested</span>
              <div className="text-2xl font-mono font-semibold text-neutral-600 dark:text-neutral-300 mt-0.5">{changesCount}</div>
            </div>
            <RotateCcw className="w-5 h-5 text-neutral-500" />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['all', 'pending', 'approved', 'changes_requested'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'all'
                ? 'All Approvals'
                : status === 'pending'
                  ? 'Pending Review'
                  : status === 'approved'
                    ? 'Approved'
                    : 'Changes Requested'}
            </button>
          ))}
        </div>

        {/* Approvals Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50 text-muted-foreground font-medium">
                  <th className="py-2.5 px-4">Deliverable</th>
                  <th className="py-2.5 px-4">Project</th>
                  <th className="py-2.5 px-4">Requested On</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Sign-off Details</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No approvals matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApprovals.map((approval) => {
                    const deliverable = deliverables.find((d) => d.id === approval.deliverableId);
                    const project = deliverable ? projects.find((p) => p.id === deliverable.projectId) : null;

                    return (
                      <tr key={approval.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {deliverable?.title || 'Deliverable Asset'}
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground font-normal">
                            V{deliverable?.currentVersion || 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {project?.name || 'Project'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          {formatDate(approval.requestedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                              approval.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : approval.status === 'changes_requested'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            {approval.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {approval.decidedBy ? (
                            <div>
                              <span className="font-medium text-foreground">{approval.decidedBy}</span>
                              {(approval.feedbackComments || (approval as any).comments) && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 italic">
                                  &ldquo;{approval.feedbackComments || (approval as any).comments}&rdquo;
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Pending client review</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {approval.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedApprovalId(approval.id);
                                  setDecideAction('approved');
                                  setIsDecideModalOpen(true);
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApprovalId(approval.id);
                                  setDecideAction('changes_requested');
                                  setIsDecideModalOpen(true);
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 transition-colors"
                              >
                                Request Changes
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {approval.decidedAt ? formatDate(approval.decidedAt) : 'Closed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request Approval Modal */}
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-4 sm:p-5 bg-card border border-border rounded-lg shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">Request Client Sign-off</h3>
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Select Deliverable Asset *
                  </label>
                  <select
                    value={deliverableId}
                    onChange={(e) => setDeliverableId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="">Select deliverable...</option>
                    {deliverables.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} (V{d.currentVersion || 1})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-900 border border-border text-[11px] text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Client Portal Magic Link</p>
                  <p>When requested, an approval link is sent to the client contact to review and sign off with zero login required.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
                  >
                    {requestMutation.isPending ? 'Sending...' : 'Send Approval Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Decide Approval Modal */}
        {isDecideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md p-4 sm:p-5 bg-card border border-border rounded-lg shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Record Decision: {decideAction === 'approved' ? 'Approve Deliverable' : 'Request Changes'}
                </h3>
                <button
                  onClick={() => setIsDecideModalOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDecideSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Signatory / Client Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={deciderName}
                    onChange={(e) => setDeciderName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    {decideAction === 'approved' ? 'Approval Note (Optional)' : 'Feedback / Required Changes *'}
                  </label>
                  <textarea
                    rows={3}
                    required={decideAction === 'changes_requested'}
                    placeholder={
                      decideAction === 'approved'
                        ? 'e.g. Looks fantastic, ready for publishing!'
                        : 'e.g. Please update the logo in the outro to the horizontal white variant.'
                    }
                    value={decideComments}
                    onChange={(e) => setDecideComments(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base sm:text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsDecideModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={decideMutation.isPending}
                    className={`px-3.5 py-1.5 text-xs font-medium text-white rounded-md transition-colors shadow-sm ${
                      decideAction === 'approved'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {decideMutation.isPending ? 'Saving...' : `Confirm ${decideAction === 'approved' ? 'Approval' : 'Changes'}`}
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
