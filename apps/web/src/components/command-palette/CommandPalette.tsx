'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Plus,
  X,
} from 'lucide-react';

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen, openQuickCreate } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    clients: any[];
    projects: any[];
    invoices: any[];
    tasks: any[];
    leads: any[];
  }>({ clients: [], projects: [], invoices: [], tasks: [], leads: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setQuery('');
      setResults({ clients: [], projects: [], invoices: [], tasks: [], leads: [] });
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const res = await api.search.query(query);
          setResults(res);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults({ clients: [], projects: [], invoices: [], tasks: [], leads: [] });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isCommandPaletteOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    if (isCommandPaletteOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (url: string) => {
    setCommandPaletteOpen(false);
    router.push(url);
  };

  const hasResults =
    results.clients.length > 0 ||
    results.projects.length > 0 ||
    results.invoices.length > 0 ||
    results.tasks.length > 0 ||
    results.leads.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-card rounded-lg border border-border shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border h-12 gap-3">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search clients, projects, invoices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions (when query is empty) */}
          {!query && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Navigation
              </div>
              <button
                onClick={() => navigateTo('/clients')}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Go to Clients</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">G C</span>
              </button>
              <button
                onClick={() => navigateTo('/projects')}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban className="w-4 h-4 text-muted-foreground" />
                  <span>Go to Projects</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">G P</span>
              </button>
              <button
                onClick={() => navigateTo('/invoices')}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-muted-foreground" />
                  <span>Go to Invoices</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">G I</span>
              </button>
              <button
                onClick={() => navigateTo('/tasks')}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                  <span>Go to Tasks</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">G T</span>
              </button>

              <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Create New
              </div>
              <button
                onClick={() => {
                  setCommandPaletteOpen(false);
                  openQuickCreate('invoice');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Create New Invoice</span>
              </button>
              <button
                onClick={() => {
                  setCommandPaletteOpen(false);
                  openQuickCreate('project');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Create New Project</span>
              </button>
            </div>
          )}

          {/* Search Results */}
          {query && (
            <>
              {isLoading && (
                <div className="py-8 text-center text-xs text-muted-foreground">Searching...</div>
              )}

              {!isLoading && !hasResults && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching results found for &ldquo;{query}&rdquo;
                </div>
              )}

              {results.clients.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Clients
                  </div>
                  {results.clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigateTo(`/clients/${c.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{c.name}</span>
                          {c.company && (
                            <span className="text-[10px] text-muted-foreground ml-2">
                              {c.company}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {results.projects.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Projects
                  </div>
                  {results.projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigateTo(`/projects/${p.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderKanban className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                            {p.code}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {results.invoices.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Invoices
                  </div>
                  {results.invoices.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => navigateTo(`/invoices`)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{i.invoiceNumber}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">
                            {i.title}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {results.tasks.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Tasks
                  </div>
                  {results.tasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigateTo(`/tasks`)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{t.title}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {results.leads.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Leads
                  </div>
                  {results.leads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => navigateTo(`/leads`)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-foreground hover:bg-muted text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{l.title}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
