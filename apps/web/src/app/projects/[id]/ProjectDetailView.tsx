'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, formatRelativeTime, getStatusBadgeClass } from '@freelanceros/ui';
import type { ProjectFile, ProjectFileFolder } from '@freelanceros/types';
import {
  ArrowLeft,
  Plus,
  Play,
  Square,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageCheck,
  FileCheck2,
  CheckSquare,
  Upload,
  Send,
  Receipt,
  FileText,
  Activity,
  History,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Flag,
  Layers,
  Film,
  Camera,
  Check,
  Calendar,
  Copy,
  Archive,
  Folder,
  HardDrive,
  Download,
  Share2,
  Trash2,
  Eye,
  File,
  Music,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  Edit3,
  Save,
  Link2,
} from 'lucide-react';

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(fileName: string, mimeType?: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.mov') || lower.endsWith('.mp4') || lower.endsWith('.braw') || lower.endsWith('.mkv') || mimeType?.startsWith('video/')) {
    return <Film className="w-4 h-4 text-purple-500" />;
  }
  if (lower.endsWith('.wav') || lower.endsWith('.mp3') || lower.endsWith('.aac') || lower.endsWith('.flac') || mimeType?.startsWith('audio/')) {
    return <Music className="w-4 h-4 text-emerald-500" />;
  }
  if (lower.endsWith('.svg') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.psd') || mimeType?.startsWith('image/')) {
    return <ImageIcon className="w-4 h-4 text-blue-500" />;
  }
  if (lower.endsWith('.pdf')) {
    return <FileText className="w-4 h-4 text-rose-500" />;
  }
  if (lower.endsWith('.zip') || lower.endsWith('.tar') || lower.endsWith('.gz') || lower.endsWith('.rar')) {
    return <Archive className="w-4 h-4 text-amber-500" />;
  }
  return <File className="w-4 h-4 text-muted-foreground" />;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const startTimer = useAppStore((s) => s.startTimer);
  const stopTimer = useAppStore((s) => s.stopTimer);
  const isTimerRunning = useAppStore((s) => s.isTimerRunning);
  const timerProjectId = useAppStore((s) => s.timerProjectId);
  const activeTimeEntryId = useAppStore((s) => s.activeTimeEntryId);
  const openQuickCreate = useAppStore((s) => s.openQuickCreate);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'milestones' | 'scope' | 'creative' | 'deliverables' | 'assets' | 'time' | 'invoices' | 'activity' | 'closeout'
  >('overview');
  const [creativeSubTab, setCreativeSubTab] = useState<'callSheets' | 'shots' | 'equipment'>('callSheets');
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');

  // Assets Tab state
  const [selectedAssetSubTab, setSelectedAssetSubTab] = useState<'files' | 'requests'>('files');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetFile, setShareTargetFile] = useState<ProjectFile | null>(null);
  const [shareExpiryHours, setShareExpiryHours] = useState(24);
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');
  const [shareCopiedToast, setShareCopiedToast] = useState(false);

  const [newUploadName, setNewUploadName] = useState('');
  const [newUploadFolder, setNewUploadFolder] = useState<ProjectFileFolder>('Deliverables & Exports');
  const [newUploadSizeMb, setNewUploadSizeMb] = useState(45);

  const [isAssetRequestModalOpen, setIsAssetRequestModalOpen] = useState(false);
  const [newAssetReqTitle, setNewAssetReqTitle] = useState('');
  const [newAssetReqDesc, setNewAssetReqDesc] = useState('');
  const [newAssetReqDueDate, setNewAssetReqDueDate] = useState('2026-10-10');

  // Project notes state
  const [projectNotes, setProjectNotes] = useState<string | null>(null);
  const [notesSavedToast, setNotesSavedToast] = useState(false);

  // AI Summary state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSummaryData, setAiSummaryData] = useState<any>(null);

  // New item modal states
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDue, setNewMilestoneDue] = useState('2026-10-06');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState(1500);

  const [newChangeOrderTitle, setNewChangeOrderTitle] = useState('');
  const [newChangeOrderCost, setNewChangeOrderCost] = useState(850);
  const [newChangeOrderHours, setNewChangeOrderHours] = useState(6);
  const [newChangeOrderDetails, setNewChangeOrderDetails] = useState('');

  const [newShotNumber, setNewShotNumber] = useState('5A');
  const [newShotDesc, setNewShotDesc] = useState('');
  const [newShotFraming, setNewShotFraming] = useState('Medium Close-up');
  const [newShotLens, setNewShotLens] = useState('50mm');

  const [newEquipmentItem, setNewEquipmentItem] = useState('');
  const [newEquipmentCategory, setNewEquipmentCategory] = useState('Camera');
  const [newEquipmentQty, setNewEquipmentQty] = useState(1);

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

  const { data: allInvoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: () => api.activity.list(20),
  });

  // Milestones, Scope & Creative queries
  const { data: milestones = [] } = useQuery({
    queryKey: ['projectMilestones', id],
    queryFn: () => api.milestones.list(id),
    enabled: Boolean(id),
  });

  const { data: scopeResult } = useQuery({
    queryKey: ['projectScope', id],
    queryFn: () => api.scope.get(id),
    enabled: Boolean(id),
  });

  const { data: callSheets = [] } = useQuery({
    queryKey: ['projectCallSheets', id],
    queryFn: () => api.creative.callSheets.list(id),
    enabled: Boolean(id),
  });

  const { data: shots = [] } = useQuery({
    queryKey: ['projectShots', id],
    queryFn: () => api.creative.shots.list(id),
    enabled: Boolean(id),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['projectEquipment', id],
    queryFn: () => api.creative.equipment.list(id),
    enabled: Boolean(id),
  });

  const { data: projectFiles = [] } = useQuery({
    queryKey: ['projectFiles', id],
    queryFn: () => api.files.list(id),
    enabled: Boolean(id),
  });

  const { data: assetRequests = [] } = useQuery({
    queryKey: ['projectAssetRequests', id],
    queryFn: () => api.assetRequests.list(id),
    enabled: Boolean(id),
  });

  // Filter invoices for this project
  const projectInvoices = allInvoices.filter((inv) => inv.projectId === id);

  const createTaskMutation = useMutation({
    mutationFn: (title: string) =>
      api.tasks.create({
        projectId: id,
        title,
        priority: newTaskPriority,
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

  const requestApprovalMutation = useMutation({
    mutationFn: (deliverableId: string) =>
      api.approvals.request({
        deliverableId,
        clientEmail: 'client@example.com',
      }),
    onSuccess: () => {
      alert('Approval request sent to client successfully.');
      queryClient.invalidateQueries({ queryKey: ['projectDeliverables', id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });

  const summarizeAiMutation = useMutation({
    mutationFn: () => api.ai.summarizeProject(id),
    onSuccess: (data) => {
      setAiSummaryData(data);
      setIsAiModalOpen(true);
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: () =>
      api.milestones.create({
        projectId: id,
        name: newMilestoneName,
        dueDate: newMilestoneDue,
        paymentAmount: newMilestoneAmount,
        status: 'pending',
      }),
    onSuccess: () => {
      setNewMilestoneName('');
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
    },
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, currentStatus }: { milestoneId: string; currentStatus: string }) =>
      api.milestones.update(milestoneId, {
        status: currentStatus === 'completed' ? 'in_progress' : 'completed',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
    },
  });

  const createChangeOrderMutation = useMutation({
    mutationFn: () =>
      api.scope.requestChange({
        projectId: id,
        title: newChangeOrderTitle,
        additionalCost: newChangeOrderCost,
        estimatedHours: newChangeOrderHours,
        requestDetails: newChangeOrderDetails || 'Additional client scope request.',
        requestedBy: project?.clientName || 'Client',
        status: 'quoted',
      }),
    onSuccess: () => {
      setNewChangeOrderTitle('');
      setNewChangeOrderDetails('');
      queryClient.invalidateQueries({ queryKey: ['projectScope', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const approveChangeOrderMutation = useMutation({
    mutationFn: (changeId: string) =>
      api.scope.updateChange(changeId, {
        status: 'approved',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectScope', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const toggleShotMutation = useMutation({
    mutationFn: ({ shotId, currentStatus }: { shotId: string; currentStatus: string }) =>
      api.creative.shots.update(shotId, {
        status: currentStatus === 'shot' ? 'planned' : 'shot',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectShots', id] });
    },
  });

  const createShotMutation = useMutation({
    mutationFn: () =>
      api.creative.shots.create({
        projectId: id,
        shotNumber: newShotNumber,
        description: newShotDesc,
        framing: newShotFraming,
        lens: newShotLens,
        status: 'planned',
      }),
    onSuccess: () => {
      setNewShotDesc('');
      queryClient.invalidateQueries({ queryKey: ['projectShots', id] });
    },
  });

  const toggleEquipmentMutation = useMutation({
    mutationFn: ({ eqId, currentStatus }: { eqId: string; currentStatus: string }) =>
      api.creative.equipment.update(eqId, {
        status: currentStatus === 'packed' ? 'needed' : 'packed',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectEquipment', id] });
    },
  });

  const createEquipmentMutation = useMutation({
    mutationFn: () =>
      api.creative.equipment.create({
        projectId: id,
        item: newEquipmentItem,
        category: newEquipmentCategory,
        quantity: newEquipmentQty,
        status: 'needed',
      }),
    onSuccess: () => {
      setNewEquipmentItem('');
      queryClient.invalidateQueries({ queryKey: ['projectEquipment', id] });
    },
  });

  const updateProjectStatusMutation = useMutation({
    mutationFn: (status: 'active' | 'completed' | 'archived') =>
      api.projects.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const duplicateProjectMutation = useMutation({
    mutationFn: () =>
      api.projects.create({
        name: `${project?.name} (Copy)`,
        clientId: project?.clientId,
        budget: project?.budget || 0,
        deadline: project?.deadline,
        includedRevisions: project?.includedRevisions || 2,
        currency: project?.currency || 'INR',
      }),
    onSuccess: (newProj: any) => {
      alert(`Project duplicated successfully: ${newProj.name}`);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (fileData: Partial<ProjectFile>) =>
      api.files.upload({
        ...fileData,
        projectId: id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectFiles', id] });
      setIsUploadModalOpen(false);
      setNewUploadName('');
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => api.files.delete(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectFiles', id] });
    },
  });

  const createAssetRequestMutation = useMutation({
    mutationFn: (data: any) =>
      api.assetRequests.create({
        projectId: id,
        clientId: project?.clientId,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAssetRequests', id] });
      setIsAssetRequestModalOpen(false);
      setNewAssetReqTitle('');
      setNewAssetReqDesc('');
    },
  });

  const updateAssetRequestMutation = useMutation({
    mutationFn: ({ reqId, data }: { reqId: string; data: any }) =>
      api.assetRequests.update(reqId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAssetRequests', id] });
    },
  });

  const deleteAssetRequestMutation = useMutation({
    mutationFn: (reqId: string) => api.assetRequests.delete(reqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAssetRequests', id] });
    },
  });

  const saveNotesMutation = useMutation({
    mutationFn: (notesText: string) => api.projects.update(id, { notes: notesText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setNotesSavedToast(true);
      setTimeout(() => setNotesSavedToast(false), 2500);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push('/projects');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => api.tasks.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks', id] });
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => api.milestones.delete(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
    },
  });

  const deleteDeliverableMutation = useMutation({
    mutationFn: (delivId: string) => api.deliverables.delete(delivId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDeliverables', id] });
    },
  });

  const deleteTimeMutation = useMutation({
    mutationFn: (timeId: string) => api.time.delete(timeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTime', id] });
    },
  });

  const deleteShotMutation = useMutation({
    mutationFn: (shotId: string) => api.creative.shots.delete(shotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectShots', id] });
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: (eqId: string) => api.creative.equipment.delete(eqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectEquipment', id] });
    },
  });

  const handleOpenShareModal = async (file: ProjectFile) => {
    setShareTargetFile(file);
    try {
      const res = await api.files.generateShareLink(file.id, shareExpiryHours);
      setGeneratedShareUrl(res.shareUrl);
      setIsShareModalOpen(true);
    } catch {
      const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/files/download/${encodeURIComponent(file.r2Key)}?token=r2-${Date.now()}&exp=${Math.floor(Date.now() / 1000) + shareExpiryHours * 3600}`;
      setGeneratedShareUrl(shareUrl);
      setIsShareModalOpen(true);
    }
  };

  const handleCopyShareUrl = () => {
    if (generatedShareUrl && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generatedShareUrl);
      setShareCopiedToast(true);
      setTimeout(() => setShareCopiedToast(false), 2500);
    }
  };

  const isTimerRunningOnThisProject = isTimerRunning && timerProjectId === id;

  const handleToggleTimer = async () => {
    if (!project) return;
    if (isTimerRunningOnThisProject) {
      try {
        if (activeTimeEntryId) {
          await api.time.stopTimer(activeTimeEntryId);
        }
        stopTimer();
        queryClient.invalidateQueries({ queryKey: ['projectTime', id] });
      } catch (err) {
        alert('Could not stop timer: ' + err);
      }
    } else {
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
    }
  };

  const healthFactors = useMemo(() => {
    if (!project) return [];
    const list: Array<{ type: 'ok' | 'warning' | 'alert'; text: string }> = [];
    const overdueTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date());
    if (overdueTasks.length > 0) {
      list.push({ type: 'alert', text: `${overdueTasks.length} task overdue: "${overdueTasks[0].title}"` });
    }
    const pendingReviewDeliverables = deliverables.filter((d) => (d.status as string) === 'client_review' || d.status === 'internal_review');
    if (pendingReviewDeliverables.length > 0) {
      list.push({ type: 'warning', text: `${pendingReviewDeliverables.length} deliverable awaiting client review and approval` });
    }
    if (project.completedRevisions >= project.includedRevisions) {
      list.push({ type: 'alert', text: `Contractual revision cap reached (${project.completedRevisions}/${project.includedRevisions} used). Extra revisions require addendum.` });
    } else {
      list.push({ type: 'ok', text: `${project.includedRevisions - project.completedRevisions} revisions remaining within included scope` });
    }
    const overdueInvoices = projectInvoices.filter((i) => i.status === 'overdue');
    if (overdueInvoices.length > 0) {
      list.push({ type: 'alert', text: `${overdueInvoices.length} project invoice overdue for payment` });
    }
    if (project.deadline) {
      const daysLeft = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) {
        list.push({ type: 'alert', text: `Delivery deadline passed (${Math.abs(daysLeft)} days ago)` });
      } else if (daysLeft <= 3) {
        list.push({ type: 'warning', text: `Final delivery deadline in ${daysLeft} day${daysLeft > 1 ? 's' : ''}` });
      } else {
        list.push({ type: 'ok', text: `Timeline on schedule (${daysLeft} days remaining)` });
      }
    }
    return list;
  }, [project, tasks, deliverables, projectInvoices]);

  const todayTasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.status !== 'done' &&
        (t.priority === 'high' ||
          t.priority === 'urgent' ||
          (t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 86400000)))
    );
  }, [tasks]);

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'todo') return t.status !== 'done';
    if (taskFilter === 'done') return t.status === 'done';
    return true;
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">Loading project details...</div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="py-16 text-center space-y-3">
          <p className="text-xs text-muted-foreground">Project not found or ID is unavailable.</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>
        </div>
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

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{project.name}</h1>
                <span className="text-xs font-mono text-muted-foreground">{project.code}</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(project.health)}`}>
                  {project.health === 'healthy' ? 'Healthy' : project.health === 'at_risk' ? 'At Risk' : 'Blocked'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Client:{' '}
                <Link href={`/clients/${project.clientId}`} className="underline text-foreground font-medium">
                  {project.clientName}
                </Link>
                {project.healthReason && (
                  <span className="text-amber-600 dark:text-amber-400 ml-2 font-medium">
                    — {project.healthReason}
                  </span>
                )}
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => summarizeAiMutation.mutate()}
                disabled={summarizeAiMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{summarizeAiMutation.isPending ? 'Analyzing...' : 'AI Summary'}</span>
              </button>

              <button
                onClick={handleToggleTimer}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-xs ${
                  isTimerRunningOnThisProject
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100'
                }`}
              >
                {isTimerRunningOnThisProject ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isTimerRunningOnThisProject ? 'Stop Timer' : 'Start Timer'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('tasks');
                }}
                className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
              >
                + Task
              </button>

              <button
                onClick={() => {
                  setActiveTab('deliverables');
                }}
                className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
              >
                + Deliverable
              </button>

              <button
                onClick={() => {
                  setActiveTab('assets');
                  setIsUploadModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
              >
                + Asset
              </button>

              <button
                onClick={() => openQuickCreate('invoice')}
                className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
              >
                + Invoice
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete this project (${project.name})? This action cannot be undone.`)) {
                    deleteProjectMutation.mutate();
                  }
                }}
                disabled={deleteProjectMutation.isPending}
                title="Delete Project"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 rounded-md transition-colors border border-rose-200 dark:border-rose-900/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profitability & Health Ledger */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
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
        <div className="flex border-b border-border gap-4 sm:gap-6 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'overview'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
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
            onClick={() => setActiveTab('milestones')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'milestones'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Milestones ({milestones.length})
          </button>
          <button
            onClick={() => setActiveTab('scope')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'scope'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Scope & Changes ({scopeResult?.changes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('creative')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'creative'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Creative Workflow ({shots.length + equipment.length})
          </button>
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
            onClick={() => setActiveTab('assets')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'assets'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Assets & Files ({projectFiles.length})
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'time'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Time ({timeEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'invoices'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Invoices ({projectInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'activity'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('closeout')}
            className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'closeout'
                ? 'border-neutral-900 text-foreground dark:border-white font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Closeout & Sign-off
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

              {project.healthReason && (
                <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
                  <div className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Project Health Notice:</span>
                  </div>
                  <p className="mt-1 text-muted-foreground text-[11px] pl-6">
                    {project.healthReason}
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 rounded-lg border border-border bg-card space-y-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Revision Policy & Constraints
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
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Revisions Remaining:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {Math.max(0, project.includedRevisions - project.completedRevisions)}
                  </span>
                </div>
                {project.completedRevisions >= project.includedRevisions && (
                  <div className="pt-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium border-t border-border mt-2">
                    ⚠️ Included revisions exhausted. Scope change or extra billing applies.
                  </div>
                )}
              </div>
            </div>

            {/* Health Analysis & Today's Action Checklist */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Health Diagnostics Breakdown */}
              <div className="p-5 rounded-lg border border-border bg-card space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-foreground" />
                    <span>Health Diagnostics</span>
                  </h3>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(project.health)}`}>
                    {project.health === 'healthy' ? 'Healthy' : project.health === 'at_risk' ? 'At Risk' : 'Blocked'}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {healthFactors.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-1">All project health indicators normal.</p>
                  ) : (
                    healthFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            factor.type === 'alert'
                              ? 'bg-rose-500 ring-2 ring-rose-500/20'
                              : factor.type === 'warning'
                                ? 'bg-amber-500 ring-2 ring-amber-500/20'
                                : 'bg-emerald-500 ring-2 ring-emerald-500/20'
                          }`}
                        />
                        <span className={factor.type === 'alert' ? 'text-rose-600 dark:text-rose-400 font-medium' : factor.type === 'warning' ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}>
                          {factor.text}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Today's Action Checklist */}
              <div className="p-5 rounded-lg border border-border bg-card space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-foreground" />
                    <span>Today&apos;s Focus Checklist</span>
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {todayTasks.length} active
                  </span>
                </div>

                {todayTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3">
                    No urgent tasks due today. All high-priority milestones are up to date.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {todayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/40 border border-border text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleTaskMutation.mutate({ taskId: t.id, currentStatus: t.status })}
                            className="w-4 h-4 rounded border border-border flex items-center justify-center hover:border-foreground transition-colors shrink-0"
                          >
                            {t.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />}
                          </button>
                          <span className="truncate font-medium text-foreground">{t.title}</span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-medium border shrink-0 ml-2 ${getStatusBadgeClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Project Delivery Timeline */}
            <div className="md:col-span-3 p-5 rounded-lg border border-border bg-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                <div>
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-foreground" />
                    <span>Project Chronology & Milestone Timeline</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Step-by-step contractual milestones, shoot dates, and deliverable handoffs from kickoff to final deadline.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('milestones')}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Manage Milestones ({milestones.length})</span>
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </button>
              </div>

              <div className="relative pt-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Step 1: Kickoff */}
                  <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                        Phase 01 • Kickoff
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-xs font-semibold text-foreground">Project Commissioned</div>
                    <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground pt-1">
                      Deposit received & scope locked.
                    </div>
                  </div>

                  {/* Step 2: Intermediate Milestones or Creative Shoots */}
                  {milestones.length > 0 ? (
                    milestones.slice(0, 2).map((ms, idx) => (
                      <div key={ms.id} className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                            Phase 0{idx + 2} • Milestone
                          </span>
                          <span className={`w-2 h-2 rounded-full ${ms.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        </div>
                        <div className="text-xs font-semibold text-foreground truncate">{ms.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(ms.dueDate)}</span>
                          </span>
                          <span className="font-semibold text-foreground">{formatCurrency(ms.paymentAmount || 0, project.currency)}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground capitalize">
                          Status: <strong className={ms.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{ms.status.replace('_', ' ')}</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                          Phase 02 • Production
                        </span>
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                      <div className="text-xs font-semibold text-foreground">Creative Execution</div>
                      <div className="text-[11px] font-mono text-muted-foreground">In progress</div>
                      <div className="text-[10px] text-muted-foreground pt-1">
                        {tasks.filter((t) => t.status === 'done').length}/{tasks.length} tasks completed
                      </div>
                    </div>
                  )}

                  {/* Step 3: Deliverables Review */}
                  <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                        Phase 03 • Review
                      </span>
                      <span className={`w-2 h-2 rounded-full ${deliverables.some((d) => d.status === 'approved') ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                    </div>
                    <div className="text-xs font-semibold text-foreground">Client Deliverables</div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      {deliverables.length} item{deliverables.length === 1 ? '' : 's'} registered
                    </div>
                    <div className="text-[10px] text-muted-foreground pt-1">
                      {project.completedRevisions}/{project.includedRevisions} revisions used
                    </div>
                  </div>

                  {/* Step 4: Final Deadline & Closeout */}
                  <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                        Phase 04 • Delivery
                      </span>
                      <span className={`w-2 h-2 rounded-full ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                    </div>
                    <div className="text-xs font-semibold text-foreground">Contractual Hand-off</div>
                    <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(project.deadline)}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground pt-1">
                      Full sign-off & invoice settlement.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Notes & Production Scratchpad */}
            <div className="md:col-span-3 p-5 rounded-lg border border-border bg-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                <div>
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-foreground" />
                    <span>Project Notes & Production Scratchpad</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Internal workspace scratchpad for creative notes, crew phone numbers, zoom links, camera codecs, and client passwords.
                  </p>
                </div>
                {notesSavedToast && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved to project ledger</span>
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={projectNotes !== null ? projectNotes : (project.notes || '')}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  placeholder="Type internal project notes, shoot guidelines, camera codecs (e.g. REDCODE 8:1 8K), Zoom meeting IDs, client FTP passwords..."
                  className="w-full p-3 text-xs bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-y font-mono leading-relaxed"
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{(projectNotes !== null ? projectNotes : (project.notes || '')).length} characters</span>
                  <button
                    onClick={() => saveNotesMutation.mutate(projectNotes !== null ? projectNotes : (project.notes || ''))}
                    disabled={saveNotesMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveNotesMutation.isPending ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-muted/40 p-0.5 rounded-md border border-border text-[11px]">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    taskFilter === 'all' ? 'bg-background text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setTaskFilter('todo')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    taskFilter === 'todo' ? 'bg-background text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  To Do ({tasks.filter((t) => t.status !== 'done').length})
                </button>
                <button
                  onClick={() => setTaskFilter('done')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    taskFilter === 'done' ? 'bg-background text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Done ({tasks.filter((t) => t.status === 'done').length})
                </button>
              </div>
            </div>

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
              <select
                value={newTaskPriority}
                onChange={(e: any) => setNewTaskPriority(e.target.value)}
                className="px-2 py-1.5 text-xs bg-background border border-border rounded-md text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md"
              >
                Add Task
              </button>
            </form>

            <div className="border border-border rounded-lg bg-card divide-y divide-border text-xs">
              {filteredTasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No tasks matching this filter.</div>
              ) : (
                filteredTasks.map((task) => (
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete task "${task.title}"?`)) {
                            deleteTaskMutation.mutate(task.id);
                          }
                        }}
                        title="Delete Task"
                        className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Milestones */}
        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newMilestoneName.trim()) createMilestoneMutation.mutate();
              }}
              className="p-4 rounded-lg border border-border bg-card space-y-3"
            >
              <h3 className="text-xs font-semibold text-foreground">Add Project Milestone</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Milestone Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rough Cut Delivery, Sound Lock, Final Color Grade"
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={newMilestoneDue}
                    onChange={(e) => setNewMilestoneDue(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Linked Payment ({project.currency})</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newMilestoneAmount}
                      onChange={(e) => setNewMilestoneAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                    <button
                      type="submit"
                      disabled={createMilestoneMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md whitespace-nowrap"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Project Roadmap & Release Gates</h4>
                  <p className="text-[11px] text-muted-foreground">Track critical deadlines and tied milestone disbursements.</p>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  {milestones.filter((m) => m.status === 'completed').length} of {milestones.length} completed
                </div>
              </div>
              <div className="divide-y divide-border">
                {milestones.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No roadmap milestones defined. Add one above to anchor delivery gates.
                  </div>
                ) : (
                  milestones.map((m) => (
                    <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start sm:items-center gap-3">
                        <button
                          onClick={() => toggleMilestoneMutation.mutate({ milestoneId: m.id, currentStatus: m.status })}
                          className={`mt-0.5 sm:mt-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            m.status === 'completed'
                              ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900'
                              : 'border-border'
                          }`}
                        >
                          {m.status === 'completed' && <Check className="w-2.5 h-2.5" />}
                        </button>
                        <div>
                          <span className={`text-xs font-medium block ${m.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {m.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Due {formatDate(m.dueDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {m.paymentAmount ? (
                          <span className="text-xs font-mono font-medium text-foreground">
                            {formatCurrency(m.paymentAmount, project.currency)}
                          </span>
                        ) : null}
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(m.status)}`}>
                          {m.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete milestone "${m.name}"?`)) {
                              deleteMilestoneMutation.mutate(m.id);
                            }
                          }}
                          title="Delete Milestone"
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Scope & Changes */}
        {activeTab === 'scope' && (
          <div className="space-y-6">
            {/* Scope Boundaries Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Included in Scope
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Revisions: {project.completedRevisions}/{project.includedRevisions} used
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {scopeResult?.scope?.includedItems && scopeResult.scope.includedItems.length > 0 ? (
                    scopeResult.scope.includedItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>All deliverables agreed in project statement of work</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Up to {project.includedRevisions} comprehensive revision cycles per deliverable</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Final export delivery in high-resolution master formats</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Explicitly Out of Scope
                </h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {scopeResult?.scope?.excludedItems && scopeResult.scope.excludedItems.length > 0 ? (
                    scopeResult.scope.excludedItems.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>Unscheduled shoot days or emergency turnaround (billed at surge rate)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>Third-party commercial music/font licensing fees</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>Major conceptual pivot after storyboard sign-off</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Scope Changes & Addendums */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Change Orders & Scope Addendums</h3>
                  <p className="text-[11px] text-muted-foreground">Protect revenue and prevent scope creep by formally quoting adjustments.</p>
                </div>
              </div>

              {/* Add Change Order Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newChangeOrderTitle.trim()) createChangeOrderMutation.mutate();
                }}
                className="p-4 rounded-lg border border-border bg-card space-y-3"
              >
                <h4 className="text-xs font-semibold text-foreground">Record Scope Change Request</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Change Order Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Additional 15s Cutdown, Extra Location Shoot"
                      value={newChangeOrderTitle}
                      onChange={(e) => setNewChangeOrderTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Additional Cost ({project.currency})</label>
                    <input
                      type="number"
                      value={newChangeOrderCost}
                      onChange={(e) => setNewChangeOrderCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Est. Hours</label>
                    <input
                      type="number"
                      value={newChangeOrderHours}
                      onChange={(e) => setNewChangeOrderHours(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Scope Rationale & Deliverable Details</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Client requested extra horizontal formats after vertical approval..."
                      value={newChangeOrderDetails}
                      onChange={(e) => setNewChangeOrderDetails(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                    <button
                      type="submit"
                      disabled={createChangeOrderMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md whitespace-nowrap"
                    >
                      Issue Addendum
                    </button>
                  </div>
                </div>
              </form>

              {/* Scope Changes List */}
              <div className="border border-border rounded-lg bg-card divide-y divide-border overflow-hidden">
                {!scopeResult?.changes || scopeResult.changes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No change orders logged for this project. Scope is strictly aligned to the original agreement.
                  </div>
                ) : (
                  scopeResult.changes.map((co) => (
                    <div key={co.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">{co.title}</span>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(co.status)}`}>
                            {co.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{co.requestDetails}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                          <span>Requested by: {co.requestedBy}</span>
                          <span>•</span>
                          <span>{co.estimatedHours} hours</span>
                          <span>•</span>
                          <span>{formatDate(co.requestedDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs font-mono font-medium text-foreground">
                          +{formatCurrency(co.additionalCost, co.currency)}
                        </span>
                        {co.status === 'quoted' && (
                          <button
                            onClick={() => approveChangeOrderMutation.mutate(co.id)}
                            disabled={approveChangeOrderMutation.isPending}
                            className="px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
                          >
                            Approve Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Creative Workflow */}
        {activeTab === 'creative' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <button
                onClick={() => setCreativeSubTab('callSheets')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  creativeSubTab === 'callSheets'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-muted-foreground hover:text-foreground bg-muted/50'
                }`}
              >
                Call Sheets ({callSheets.length})
              </button>
              <button
                onClick={() => setCreativeSubTab('shots')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  creativeSubTab === 'shots'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-muted-foreground hover:text-foreground bg-muted/50'
                }`}
              >
                Shot List ({shots.length})
              </button>
              <button
                onClick={() => setCreativeSubTab('equipment')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  creativeSubTab === 'equipment'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-muted-foreground hover:text-foreground bg-muted/50'
                }`}
              >
                Gear & Equipment ({equipment.length})
              </button>
            </div>

            {/* Sub-tab 1: Call Sheets */}
            {creativeSubTab === 'callSheets' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {callSheets.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-xs text-muted-foreground border border-border rounded-lg bg-card">
                      No production call sheets scheduled for this project.
                    </div>
                  ) : (
                    callSheets.map((cs) => (
                      <div key={cs.id} className="p-4 rounded-lg border border-border bg-card space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">{cs.title}</h4>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              Shoot Date: {formatDate(cs.shootDate)}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-foreground border border-border">
                            {cs.callTimes || 'Call: 08:00 AM'}
                          </span>
                        </div>
                        <div className="text-xs space-y-1.5 text-muted-foreground">
                          <div><span className="font-medium text-foreground">Location:</span> {cs.location}</div>
                          {cs.crew && <div><span className="font-medium text-foreground">Crew:</span> {cs.crew}</div>}
                          {cs.notes && <div><span className="font-medium text-foreground">Notes:</span> {cs.notes}</div>}
                          {cs.emergencyContact && (
                            <div className="font-mono text-[11px]"><span className="font-medium text-foreground">Emergency:</span> {cs.emergencyContact}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Shot List */}
            {creativeSubTab === 'shots' && (
              <div className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newShotDesc.trim()) createShotMutation.mutate();
                  }}
                  className="p-4 rounded-lg border border-border bg-card space-y-3"
                >
                  <h4 className="text-xs font-semibold text-foreground">Add Shot to Production Slate</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Shot #</label>
                      <input
                        type="text"
                        placeholder="e.g. 5A"
                        value={newShotNumber}
                        onChange={(e) => setNewShotNumber(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Framing</label>
                      <input
                        type="text"
                        placeholder="Wide / Medium / ECU"
                        value={newShotFraming}
                        onChange={(e) => setNewShotFraming(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Lens</label>
                      <input
                        type="text"
                        placeholder="24mm / 50mm / 85mm"
                        value={newShotLens}
                        onChange={(e) => setNewShotLens(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Action</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Actor opens door..."
                          value={newShotDesc}
                          onChange={(e) => setNewShotDesc(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                          required
                        />
                        <button
                          type="submit"
                          disabled={createShotMutation.isPending}
                          className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md whitespace-nowrap"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="border border-border rounded-lg bg-card overflow-hidden">
                  <div className="p-3 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span>{shots.filter((s) => s.status === 'shot').length} of {shots.length} shots completed</span>
                    <span>Slate Progress: {shots.length ? Math.round((shots.filter((s) => s.status === 'shot').length / shots.length) * 100) : 0}%</span>
                  </div>
                  <div className="divide-y divide-border">
                    {shots.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No shots queued in slate. Add your first setup above.
                      </div>
                    ) : (
                      shots.map((shot) => (
                        <div key={shot.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleShotMutation.mutate({ shotId: shot.id, currentStatus: shot.status })}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                shot.status === 'shot'
                                  ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900'
                                  : 'border-border'
                              }`}
                            >
                              {shot.status === 'shot' && <Check className="w-2.5 h-2.5" />}
                            </button>
                            <span className="font-mono text-xs font-bold text-foreground w-8">{shot.shotNumber}</span>
                            <div>
                              <span className={`text-xs ${shot.status === 'shot' ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                                {shot.description}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                                {shot.framing && <span>{shot.framing}</span>}
                                {shot.lens && <span>• {shot.lens}</span>}
                                {shot.location && <span>• {shot.location}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize border ${getStatusBadgeClass(shot.status)}`}>
                              {shot.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete shot ${shot.shotNumber}?`)) {
                                  deleteShotMutation.mutate(shot.id);
                                }
                              }}
                              title="Delete Shot"
                              className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Gear Checklist */}
            {creativeSubTab === 'equipment' && (
              <div className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newEquipmentItem.trim()) createEquipmentMutation.mutate();
                  }}
                  className="p-4 rounded-lg border border-border bg-card space-y-3"
                >
                  <h4 className="text-xs font-semibold text-foreground">Add Production Equipment to Pack List</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Equipment Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Sony FX6, Aputure 600d, Wireless Lavalier Kit"
                        value={newEquipmentItem}
                        onChange={(e) => setNewEquipmentItem(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Category</label>
                      <select
                        value={newEquipmentCategory}
                        onChange={(e) => setNewEquipmentCategory(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      >
                        <option value="Camera">Camera</option>
                        <option value="Lighting">Lighting</option>
                        <option value="Audio">Audio</option>
                        <option value="Grip">Grip</option>
                        <option value="DIT">DIT / Storage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Quantity</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={newEquipmentQty}
                          min={1}
                          onChange={(e) => setNewEquipmentQty(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                        />
                        <button
                          type="submit"
                          disabled={createEquipmentMutation.isPending}
                          className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md whitespace-nowrap"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="border border-border rounded-lg bg-card overflow-hidden">
                  <div className="p-3 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span>{equipment.filter((eq) => eq.status === 'packed').length} of {equipment.length} items packed</span>
                    <span>Pack Status: {equipment.length ? Math.round((equipment.filter((eq) => eq.status === 'packed').length / equipment.length) * 100) : 0}%</span>
                  </div>
                  <div className="divide-y divide-border">
                    {equipment.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No equipment entries. Add equipment to track packing list.
                      </div>
                    ) : (
                      equipment.map((eq) => (
                        <div key={eq.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleEquipmentMutation.mutate({ eqId: eq.id, currentStatus: eq.status })}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                eq.status === 'packed'
                                  ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900'
                                  : 'border-border'
                              }`}
                            >
                              {eq.status === 'packed' && <Check className="w-2.5 h-2.5" />}
                            </button>
                            <span className="font-mono text-xs text-muted-foreground w-6">×{eq.quantity}</span>
                            <div>
                              <span className={`text-xs ${eq.status === 'packed' ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                                {eq.item}
                              </span>
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                {eq.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize border ${getStatusBadgeClass(eq.status)}`}>
                              {eq.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete equipment "${eq.item}"?`)) {
                                  deleteEquipmentMutation.mutate(eq.id);
                                }
                              }}
                              title="Delete Equipment"
                              className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
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
                placeholder="New deliverable name (e.g. Master Video Edit, Final Brand Guide)..."
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
              {deliverables.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-muted-foreground border border-border rounded-lg bg-card">
                  No deliverables created yet for this project.
                </div>
              ) : (
                deliverables.map((deliv) => (
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
                        Uploaded Versions & History
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

                    {/* Approval & Delete Actions */}
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete deliverable "${deliv.title}"?`)) {
                            deleteDeliverableMutation.mutate(deliv.id);
                          }
                        }}
                        title="Delete Deliverable"
                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-900/50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => requestApprovalMutation.mutate(deliv.id)}
                        disabled={requestApprovalMutation.isPending}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition-colors"
                      >
                        <Send className="w-3 h-3 text-muted-foreground" />
                        <span>Request Client Approval</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Assets & Files (Cloudflare R2 File Manager & Client Asset Requests) */}
        {activeTab === 'assets' && (
          <div className="space-y-6">
            {/* Cloudflare R2 Storage Banner */}
            <div className="p-4 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Cloudflare R2 Object Storage
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Bucket: freelanceros-files
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Global multi-region object storage with zero egress bandwidth charges. Secure presigned URLs with custom expiration.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono pt-1">
                  <span>Files: <strong className="text-foreground">{projectFiles.length}</strong></span>
                  <span>•</span>
                  <span>
                    Storage Used:{' '}
                    <strong className="text-foreground">
                      {formatFileSize(projectFiles.reduce((acc, f) => acc + (f.sizeBytes || 0), 0))}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">⚡ 0 Egress Bandwidth Fees</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setIsAssetRequestModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-md border border-border text-foreground transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Request Asset from Client</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File to R2</span>
                </button>
              </div>
            </div>

            {/* Asset Views Subtabs: R2 Files vs Client Asset Requests */}
            <div className="flex items-center justify-between border-b border-border pb-2 gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAssetSubTab('files')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedAssetSubTab === 'files'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-muted-foreground hover:text-foreground bg-muted/40'
                  }`}
                >
                  Project Files ({projectFiles.length})
                </button>
                <button
                  onClick={() => setSelectedAssetSubTab('requests')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedAssetSubTab === 'requests'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-muted-foreground hover:text-foreground bg-muted/40'
                  }`}
                >
                  Client Asset Requests ({assetRequests.length})
                </button>
              </div>

              {selectedAssetSubTab === 'files' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Folder className="w-3.5 h-3.5 text-muted-foreground" />
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none"
                  >
                    <option value="all">All Folders ({projectFiles.length})</option>
                    <option value="Media & Raw Footage">Media & Raw Footage</option>
                    <option value="Brand Assets & Vector Logos">Brand Assets & Vector Logos</option>
                    <option value="Deliverables & Exports">Deliverables & Exports</option>
                    <option value="Legal & Contracts">Legal & Contracts</option>
                    <option value="General">General</option>
                  </select>
                </div>
              )}
            </div>

            {/* Subtab 1: Project Files Grid & Table */}
            {selectedAssetSubTab === 'files' && (
              <div className="space-y-4">
                {projectFiles.filter((f) => selectedFolder === 'all' || f.folder === selectedFolder).length === 0 ? (
                  <div className="py-12 text-center border border-border rounded-lg bg-card space-y-3">
                    <HardDrive className="w-8 h-8 text-muted-foreground mx-auto stroke-1" />
                    <div className="text-xs font-medium text-foreground">No files in this folder</div>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Store high-resolution RAW footage, brand SVG vectors, project agreements, or exports directly in Cloudflare R2.
                    </p>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload First File</span>
                    </button>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium">
                            <th className="py-2.5 px-4">File Name</th>
                            <th className="py-2.5 px-4">Folder</th>
                            <th className="py-2.5 px-4">Size</th>
                            <th className="py-2.5 px-4">Storage Key (R2)</th>
                            <th className="py-2.5 px-4">Uploaded</th>
                            <th className="py-2.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {projectFiles
                            .filter((f) => selectedFolder === 'all' || f.folder === selectedFolder)
                            .map((file) => (
                              <tr key={file.id} className="table-row-hover transition-colors">
                                <td className="py-3 px-4 font-medium text-foreground">
                                  <div className="flex items-center gap-2.5">
                                    <span className="p-1.5 rounded bg-muted/60 shrink-0">
                                      {getFileIcon(file.name, file.mimeType)}
                                    </span>
                                    <span className="truncate max-w-[220px]" title={file.name}>
                                      {file.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-muted/50 border border-border text-foreground">
                                    {file.folder}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-muted-foreground">
                                  {formatFileSize(file.sizeBytes)}
                                </td>
                                <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground max-w-[180px] truncate" title={file.r2Key}>
                                  {file.r2Key}
                                </td>
                                <td className="py-3 px-4 font-mono text-muted-foreground">
                                  {formatDate(file.uploadedAt)}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleOpenShareModal(file)}
                                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                      title="Generate Secure Share Link (Signed R2 URL)"
                                    >
                                      <Share2 className="w-3.5 h-3.5" />
                                    </button>

                                    <a
                                      href={file.publicUrl || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={file.name}
                                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                      title="Download File"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>

                                    <button
                                      onClick={() => {
                                        if (confirm(`Delete file "${file.name}" from R2?`)) {
                                          deleteFileMutation.mutate(file.id);
                                        }
                                      }}
                                      className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                      title="Delete File"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subtab 2: Client Asset Requests */}
            {selectedAssetSubTab === 'requests' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Client Asset Intake & Outstanding Requests
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Collect brand guide PDFs, vector logos, talent releases, and credentials directly from the client.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAssetRequestModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Request New Asset</span>
                  </button>
                </div>

                {assetRequests.length === 0 ? (
                  <div className="py-12 text-center border border-border rounded-lg bg-card space-y-3">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto stroke-1" />
                    <div className="text-xs font-medium text-foreground">No asset requests pending</div>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Send formatted asset requests to your client with due dates and delivery instructions.
                    </p>
                    <button
                      onClick={() => setIsAssetRequestModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Asset Request</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assetRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-lg border border-border bg-card space-y-3 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                              {req.clientName || project.clientName || 'Client'}
                            </span>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border uppercase font-mono ${
                                req.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                                  : req.status === 'received'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                              }`}
                            >
                              {req.status.replace('_', ' ')}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-foreground line-clamp-1">{req.title}</h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {req.description || 'Asset required for project deliverables and production timeline.'}
                          </p>

                          {req.fileName && (
                            <div className="p-2 bg-muted/40 rounded border border-border flex items-center gap-2 text-xs">
                              <File className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate font-mono text-[11px] text-foreground">{req.fileName}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                            <span>Due: {req.dueDate ? formatDate(req.dueDate) : 'Open'}</span>
                            <span className="text-[10px]">{formatDate(req.createdAt)}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 gap-2">
                            <button
                              onClick={() => {
                                if (confirm(`Remove asset request "${req.title}"?`)) {
                                  deleteAssetRequestMutation.mutate(req.id);
                                }
                              }}
                              className="text-[11px] text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            >
                              Delete
                            </button>

                            <div className="flex items-center gap-1.5">
                              {req.status === 'requested' && (
                                <button
                                  onClick={() =>
                                    updateAssetRequestMutation.mutate({
                                      reqId: req.id,
                                      data: { status: 'received', fileName: 'Uploaded_Asset.zip' },
                                    })
                                  }
                                  className="px-2 py-1 text-[11px] font-medium bg-muted hover:bg-muted/80 rounded border border-border text-foreground transition-colors"
                                >
                                  Mark Received
                                </button>
                              )}

                              {req.status === 'received' && (
                                <button
                                  onClick={() =>
                                    updateAssetRequestMutation.mutate({
                                      reqId: req.id,
                                      data: { status: 'approved' },
                                    })
                                  }
                                  className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                                >
                                  Approve Asset
                                </button>
                              )}

                              {req.status === 'approved' && (
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 font-mono">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approved</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Time Tracking */}
        {activeTab === 'time' && (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Date</th>
                    <th className="py-2.5 px-4 font-medium">Description</th>
                    <th className="py-2.5 px-4 font-medium">Duration</th>
                    <th className="py-2.5 px-4 font-medium">Billable</th>
                    <th className="py-2.5 px-4 font-medium text-right">Value</th>
                    <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {timeEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No time logged yet on this project.
                      </td>
                    </tr>
                  ) : (
                    timeEntries.map((entry) => (
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
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this time entry?')) {
                                deleteTimeMutation.mutate(entry.id);
                              }
                            }}
                            title="Delete Time Entry"
                            className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openQuickCreate('invoice')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Invoice For Project</span>
              </button>
            </div>

            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Invoice #</th>
                      <th className="py-2.5 px-4 font-medium">Title</th>
                      <th className="py-2.5 px-4 font-medium">Status</th>
                      <th className="py-2.5 px-4 font-medium">Due Date</th>
                      <th className="py-2.5 px-4 font-medium text-right">Total</th>
                      <th className="py-2.5 px-4 font-medium text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projectInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No invoices issued for this project yet.
                        </td>
                      </tr>
                    ) : (
                      projectInvoices.map((inv) => (
                        <tr key={inv.id} className="table-row-hover">
                          <td className="py-3 px-4 font-mono font-medium text-foreground">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{inv.title}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(inv.status)}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-mono">
                            {formatDate(inv.dueDate)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium">
                            {formatCurrency(inv.totalAmount || inv.total || 0, inv.currency)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {inv.balanceDue > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {formatCurrency(inv.balanceDue, inv.currency)}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
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

        {/* Tab 6: Activity Feed */}
        {activeTab === 'activity' && (
          <div className="p-6 rounded-lg border border-border bg-card space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Project Timeline & Milestone Log
            </h3>
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-6">No historical activity logs recorded.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="relative pl-6 text-xs">
                    <span className="absolute left-1 top-1 w-2 h-2 rounded-full bg-neutral-900 dark:bg-white -translate-x-1/2" />
                    <p className="font-medium text-foreground leading-snug">{log.description}</p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Closeout & Sign-off Workflow */}
        {activeTab === 'closeout' && (
          <div className="space-y-6">
            {/* Status & Quick Actions Banner */}
            <div className="p-5 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Project Lifecycle Status</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border capitalize ${getStatusBadgeClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Execute project sign-off, verify zero outstanding receivables, and archive project assets.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => duplicateProjectMutation.mutate()}
                  disabled={duplicateProjectMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate Project</span>
                </button>

                {project.status !== 'archived' ? (
                  <button
                    onClick={() => updateProjectStatusMutation.mutate('archived')}
                    disabled={updateProjectStatusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted rounded-md transition-colors border border-border"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive Project</span>
                  </button>
                ) : (
                  <button
                    onClick={() => updateProjectStatusMutation.mutate('active')}
                    disabled={updateProjectStatusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-colors border border-blue-500/20"
                  >
                    <span>Restore to Active</span>
                  </button>
                )}

                {project.status !== 'completed' ? (
                  <button
                    onClick={() => updateProjectStatusMutation.mutate('completed')}
                    disabled={updateProjectStatusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete & Close Project</span>
                  </button>
                ) : (
                  <button
                    onClick={() => updateProjectStatusMutation.mutate('active')}
                    disabled={updateProjectStatusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-md transition-colors border border-amber-500/20"
                  >
                    <span>Re-open Project</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to permanently delete "${project.name}"? All associated data will be removed.`)) {
                      deleteProjectMutation.mutate();
                    }
                  }}
                  disabled={deleteProjectMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 rounded-md transition-colors border border-rose-200 dark:border-rose-900/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              </div>
            </div>

            {/* 4-Gate Closeout Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gate 1: Deliverables */}
              <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Gate 1: Deliverables Approval</span>
                  </h4>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {deliverables.filter((d) => d.status === 'approved').length}/{deliverables.length} Approved
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Confirm all creative masters, video exports, and deliverables have received formal sign-off.
                </p>
                <div className="space-y-1.5 text-xs">
                  {deliverables.length === 0 ? (
                    <span className="text-muted-foreground">No deliverables registered.</span>
                  ) : (
                    deliverables.map((deliv) => (
                      <div key={deliv.id} className="flex items-center justify-between py-1 border-b border-border/50 text-[11px]">
                        <span className="text-foreground">{deliv.title}</span>
                        <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] capitalize border ${getStatusBadgeClass(deliv.status)}`}>
                          {deliv.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Gate 2: Invoices & Receivables */}
              <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Gate 2: Invoices & Payment</span>
                  </h4>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {projectInvoices.filter((i) => i.balanceDue === 0).length}/{projectInvoices.length} Paid
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reconcile all milestones and ensure no unpaid invoices remain outstanding.
                </p>
                <div className="space-y-1.5 text-xs">
                  {projectInvoices.length === 0 ? (
                    <span className="text-muted-foreground">No invoices generated yet for this project.</span>
                  ) : (
                    projectInvoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between py-1 border-b border-border/50 text-[11px]">
                        <span className="text-foreground font-mono">{inv.invoiceNumber} - {inv.title}</span>
                        <span className="font-mono font-medium">
                          {inv.balanceDue > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">Due {formatCurrency(inv.balanceDue, inv.currency)}</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">Settled</span>
                          )}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Gate 3: Scope & Revision Accounting */}
              <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Gate 3: Scope & Revision Lock</span>
                  </h4>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {project.completedRevisions}/{project.includedRevisions} Revisions Used
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lock scope addendums and confirm revision allowance was honored without unbilled creep.
                </p>
                <div className="p-2.5 bg-muted/30 rounded border border-border text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Approved Change Orders:</span>
                    <span className="font-mono text-foreground font-medium">{scopeResult?.changes?.filter((c) => c.status === 'approved').length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Billable Hours Tracked:</span>
                    <span className="font-mono text-foreground font-medium">{project.totalHoursTracked}h</span>
                  </div>
                </div>
              </div>

              {/* Gate 4: IP Release & Portfolio */}
              <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Gate 4: Rights Release & Archive</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Archive raw shoot media, release intellectual property to the client, and document studio learnings.
                </p>
                <div className="p-2.5 bg-muted/30 rounded border border-border text-xs space-y-2">
                  <div className="flex items-center gap-2 text-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Production masters archived</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Client rights transferred</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Project Executive Summary Modal */}
      {isAiModalOpen && aiSummaryData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">AI Project Executive Summary</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">{project.name} • {project.code}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeClass(aiSummaryData.health)}`}>
                {aiSummaryData.health}
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-line bg-muted/30 p-3.5 rounded-lg border border-border">
                {aiSummaryData.summary}
              </div>

              {aiSummaryData.recommendedActions && aiSummaryData.recommendedActions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {aiSummaryData.recommendedActions.map((action: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 bg-card p-2 rounded border border-border">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{idx + 1}.</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiSummaryData.metrics && (
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border text-center">
                  <div className="p-2 bg-muted/40 rounded border border-border">
                    <div className="text-sm font-bold font-mono text-foreground">{aiSummaryData.metrics.totalTasks}</div>
                    <div className="text-[10px] text-muted-foreground">Tasks</div>
                  </div>
                  <div className="p-2 bg-muted/40 rounded border border-border">
                    <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{aiSummaryData.metrics.completedTasks}</div>
                    <div className="text-[10px] text-muted-foreground">Done</div>
                  </div>
                  <div className="p-2 bg-muted/40 rounded border border-border">
                    <div className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">{aiSummaryData.metrics.overdueTasks}</div>
                    <div className="text-[10px] text-muted-foreground">Overdue</div>
                  </div>
                  <div className="p-2 bg-muted/40 rounded border border-border">
                    <div className="text-sm font-bold font-mono text-foreground">{aiSummaryData.metrics.deliverablesCount}</div>
                    <div className="text-[10px] text-muted-foreground">Deliverables</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload File to R2 Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-4 sm:p-5 bg-card border border-border rounded-lg shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-foreground">Upload to Cloudflare R2</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newUploadName.trim()) return;
                uploadFileMutation.mutate({
                  name: newUploadName.trim(),
                  folder: newUploadFolder,
                  sizeBytes: newUploadSizeMb * 1024 * 1024,
                  mimeType: newUploadName.endsWith('.pdf') ? 'application/pdf' : newUploadName.endsWith('.mov') ? 'video/quicktime' : newUploadName.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream',
                  r2Key: `projects/${id}/${Date.now()}-${newUploadName.trim()}`,
                  publicUrl: `/api/files/download/projects/${id}/${newUploadName.trim()}`,
                });
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master_Color_Grade_V2.mov, Signed_Contract_Final.pdf"
                  value={newUploadName}
                  onChange={(e) => setNewUploadName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Target Folder Category *
                </label>
                <select
                  value={newUploadFolder}
                  onChange={(e) => setNewUploadFolder(e.target.value as ProjectFileFolder)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="Deliverables & Exports">Deliverables & Exports</option>
                  <option value="Media & Raw Footage">Media & Raw Footage</option>
                  <option value="Brand Assets & Vector Logos">Brand Assets & Vector Logos</option>
                  <option value="Legal & Contracts">Legal & Contracts</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={newUploadSizeMb}
                  onChange={(e) => setNewUploadSizeMb(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                />
              </div>

              <div className="p-3 bg-muted/40 rounded border border-border text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <span>☁️ Destination:</span>
                  <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">r2://freelanceros-files/projects/{id}/</span>
                </div>
                <p className="text-[10px]">Direct serverless upload with instant regional edge caching and zero egress cost.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadFileMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadFileMutation.isPending ? 'Storing in R2...' : 'Upload File'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Secure Share Link Modal */}
      {isShareModalOpen && shareTargetFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-4 sm:p-5 bg-card border border-border rounded-lg shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-foreground">Secure R2 Share Link</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">Selected File</span>
                <div className="text-xs font-semibold text-foreground truncate mt-0.5">{shareTargetFile.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {formatFileSize(shareTargetFile.sizeBytes)} • {shareTargetFile.folder}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Link Expiration Duration
                </label>
                <select
                  value={shareExpiryHours}
                  onChange={async (e) => {
                    const hours = Number(e.target.value);
                    setShareExpiryHours(hours);
                    try {
                      const res = await api.files.generateShareLink(shareTargetFile.id, hours);
                      setGeneratedShareUrl(res.shareUrl);
                    } catch {
                      // ignore
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value={1}>1 Hour (Quick Review)</option>
                  <option value={24}>24 Hours (Standard Client Share)</option>
                  <option value={168}>7 Days (Weekly Review)</option>
                  <option value={720}>30 Days (Extended Archive Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Cloudflare R2 Presigned Download Link
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={generatedShareUrl}
                    className="flex-1 px-2.5 py-1.5 text-[11px] font-mono bg-muted/50 border border-border rounded-md text-foreground select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyShareUrl}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md shrink-0 transition-opacity"
                  >
                    {shareCopiedToast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{shareCopiedToast ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded border border-border text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Token Encrypted & Time-Limited</span>
                </div>
                <p>Recipients cannot access other bucket objects. Access automatically revokes after {shareExpiryHours} hours.</p>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Asset from Client Modal */}
      {isAssetRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-4 sm:p-5 bg-card border border-border rounded-lg shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-foreground">Request Asset from Client</h3>
              </div>
              <button
                onClick={() => setIsAssetRequestModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAssetReqTitle.trim()) return;
                createAssetRequestMutation.mutate({
                  title: newAssetReqTitle.trim(),
                  description: newAssetReqDesc.trim(),
                  dueDate: newAssetReqDueDate || null,
                  status: 'requested',
                });
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vector Brandmark SVG, Talent Model Release, High-Res Product Photos"
                  value={newAssetReqTitle}
                  onChange={(e) => setNewAssetReqTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Instructions / Specifications for Client
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain resolution requirements, acceptable file formats, or upload links..."
                  value={newAssetReqDesc}
                  onChange={(e) => setNewAssetReqDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-y"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Required By (Due Date)
                </label>
                <input
                  type="date"
                  value={newAssetReqDueDate}
                  onChange={(e) => setNewAssetReqDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAssetRequestModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAssetRequestMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{createAssetRequestMutation.isPending ? 'Sending...' : 'Dispatch Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
