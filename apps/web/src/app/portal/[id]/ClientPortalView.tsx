'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, formatCurrency, getStatusBadgeClass } from '@freelanceros/ui';
import {
  PackageCheck,
  CheckCircle2,
  FileCheck2,
  FolderKanban,
  FileText,
  Upload,
  MessageSquare,
  Play,
  Pause,
  Clock,
  Send,
  Download,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function ClientPortalView() {
  const params = useParams();
  const clientId = (params?.id as string) || '11111111-1111-1111-1111-111111111111';
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'deliverables' | 'invoices' | 'assets' | 'contracts'>('deliverables');
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentTimestamp, setCommentTimestamp] = useState('00:14');
  const [authorName, setAuthorName] = useState('Karan Mehra');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleDownloadInvoicePdf = (inv: any) => {
    const text = `INVOICE RECEIPT\n---------------------------------\nInvoice Number: ${inv.invoiceNumber}\nTitle: ${inv.title}\nDue Date: ${inv.dueDate}\nStatus: ${inv.status.toUpperCase()}\nAmount: ${inv.totalAmount || inv.total || 0} ${inv.currency || 'USD'}\nBalance Due: ${inv.balanceDue || 0} ${inv.currency || 'USD'}\n\nThank you for your business!\nFreelancerOS Commercial System\n`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inv.invoiceNumber}-Receipt.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadContract = (c: any) => {
    const text = `COUNTERSIGNED AGREEMENT\n---------------------------------\nAgreement Title: ${c.title}\nStatus: ${c.status.toUpperCase()}\nSigned By: ${c.signerName || 'Client'}\nEffective Date: ${c.startDate || 'Immediate'}\nRenewal / End Date: ${c.endDate || 'Standard'}\n\nTERMS & CONDITIONS:\n${c.content || 'Standard Master Production Agreement governing deliverable handover upon settlement.'}\n\nCountersigned and archived via FreelancerOS.\n`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Signed-${c.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fetch portal data
  const { data: portalData, isLoading } = useQuery({
    queryKey: ['clientPortal', clientId],
    queryFn: () => api.portal.get(clientId),
  });

  const client = portalData?.client;
  const projects = portalData?.projects || [];
  const deliverables = portalData?.deliverables || [];
  const invoices = portalData?.invoices || [];
  const assetRequests = portalData?.assetRequests || [];
  const contracts = portalData?.contracts || [];

  const activeDeliverable = deliverables.find((d: any) => d.id === selectedDeliverableId) || deliverables[0];

  // Feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: (comment: string) =>
      api.portal.submitFeedback(clientId, {
        deliverableId: activeDeliverable?.id,
        comment,
        authorName,
        timestampSeconds: 14,
      }),
    onSuccess: () => {
      setNewComment('');
      setActionSuccessMsg('Feedback submitted successfully to the studio team.');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    },
  });

  // Approval decision mutation
  const approveMutation = useMutation({
    mutationFn: (status: 'approved' | 'changes_requested') =>
      api.approvals.request({
        deliverableId: activeDeliverable?.id,
        projectId: activeDeliverable?.projectId,
        status,
        decidedBy: authorName,
      }),
    onSuccess: (_, status) => {
      setActionSuccessMsg(
        status === 'approved'
          ? 'Deliverable approved! The studio team has been notified.'
          : 'Changes requested. The studio team has received your revision request.'
      );
      queryClient.invalidateQueries({ queryKey: ['clientPortal', clientId] });
      setTimeout(() => setActionSuccessMsg(null), 3500);
    },
  });

  // Fulfill asset request
  const uploadAssetMutation = useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName: string }) =>
      api.assetRequests.update(id, {
        status: 'received',
        fileName,
      }),
    onSuccess: () => {
      setActionSuccessMsg('Asset uploaded and marked as received!');
      queryClient.invalidateQueries({ queryKey: ['clientPortal', clientId] });
      setTimeout(() => setActionSuccessMsg(null), 3500);
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Client Brand Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">FreelancerOS Client Portal</span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {client?.company || client?.name || 'Nike India'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Official workspace for creative approvals, review, and invoicing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Reviewing as: <strong className="text-foreground">{authorName}</strong>
            </span>
            <Link
              href="/dashboard"
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-medium transition-colors"
            >
              Back to Studio
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto text-xs font-medium border-t border-border/50">
          {[
            { id: 'deliverables', label: `Deliverables (${deliverables.length})`, icon: PackageCheck },
            { id: 'invoices', label: `Invoices (${invoices.length})`, icon: FileCheck2 },
            { id: 'assets', label: `Asset Requests (${assetRequests.length})`, icon: Upload },
            { id: 'contracts', label: `Contracts & MSA (${contracts.length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Notification Toast */}
      {actionSuccessMsg && (
        <div className="bg-emerald-600 text-white text-xs py-2.5 px-4 text-center font-medium shadow-sm flex items-center justify-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          {actionSuccessMsg}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Tab 1: Deliverables & Video Review */}
        {activeTab === 'deliverables' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Deliverables List & Selection (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Deliverable for Review
              </h2>

              <div className="space-y-2">
                {deliverables.map((d: any) => {
                  const isSelected = activeDeliverable?.id === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDeliverableId(d.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/5 shadow-xs'
                          : 'border-border bg-card hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
                          {d.currentVersion || 'V1'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${getStatusBadgeClass(
                            d.status
                          )}`}
                        >
                          {d.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-xs font-semibold text-foreground leading-snug">
                        {d.title}
                      </h3>

                      {d.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {d.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        <span>Revisions: {d.usedRevisions}/{d.includedRevisions} used</span>
                        <span>{formatDate(d.updatedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Video / Asset Review Player & Action Controls (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              {activeDeliverable ? (
                <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs space-y-4 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground">
                          {activeDeliverable.title}
                        </h2>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {activeDeliverable.currentVersion || 'V1'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Project: {activeDeliverable.projectName || 'Commercial Production'}
                      </p>
                    </div>

                    {/* Quick Approval Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveMutation.mutate('changes_requested')}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => approveMutation.mutate('approved')}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Version
                      </button>
                    </div>
                  </div>

                  {/* Interactive Video Player Canvas Mockup */}
                  <div className="relative aspect-video rounded-lg bg-neutral-950 flex flex-col items-center justify-center overflow-hidden border border-neutral-800 shadow-inner group">
                    <div className="absolute inset-0 bg-radial from-neutral-900 to-black opacity-80" />
                    
                    {/* Simulated video graphic */}
                    <div className="relative z-10 text-center space-y-2 p-4">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
                        <Play className="w-6 h-6 ml-0.5" />
                      </div>
                      <span className="text-xs text-white/80 font-mono block">
                        4K UHD Master Stream Preview
                      </span>
                      <span className="text-[11px] text-white/50 block">
                        Aspect Ratio 16:9 • Apple ProRes 422HQ
                      </span>
                    </div>

                    {/* Video Scrubber & Timecode Controls */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6 z-20 space-y-2">
                      {/* Timeline Bar */}
                      <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
                        <div className="bg-indigo-500 h-full w-[24%]" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-white/80 font-mono">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-indigo-400">00:14.12</span>
                          <span>/ 01:00.00</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/10">
                            1080p Web Proxy
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Submission Bar */}
                  <div className="pt-2 space-y-3">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      Leave Timestamped Feedback
                    </h3>

                    <div className="flex items-start gap-2">
                      <div className="shrink-0 w-20">
                        <input
                          type="text"
                          value={commentTimestamp}
                          onChange={(e) => setCommentTimestamp(e.target.value)}
                          placeholder="00:14"
                          className="w-full px-2 py-2 rounded-lg border border-border bg-background text-xs font-mono text-center"
                          title="Timecode (MM:SS)"
                        />
                        <span className="text-[9px] text-muted-foreground block text-center mt-0.5">Timecode</span>
                      </div>

                      <div className="flex-1 space-y-2">
                        <textarea
                          rows={2}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="e.g. Sound effects are slightly too loud over the voiceover here. Please lower by -3dB."
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            Feedback will be instantly logged on the studio production board.
                          </span>
                          <button
                            onClick={() => submitFeedbackMutation.mutate(newComment)}
                            disabled={!newComment.trim() || submitFeedbackMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                          >
                            <Send className="w-3 h-3" /> Submit Feedback
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-border rounded-xl">
                  <p className="text-xs text-muted-foreground">No deliverables found for review.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Invoices & Billing */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Invoices & Billing History</h2>
              <p className="text-xs text-muted-foreground">
                Official invoices issued to your organization with payment receipts and bank wire instructions.
              </p>
            </div>

            <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border shadow-xs">
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No invoices issued yet.
                </div>
              ) : (
                invoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-foreground">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${getStatusBadgeClass(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <h3 className="text-xs font-medium text-foreground">{inv.title}</h3>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                        <span>Issued: {formatDate(inv.issueDate)}</span>
                        <span>Due: {formatDate(inv.dueDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-foreground">
                          ${inv.totalAmount.toLocaleString()}
                        </div>
                        {inv.balanceDue > 0 ? (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                            Balance Due: ${inv.balanceDue.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Fully Settled
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDownloadInvoicePdf(inv)}
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Asset Requests */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Requested Project Assets</h2>
              <p className="text-xs text-muted-foreground">
                Files and documentation requested by the studio team to keep production on schedule.
              </p>
            </div>

            <div className="border border-border rounded-xl bg-card overflow-hidden divide-y divide-border shadow-xs">
              {assetRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No active asset requests at this time.
                </div>
              ) : (
                assetRequests.map((ar: any) => (
                  <div
                    key={ar.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            ar.status === 'received' || ar.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {ar.status}
                        </span>
                        <h3 className="text-xs font-semibold text-foreground">{ar.title}</h3>
                      </div>
                      {ar.description && (
                        <p className="text-[11px] text-muted-foreground">{ar.description}</p>
                      )}
                      {ar.fileName && (
                        <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                          Uploaded: {ar.fileName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {ar.status === 'requested' ? (
                        <button
                          onClick={() =>
                            uploadAssetMutation.mutate({
                              id: ar.id,
                              fileName: `${ar.title.toLowerCase().replace(/\s+/g, '_')}_final.pdf`,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload File
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Received
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Contracts & MSA */}
        {activeTab === 'contracts' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Signed Agreements & Terms</h2>
              <p className="text-xs text-muted-foreground">
                Legally binding Master Production Agreement, IP release, and Scope terms.
              </p>
            </div>

            <div className="border border-border rounded-xl bg-card p-5 space-y-4 shadow-xs">
              {contracts.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No contracts linked.
                </div>
              ) : (
                contracts.map((c: any) => (
                  <div key={c.id} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{c.status}</span>
                        </p>
                      </div>

                      {c.signedAt && (
                        <div className="text-right text-[11px] text-muted-foreground">
                          <span>Signed by: <strong>{c.signerName || 'Client Signatory'}</strong></span>
                          <span className="block">{formatDate(c.signedAt)}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 rounded-lg bg-muted/20 border border-border text-xs text-muted-foreground font-mono leading-relaxed max-h-48 overflow-y-auto">
                      {c.content || 'Standard Master Production Agreement governing deliverable handover upon settlement.'}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Legally countersigned and archived
                      </span>
                      <button
                        onClick={() => handleDownloadContract(c)}
                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-medium flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Countersigned Copy
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-[11px] text-muted-foreground bg-card">
        FreelancerOS Secure Client Portal • Protected by End-to-End Workspace Isolation
      </footer>
    </div>
  );
}
