'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  Search,
  Plus,
  Play,
  Square,
  Moon,
  Sun,
  RotateCcw,
  Clock,
  Menu,
  Sparkles,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function getBreadcrumb(path: string) {
  if (path === '/dashboard') return { group: 'Home', title: 'Dashboard' };
  if (path.startsWith('/projects')) return { group: 'Work', title: 'Projects' };
  if (path.startsWith('/tasks')) return { group: 'Work', title: 'Tasks' };
  if (path.startsWith('/deliverables')) return { group: 'Work', title: 'Deliverables' };
  if (path.startsWith('/clients')) return { group: 'Clients', title: 'Clients' };
  if (path.startsWith('/leads')) return { group: 'Clients', title: 'Leads Pipeline' };
  if (path.startsWith('/invoices')) return { group: 'Money', title: 'Invoices' };
  if (path.startsWith('/expenses')) return { group: 'Money', title: 'Expenses' };
  if (path.startsWith('/proposals')) return { group: 'Business', title: 'Proposals' };
  if (path.startsWith('/time')) return { group: 'Business', title: 'Time Tracking' };
  if (path.startsWith('/reports')) return { group: 'Business', title: 'Reports & Profit' };
  if (path.startsWith('/settings')) return { group: 'Settings', title: 'Workspace' };
  return { group: 'FreelancerOS', title: 'Workspace' };
}

export function Header() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setNewMenuOpen,
    openQuickCreate,
    isDarkMode,
    toggleDarkMode,
    isTimerRunning,
    timerElapsedSeconds,
    timerProjectName,
    activeTimeEntryId,
    startTimer,
    stopTimer,
    tickTimer,
    toggleMobileDrawer,
    user,
  } = useAppStore();

  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const breadcrumb = getBreadcrumb(pathname);

  // Poll active timer on load
  const { data: activeTimerData } = useQuery({
    queryKey: ['activeTimer'],
    queryFn: () => api.time.getActiveTimer(),
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (activeTimerData && !isTimerRunning) {
      startTimer({
        id: activeTimerData.id,
        projectId: activeTimerData.projectId,
        projectName: activeTimerData.projectName,
        description: activeTimerData.description || 'Active Session',
      });
    }
  }, [activeTimerData]);

  // Tick stopwatch
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Keyboard shortcut listener: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatStopwatch = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
      seconds,
    ).padStart(2, '0')}`;
  };

  const handleStopActiveTimer = async () => {
    if (activeTimeEntryId) {
      try {
        await api.time.stopTimer(activeTimeEntryId);
        stopTimer();
        queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
        queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      } catch (err) {
        console.error('Failed to stop timer:', err);
      }
    } else {
      stopTimer();
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Reset workspace with realistic creative studio demo data (Nike, Acme, Northstar, INR currency)?')) {
      setIsResettingDemo(true);
      try {
        await api.seed.resetDemo();
        queryClient.invalidateQueries();
        window.location.reload();
      } catch (err) {
        alert('Failed to reset demo: ' + err);
      } finally {
        setIsResettingDemo(false);
      }
    }
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile drawer button & Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          onClick={toggleMobileDrawer}
          aria-label="Open navigation drawer"
          className="p-1.5 md:hidden text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-xs min-w-0">
          <span className="text-muted-foreground/80 hidden sm:inline font-medium">
            {breadcrumb.group}
          </span>
          <span className="text-muted-foreground/40 hidden sm:inline">/</span>
          <span className="font-semibold text-foreground tracking-tight truncate">
            {breadcrumb.title}
          </span>
        </div>
      </div>

      {/* Right Controls: Search, + New, Stopwatch, Reset Demo, Theme */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search trigger button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-md text-xs text-muted-foreground bg-muted/50 hover:bg-muted border border-border/70 transition-colors sm:w-56 justify-between"
          title="Search anything (Cmd+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="hidden sm:inline text-muted-foreground">Search or jump to...</span>
            <span className="sm:hidden text-[11px]">Search</span>
          </div>
          <kbd className="hidden sm:inline-block text-[10px] bg-background px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Global + New Button (Universal Creation Menu) */}
        <button
          onClick={() => setNewMenuOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md text-xs font-medium transition-colors shadow-xs"
          title="Create new item (Press N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
          <kbd className="hidden sm:inline-block text-[10px] bg-white/20 dark:bg-black/20 px-1 py-0.2 rounded font-mono">
            N
          </kbd>
        </button>

        {/* Live Stopwatch Tracker */}
        {isTimerRunning ? (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">
              {formatStopwatch(timerElapsedSeconds)}
            </span>
            <span className="hidden lg:inline text-[10px] opacity-70 truncate max-w-[80px]">
              {timerProjectName || 'Timer'}
            </span>
            <button
              onClick={handleStopActiveTimer}
              className="p-0.5 hover:bg-white/20 dark:hover:bg-black/20 rounded transition-colors"
              title="Stop timer"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openQuickCreate('time')}
            className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors border border-border/60"
            title="Log time or start timer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timer</span>
          </button>
        )}

        {/* Reset Demo Data trigger */}
        <button
          onClick={handleResetDemo}
          disabled={isResettingDemo}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors border border-dashed border-border/80"
          title="Restore realistic demo data"
        >
          <RotateCcw className={`w-3 h-3 ${isResettingDemo ? 'animate-spin' : ''}`} />
          <span>Demo Data</span>
        </button>

        {/* Theme mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
