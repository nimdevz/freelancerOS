'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  Search,
  Users,
  FolderKanban,
  FileCheck2,
  CheckSquare,
  Target,
  FileText,
  PackageCheck,
  Receipt,
  Clock,
  BarChart3,
  ArrowRight,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const isCommandPaletteOpen = useAppStore((s) => s.isCommandPaletteOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const openQuickCreate = useAppStore((s) => s.openQuickCreate);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    clients: any[];
    projects: any[];
    invoices: any[];
    tasks: any[];
    leads: any[];
    proposals: any[];
    deliverables: any[];
  }>({
    clients: [],
    projects: [],
    invoices: [],
    tasks: [],
    leads: [],
    proposals: [],
    deliverables: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Search API debounce
  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setQuery('');
      setResults({
        clients: [],
        projects: [],
        invoices: [],
        tasks: [],
        leads: [],
        proposals: [],
        deliverables: [],
      });
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const res = await api.search.query(query);
          setResults({
            clients: res.clients || [],
            projects: res.projects || [],
            invoices: res.invoices || [],
            tasks: res.tasks || [],
            leads: res.leads || [],
            proposals: res.proposals || [],
            deliverables: res.deliverables || [],
          });
          setSelectedIndex(0);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults({
          clients: [],
          projects: [],
          invoices: [],
          tasks: [],
          leads: [],
          proposals: [],
          deliverables: [],
        });
        setSelectedIndex(0);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query, isCommandPaletteOpen]);

  const navigateTo = (url: string) => {
    setCommandPaletteOpen(false);
    router.push(url);
  };

  const executeAction = (action: () => void) => {
    setCommandPaletteOpen(false);
    action();
  };

  // Build selectable items list based on state
  const items: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];

    if (!query.trim()) {
      // Direct Creation Actions (Requirement 6)
      list.push(
        {
          id: 'create-client',
          title: 'Create client',
          subtitle: 'Add new client to workspace',
          category: 'Actions',
          icon: Users,
          action: () => executeAction(() => openQuickCreate('client')),
        },
        {
          id: 'create-project',
          title: 'Create project',
          subtitle: 'Start project with budget & revisions',
          category: 'Actions',
          icon: FolderKanban,
          action: () => executeAction(() => openQuickCreate('project')),
        },
        {
          id: 'create-invoice',
          title: 'Create invoice',
          subtitle: 'Issue GST bill with payment instructions',
          category: 'Actions',
          icon: FileCheck2,
          action: () => executeAction(() => openQuickCreate('invoice')),
        },
        {
          id: 'create-proposal',
          title: 'Create proposal',
          subtitle: 'Pitch scope, deliverables & validity',
          category: 'Actions',
          icon: FileText,
          action: () => executeAction(() => openQuickCreate('proposal')),
        },
        {
          id: 'create-task',
          title: 'Create task',
          subtitle: 'Assign task item with deadline',
          category: 'Actions',
          icon: CheckSquare,
          action: () => executeAction(() => openQuickCreate('task')),
        },
        {
          id: 'log-time',
          title: 'Log time',
          subtitle: 'Record hours or start active timer',
          category: 'Actions',
          icon: Clock,
          action: () => executeAction(() => openQuickCreate('time')),
        },
        {
          id: 'add-expense',
          title: 'Add expense',
          subtitle: 'Record software, gear, or client cost',
          category: 'Actions',
          icon: Receipt,
          action: () => executeAction(() => openQuickCreate('expense')),
        },
      );

      // Quick Navigation
      list.push(
        {
          id: 'nav-dashboard',
          title: 'Dashboard',
          subtitle: 'Needs attention, cash snapshot & active work',
          category: 'Navigation',
          icon: BarChart3,
          action: () => navigateTo('/dashboard'),
          badge: 'G D',
        },
        {
          id: 'nav-projects',
          title: 'Projects',
          subtitle: 'Active projects, health & revision caps',
          category: 'Navigation',
          icon: FolderKanban,
          action: () => navigateTo('/projects'),
          badge: 'G P',
        },
        {
          id: 'nav-tasks',
          title: 'Tasks',
          subtitle: 'Kanban board & client-waiting list',
          category: 'Navigation',
          icon: CheckSquare,
          action: () => navigateTo('/tasks'),
          badge: 'G T',
        },
        {
          id: 'nav-deliverables',
          title: 'Deliverables',
          subtitle: 'Review links, versions & sign-offs',
          category: 'Navigation',
          icon: PackageCheck,
          action: () => navigateTo('/deliverables'),
        },
        {
          id: 'nav-clients',
          title: 'Clients',
          subtitle: 'Client directory & financial ledger',
          category: 'Navigation',
          icon: Users,
          action: () => navigateTo('/clients'),
          badge: 'G C',
        },
        {
          id: 'nav-invoices',
          title: 'Invoices',
          subtitle: 'Billing, overdue tracking & payment history',
          category: 'Navigation',
          icon: FileCheck2,
          action: () => navigateTo('/invoices'),
          badge: 'G I',
        },
        {
          id: 'nav-reports',
          title: 'Reports & Profit',
          subtitle: 'Effective hourly rate & unit economics',
          category: 'Navigation',
          icon: BarChart3,
          action: () => navigateTo('/reports'),
          badge: 'G R',
        },
      );
    } else {
      // 1. Clients
      results.clients.forEach((c) => {
        list.push({
          id: `client-${c.id}`,
          title: c.name,
          subtitle: c.company ? `${c.company} • ${c.email || ''}` : c.email,
          category: 'Clients',
          icon: Users,
          action: () => navigateTo(`/clients/${c.id}`),
        });
      });

      // 2. Projects
      results.projects.forEach((p) => {
        list.push({
          id: `proj-${p.id}`,
          title: p.name,
          subtitle: `${p.code} • ${p.clientName || 'Client'}`,
          category: 'Projects',
          icon: FolderKanban,
          action: () => navigateTo(`/projects/${p.id}`),
        });
      });

      // 3. Leads
      results.leads.forEach((l) => {
        list.push({
          id: `lead-${l.id}`,
          title: l.title,
          subtitle: `${l.clientName || ''} • Stage: ${l.stage}`,
          category: 'Leads',
          icon: Target,
          action: () => navigateTo('/leads'),
        });
      });

      // 4. Tasks
      results.tasks.forEach((t) => {
        list.push({
          id: `task-${t.id}`,
          title: t.title,
          subtitle: `${t.projectName || 'Project'} • ${t.status}`,
          category: 'Tasks',
          icon: CheckSquare,
          action: () => navigateTo('/tasks'),
        });
      });

      // 5. Proposals
      results.proposals.forEach((pr) => {
        list.push({
          id: `prop-${pr.id}`,
          title: pr.title,
          subtitle: `${pr.proposalNumber || 'Proposal'} • ${pr.clientName || ''}`,
          category: 'Proposals',
          icon: FileText,
          action: () => navigateTo('/proposals'),
        });
      });

      // 6. Invoices
      results.invoices.forEach((i) => {
        list.push({
          id: `inv-${i.id}`,
          title: i.invoiceNumber,
          subtitle: `${i.title} • ${i.clientName || ''}`,
          category: 'Invoices',
          icon: FileCheck2,
          action: () => navigateTo('/invoices'),
        });
      });

      // 7. Deliverables
      results.deliverables.forEach((d) => {
        list.push({
          id: `deliv-${d.id}`,
          title: d.title,
          subtitle: `Version ${d.currentVersion || 1} • ${d.status?.replace('_', ' ') || 'in review'}`,
          category: 'Deliverables',
          icon: PackageCheck,
          action: () => navigateTo('/deliverables'),
        });
      });
    }

    return list;
  }, [query, results]);

  // Handle Keyboard Navigation (ArrowUp, ArrowDown, Enter, ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items.length > 0 && items[selectedIndex]) {
          items[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, items, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isCommandPaletteOpen) return null;

  // Group items by category for visual sectioning
  const groupedItems = items.reduce((acc, item, index) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push({ ...item, globalIndex: index });
    return acc;
  }, {} as Record<string, Array<PaletteItem & { globalIndex: number }>>);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setCommandPaletteOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20 p-3 sm:px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100"
    >
      <div className="w-full max-w-xl bg-card rounded-lg sm:rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[520px]">
        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 sm:px-4 border-b border-border h-12 gap-2.5 sm:gap-3 shrink-0">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search clients, projects, invoices, tasks, or type an action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-base sm:text-xs text-foreground focus:outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground">
            ESC
          </kbd>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="sm:hidden text-xs text-muted-foreground hover:text-foreground px-1 py-0.5"
          >
            Cancel
          </button>
        </div>

        {/* Results Container */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-3">
          {isLoading && (
            <div className="py-8 text-center text-xs text-muted-foreground">Searching workspace...</div>
          )}

          {!isLoading && query && items.length === 0 && (
            <div className="py-10 text-center text-xs text-muted-foreground space-y-1">
              <p>No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] opacity-70">
                Try searching for a client name, project title, invoice number, or proposal.
              </p>
            </div>
          )}

          {!isLoading &&
            Object.entries(groupedItems).map(([category, catItems]) => (
              <div key={category} className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  {category}
                </div>
                {catItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = item.globalIndex === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      data-index={item.globalIndex}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-foreground font-medium ring-1 ring-border'
                          : 'text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="truncate">
                          <span className="truncate block font-medium leading-snug">{item.title}</span>
                          {item.subtitle && (
                            <span className="text-[10px] text-muted-foreground truncate block leading-snug">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {item.badge && (
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.2 rounded border border-border/80">
                            {item.badge}
                          </span>
                        )}
                        <ArrowRight className={`w-3 h-3 ${isSelected ? 'text-foreground' : 'text-muted-foreground/50'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="h-9 px-3 border-t border-border bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground font-mono select-none">
          <div className="flex items-center gap-2">
            <span>↑↓ navigate</span>
            <span>•</span>
            <span>↵ select</span>
            <span>•</span>
            <span>esc dismiss</span>
          </div>
          <span className="hidden sm:inline">7 Entity Universal Search</span>
        </div>
      </div>
    </div>
  );
}
