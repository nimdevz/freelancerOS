'use client';

import React, { useState, useEffect } from 'react';
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
  Users,
  Target,
  FolderKanban,
  FileText,
  FileCheck2,
  Receipt,
  Bell,
  Clock,
  Menu,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function Header() {
  const queryClient = useQueryClient();
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
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
  } = useAppStore();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);

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
      {/* Global Search trigger & Mobile Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileDrawer}
          aria-label="Open mobile menu"
          className="p-1.5 md:hidden text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-md text-xs text-muted-foreground bg-muted/60 hover:bg-muted border border-border/80 transition-colors sm:w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="hidden sm:inline">Search anything...</span>
            <span className="sm:hidden text-[11px]">Search</span>
          </div>
          <kbd className="hidden sm:inline-block text-[10px] bg-background px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Stopwatch, + New, Notifications, Theme, Demo reset */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Live Stopwatch Tracker */}
        {isTimerRunning ? (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">{formatStopwatch(timerElapsedSeconds)}</span>
            <span className="hidden md:inline text-[10px] opacity-70 truncate max-w-[90px]">
              {timerProjectName || 'Project'}
            </span>
            <button
              onClick={handleStopActiveTimer}
              className="p-0.5 sm:p-1 hover:bg-white/20 dark:hover:bg-black/20 rounded transition-colors"
              title="Stop timer"
            >
              <Square className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openQuickCreate('project')}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors border border-border/60"
            title="Start time tracking"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timer</span>
          </button>
        )}

        {/* Quick + New Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          {isNewMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNewMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    openQuickCreate('client');
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Client</span>
                </button>
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    openQuickCreate('lead');
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <Target className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Lead</span>
                </button>
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    openQuickCreate('project');
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Project</span>
                </button>
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    openQuickCreate('proposal');
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Proposal</span>
                </button>
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    openQuickCreate('invoice');
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    openQuickCreate('expense');
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-muted text-foreground transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Expense</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Reset Demo Data button */}
        <button
          onClick={handleResetDemo}
          disabled={isResettingDemo}
          className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          title="Reset sample creative agency data (Nimish Studio)"
        >
          <RotateCcw className={`w-3 h-3 ${isResettingDemo ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}
