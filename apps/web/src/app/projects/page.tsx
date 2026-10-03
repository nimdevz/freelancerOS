'use client';

import React, { useState, useDeferredValue } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@freelanceros/ui';
import {
  FolderKanban,
  Plus,
  Search,
  ChevronRight,
  ArrowUpRight,
  Download,
  Sparkles,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Clock,
  Film,
  Code2,
  Palette,
  RefreshCw,
  Check,
  Trash2,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { exportProjectsToCsv } from '@/lib/csv-export';
import { ClientSelector } from '@/components/common/ClientSelector';
import {
  CustomDetailsSection,
  CustomFieldItem,
  formatCustomDetailsSummary,
} from '@/components/common/CustomDetailsSection';

interface ProjectTemplatePreset {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  budget: number;
  currency: 'INR' | 'USD';
  includedRevisions: number;
  durationDays: number;
  description: string;
  milestones: Array<{
    name: string;
    description: string;
    daysOffset: number;
    paymentAmount: number;
  }>;
  tasks: Array<{
    title: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    subtasks: string[];
  }>;
}

const PROJECT_TEMPLATES: ProjectTemplatePreset[] = [
  {
    id: 'commercial-video',
    name: 'Commercial Video Campaign',
    category: 'Commercial Video & Film',
    icon: Film,
    budget: 450000,
    currency: 'INR',
    includedRevisions: 2,
    durationDays: 30,
    description:
      'Full-lifecycle commercial production: creative treatment, principal shoot, offline edit, color grade, and 4K ProRes mastering.',
    milestones: [
      {
        name: 'Phase 1: Creative Treatment & Call Sheet',
        description: 'Script breakdown, moodboard treatment, and talent/location scheduling.',
        daysOffset: 7,
        paymentAmount: 100000,
      },
      {
        name: 'Phase 2: Principal Photography & Dailies',
        description: 'Shoot execution, dual-card backup, and raw footage log delivery.',
        daysOffset: 14,
        paymentAmount: 150000,
      },
      {
        name: 'Phase 3: Director Cut & Sound Design',
        description: 'Offline edit assembly, dialog cleanup, and original score sync.',
        daysOffset: 21,
        paymentAmount: 100000,
      },
      {
        name: 'Phase 4: Color Grade & Broadcast Delivery',
        description: 'DaVinci color master, client signoff, and 4K ProRes deliverables.',
        daysOffset: 30,
        paymentAmount: 100000,
      },
    ],
    tasks: [
      {
        title: 'Script breakdown & storyboard animatic',
        priority: 'high',
        subtasks: ['Visual shotlist', 'Lighting references', 'Voiceover timing'],
      },
      {
        title: 'Location filming permits & tech scout',
        priority: 'urgent',
        subtasks: ['Site survey', 'Power & audio check', 'Talent releases'],
      },
      {
        title: 'Rough assembly cut & audio sync',
        priority: 'high',
        subtasks: ['Dual-card ingest', 'Timecode sync', 'Assembly rough cut'],
      },
      {
        title: 'DaVinci Resolve color grading & LUT matching',
        priority: 'high',
        subtasks: ['Primary exposure balance', 'Skin tone conform', 'Brand palette LUT'],
      },
      {
        title: 'Final ProRes 422HQ master export & client handoff',
        priority: 'urgent',
        subtasks: ['16:9 4K master', '9:16 vertical cuts', 'Cloudflare R2 archival'],
      },
    ],
  },
  {
    id: 'fullstack-web-mvp',
    name: 'Full-Stack Web App MVP',
    category: 'Software Engineering',
    icon: Code2,
    budget: 320000,
    currency: 'INR',
    includedRevisions: 3,
    durationDays: 30,
    description:
      'High-performance serverless web application powered by Next.js, Cloudflare Workers, Hono, Drizzle, and Turso libSQL.',
    milestones: [
      {
        name: 'Sprint 1: Architecture & Data Schema',
        description: 'Drizzle schema models, libSQL migrations, and system architecture signoff.',
        daysOffset: 7,
        paymentAmount: 80000,
      },
      {
        name: 'Sprint 2: Serverless Workers API & Auth',
        description: 'Cloudflare Worker Hono endpoints, JWT session auth, and CRUD handlers.',
        daysOffset: 14,
        paymentAmount: 100000,
      },
      {
        name: 'Sprint 3: Next.js Frontend & State Flow',
        description: 'Responsive React views, TanStack Query integration, and dark mode.',
        daysOffset: 21,
        paymentAmount: 80000,
      },
      {
        name: 'Sprint 4: End-to-End QA, Deploy & Handoff',
        description: 'Static export optimization, Cloudflare Pages DNS, and documentation.',
        daysOffset: 30,
        paymentAmount: 60000,
      },
    ],
    tasks: [
      {
        title: 'Drizzle ORM schema definition & migrations',
        priority: 'high',
        subtasks: ['Workspace isolation checks', 'Indexes on foreign keys', 'Migration run'],
      },
      {
        title: 'Hono API endpoints & auth verification',
        priority: 'urgent',
        subtasks: ['Bearer token parser', 'CORS origin validation', 'Error handling middleware'],
      },
      {
        title: 'Interactive UI components & forms',
        priority: 'high',
        subtasks: ['Dashboard summary stats', 'Data table sorting & search', 'Modal form validation'],
      },
      {
        title: 'Performance audit & client test run',
        priority: 'medium',
        subtasks: ['Lighthouse 95+ score', 'Mobile touch targets', 'Fallback storage checks'],
      },
      {
        title: 'Production domain configuration & live launch',
        priority: 'urgent',
        subtasks: ['Cloudflare Pages routing', 'Custom DNS apex records', 'Post-launch verification'],
      },
    ],
  },
  {
    id: 'brand-identity',
    name: 'Brand Identity & Visual System',
    category: 'Branding & Design',
    icon: Palette,
    budget: 180000,
    currency: 'INR',
    includedRevisions: 2,
    durationDays: 25,
    description:
      'Comprehensive brand identity: vector logomarks, typography system, accessible color tokens, and corporate guidelines book.',
    milestones: [
      {
        name: 'Phase 1: Discovery & Moodboard Direction',
        description: 'Brand strategy session, competitor audit, and 2 visual moodboards.',
        daysOffset: 6,
        paymentAmount: 50000,
      },
      {
        name: 'Phase 2: Logomark Exploration & Concepts',
        description: '3 distinct core mark concepts with typography pairings.',
        daysOffset: 12,
        paymentAmount: 60000,
      },
      {
        name: 'Phase 3: Color Tokens & Brand Collateral',
        description: 'Digital & print color systems, typography scale, and social kits.',
        daysOffset: 18,
        paymentAmount: 40000,
      },
      {
        name: 'Phase 4: Vector Asset Kit & Guidelines PDF',
        description: 'Master SVG/EPS exports, favicons, and 30-page brand guidelines.',
        daysOffset: 25,
        paymentAmount: 30000,
      },
    ],
    tasks: [
      {
        title: 'Discovery stakeholder interview & visual audit',
        priority: 'high',
        subtasks: ['Core value pillars', 'Target demographic breakdown', 'Competitor benchmarking'],
      },
      {
        title: 'Vector logomark exploration & badge design',
        priority: 'urgent',
        subtasks: ['Primary horizontal mark', 'Secondary square monogram', 'Favicon & app icon'],
      },
      {
        title: 'Typography pairings & color accessibility audit',
        priority: 'high',
        subtasks: ['Display & body web fonts', 'WCAG AAA contrast check', 'Hex, RGB & CMYK specs'],
      },
      {
        title: 'Social media collateral & business templates',
        priority: 'medium',
        subtasks: ['LinkedIn / X banner templates', 'Keynote pitch deck master', 'Email signature HTML'],
      },
      {
        title: 'Brand guidelines documentation & asset packaging',
        priority: 'high',
        subtasks: ['PDF guidelines generation', 'Zip asset bundle for client', 'R2 secure share link'],
      },
    ],
  },
  {
    id: 'creative-retainer',
    name: 'Monthly Creative Retainer',
    category: 'Ongoing Retainer',
    icon: RefreshCw,
    budget: 100000,
    currency: 'INR',
    includedRevisions: 1,
    durationDays: 30,
    description:
      'Dedicated monthly capacity: 30 billable hours per cycle covering design sprints, feature updates, and expedited turnarounds.',
    milestones: [
      {
        name: 'Cycle Kickoff & Backlog Prioritization',
        description: 'Monthly scope agreement, task backlog review, and sprint allocation.',
        daysOffset: 5,
        paymentAmount: 50000,
      },
      {
        name: 'Mid-Cycle Delivery & Sprint Review',
        description: 'Interim deliverables review, revision turnaround, and hours check-in.',
        daysOffset: 15,
        paymentAmount: 25000,
      },
      {
        name: 'Cycle Closeout & Retainer Reconciliation',
        description: 'Completed sprint signoff, hours reconciliation, and next cycle roadmap.',
        daysOffset: 30,
        paymentAmount: 25000,
      },
    ],
    tasks: [
      {
        title: 'Monthly backlog grooming & ticket estimation',
        priority: 'medium',
        subtasks: ['Client priorities review', 'Time estimate allocation', 'Sprint commit signoff'],
      },
      {
        title: 'Sprint deliverables execution & testing',
        priority: 'high',
        subtasks: ['Design updates', 'Asset exports', 'Code reviews'],
      },
      {
        title: 'Bi-weekly client sync & progress demo',
        priority: 'medium',
        subtasks: ['Staging demo review', 'Feedback capture', 'Action item log'],
      },
      {
        title: 'Hours audit & monthly retainer reconciliation',
        priority: 'high',
        subtasks: ['Logged time breakdown', 'Remaining hours report', 'Next invoice generation'],
      },
    ],
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const openQuickCreate = useAppStore((s) => s.openQuickCreate);
  const [filter, setFilter] = useState<'all' | 'active' | 'review' | 'completed' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);

  // Project Templates Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(PROJECT_TEMPLATES[0].id);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [customProjectName, setCustomProjectName] = useState('');
  const [customBudget, setCustomBudget] = useState<number | ''>('');
  const [customDeadline, setCustomDeadline] = useState('');
  const [customCurrency, setCustomCurrency] = useState<'INR' | 'USD'>('INR');
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [customNotes, setCustomNotes] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.list(),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const selectedTemplate = PROJECT_TEMPLATES.find((t) => t.id === selectedTemplateId) || PROJECT_TEMPLATES[0];

  // Open Template Modal with prefilled defaults
  const handleOpenTemplateModal = (template?: ProjectTemplatePreset) => {
    const tmpl = template || PROJECT_TEMPLATES[0];
    setSelectedTemplateId(tmpl.id);
    const targetClient = clients[0];
    setSelectedClientId(targetClient ? targetClient.id : '');
    setCustomProjectName(targetClient ? `${targetClient.name} — ${tmpl.name}` : tmpl.name);
    setCustomBudget(tmpl.budget);
    setCustomCurrency(tmpl.currency);
    const defaultDueDate = new Date(Date.now() + tmpl.durationDays * 86400000).toISOString().split('T')[0];
    setCustomDeadline(defaultDueDate);
    setCustomFields([]);
    setCustomNotes('');
    setIsTemplateModalOpen(true);
  };

  // Deploy Project from Template Mutation
  const deployTemplateMutation = useMutation({
    mutationFn: async () => {
      const tmpl = selectedTemplate;
      const targetClient = clients.find((c) => c.id === selectedClientId) || clients[0];
      const finalName = customProjectName.trim() || `${targetClient?.name || 'Client'} — ${tmpl.name}`;
      const finalBudget = typeof customBudget === 'number' ? customBudget : tmpl.budget;
      const finalDeadline = customDeadline || new Date(Date.now() + tmpl.durationDays * 86400000).toISOString().split('T')[0];
      const customDetails = formatCustomDetailsSummary(customFields, customNotes);
      const finalDescription = customDetails
        ? `${tmpl.description}\n\n${customDetails}`
        : tmpl.description;

      // 1. Create Base Project
      const newProject = await api.projects.create({
        name: finalName,
        clientId: targetClient?.id || '',
        budget: finalBudget,
        currency: customCurrency,
        deadline: finalDeadline,
        includedRevisions: tmpl.includedRevisions,
        description: finalDescription,
        notes: customDetails || undefined,
      });

      // 2. Create Milestones
      for (let i = 0; i < tmpl.milestones.length; i++) {
        const m = tmpl.milestones[i];
        const mDueDate = new Date(Date.now() + m.daysOffset * 86400000).toISOString().split('T')[0];
        try {
          await api.milestones.create({
            projectId: newProject.id,
            name: m.name,
            description: m.description,
            dueDate: mDueDate,
            paymentAmount: m.paymentAmount,
            orderIndex: i + 1,
            status: 'pending',
          });
        } catch {
          // ignore individual milestone errors if fallback succeeds
        }
      }

      // 3. Create Structured Tasks
      for (let i = 0; i < tmpl.tasks.length; i++) {
        const t = tmpl.tasks[i];
        try {
          await api.tasks.create({
            projectId: newProject.id,
            title: t.title,
            priority: t.priority,
            status: 'todo',
            dueDate: finalDeadline,
            subtasks: t.subtasks.map((st, idx) => ({
              id: `st-${Date.now()}-${idx}`,
              title: st,
              completed: false,
            })),
          });
        } catch {
          // ignore individual task creation errors
        }
      }

      return newProject;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsTemplateModalOpen(false);
      if (newProject?.id) {
        router.push(`/projects/${newProject.id}`);
      }
    },
    onError: (err: any) => {
      alert(err.message || 'Error deploying project from template');
    },
  });

  const filteredProjects = projects
    .filter((p) => {
      if (filter === 'active') return p.status === 'active';
      if (filter === 'review') return p.status === 'review';
      if (filter === 'completed') return p.status === 'completed';
      if (filter === 'archived') return p.status === 'archived';
      return p.status !== 'archived';
    })
    .filter(
      (p) =>
        p.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(deferredSearch.toLowerCase()),
    );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Projects</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track deliverables, milestones, client reviews, revision limits, and profitability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportProjectsToCsv(projects)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleOpenTemplateModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-card hover:bg-muted rounded-md transition-colors border border-border shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Use Template</span>
            </button>
            <button
              onClick={() => openQuickCreate('project')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['all', 'active', 'review', 'completed', 'archived'] as const).map((tab) => (
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
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState
                        compact
                        icon={FolderKanban}
                        title={searchTerm || filter !== 'all' ? 'No projects matching filter' : 'No projects yet'}
                        description="Projects keep client deliverables organized, revisions bounded, and billable hours on track."
                        primaryAction={{
                          label: 'Use Ready Template',
                          onClick: () => handleOpenTemplateModal(),
                          icon: Sparkles,
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
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete project "${p.name}"?`)) {
                              deleteProjectMutation.mutate(p.id);
                            }
                          }}
                          title="Delete Project"
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors inline-flex items-center justify-center"
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
      </div>

      {/* Project Templates Deployment Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Create Project from Template</h3>
                  <p className="text-xs text-muted-foreground">
                    Instant full-lifecycle setup with pre-configured milestones, tasks, and revision bounds.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Two-column grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Left Column: Preset Templates Selection */}
              <div className="md:col-span-5 p-4 sm:p-5 space-y-3 bg-muted/10 overflow-y-auto max-h-[70vh]">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Select Workflow Template
                </div>
                {PROJECT_TEMPLATES.map((tmpl) => {
                  const IconComp = tmpl.icon;
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setSelectedTemplateId(tmpl.id);
                        const targetClient = clients.find((c) => c.id === selectedClientId) || clients[0];
                        setCustomProjectName(targetClient ? `${targetClient.name} — ${tmpl.name}` : tmpl.name);
                        setCustomBudget(tmpl.budget);
                        setCustomCurrency(tmpl.currency);
                        setCustomDeadline(new Date(Date.now() + tmpl.durationDays * 86400000).toISOString().split('T')[0]);
                      }}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-background dark:border-white shadow-sm ring-1 ring-foreground/10'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                          <IconComp className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>{tmpl.name}</span>
                        </div>
                        {isSelected && (
                          <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-border/60 text-[10px] text-muted-foreground font-mono">
                        <span>{formatCurrency(tmpl.budget, tmpl.currency)}</span>
                        <span>•</span>
                        <span>{tmpl.includedRevisions} Revisions</span>
                        <span>•</span>
                        <span>{tmpl.milestones.length} Milestones</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Configuration & Preview */}
              <div className="md:col-span-7 p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                <div className="space-y-3">
                  <ClientSelector
                    value={selectedClientId}
                    onChange={(newClientId, c) => {
                      setSelectedClientId(newClientId);
                      if (c) {
                        setCustomProjectName(`${c.name} — ${selectedTemplate.name}`);
                      }
                    }}
                    label="Target Client"
                    required
                  />

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Project Name *</label>
                    <input
                      type="text"
                      value={customProjectName}
                      onChange={(e) => setCustomProjectName(e.target.value)}
                      placeholder="e.g. Nike — Commercial Video Campaign"
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Currency</label>
                      <select
                        value={customCurrency}
                        onChange={(e) => setCustomCurrency(e.target.value as 'INR' | 'USD')}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Budget</label>
                      <input
                        type="number"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Target Deadline</label>
                      <input
                        type="date"
                        value={customDeadline}
                        onChange={(e) => setCustomDeadline(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                  </div>

                  {/* Custom Details & Specifications */}
                  <CustomDetailsSection
                    fields={customFields}
                    onChange={setCustomFields}
                    notes={customNotes}
                    onNotesChange={setCustomNotes}
                    title="Custom Project Details & Specifications"
                    buttonLabel="+ Add Custom Detail / Spec"
                  />
                </div>

                {/* Pre-packaged Milestones & Tasks Preview */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Included Milestones ({selectedTemplate.milestones.length})</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatCurrency(
                        selectedTemplate.milestones.reduce((acc, m) => acc + m.paymentAmount, 0),
                        customCurrency,
                      )}{' '}
                      total
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedTemplate.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-md bg-muted/30 border border-border flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-medium text-foreground">{m.name}</div>
                            <div className="text-[10px] text-muted-foreground line-clamp-1">{m.description}</div>
                          </div>
                        </div>
                        <div className="text-right font-mono text-[11px] text-muted-foreground shrink-0 pl-2">
                          {formatCurrency(m.paymentAmount, customCurrency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Ready Task Structure ({selectedTemplate.tasks.length} tasks)</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {selectedTemplate.includedRevisions} Revisions Bound
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTemplate.tasks.slice(0, 4).map((t, idx) => (
                      <div key={idx} className="p-2 rounded bg-muted/20 border border-border/80 text-[11px]">
                        <div className="font-medium text-foreground truncate">{t.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {t.subtasks.length} subtasks included
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between bg-muted/20">
              <div className="text-xs text-muted-foreground">
                Auto-generates milestones, tasks, and initial scope schedule.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deployTemplateMutation.mutate()}
                  disabled={deployTemplateMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md transition-colors shadow-sm disabled:opacity-50"
                >
                  {deployTemplateMutation.isPending ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Deploying Project...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Deploy from Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
