'use client';

import React, { useState } from 'react';
import { Sparkles, Plus, LucideIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  compact = false,
  className = '',
}: EmptyStateProps) {
  const queryClient = useQueryClient();
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const setDemoMode = useAppStore((s) => s.setDemoMode);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const handleExploreDemo = async () => {
    if (secondaryAction?.onClick) {
      secondaryAction.onClick();
      return;
    }

    setIsLoadingDemo(true);
    try {
      await api.seed.enterDemo();
      setDemoMode(true);
      queryClient.invalidateQueries();
      window.location.reload();
    } catch (err) {
      console.error('Failed to load demo:', err);
      alert('Could not load demo workspace: ' + err);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const PrimaryIcon = primaryAction?.icon || Plus;

  if (compact) {
    return (
      <div className={`py-10 px-4 text-center select-none ${className}`}>
        <div className="w-10 h-10 rounded-full bg-muted/70 mx-auto mb-3 flex items-center justify-center text-muted-foreground border border-border/80">
          <Icon className="w-5 h-5 opacity-70" />
        </div>
        <h3 className="text-xs font-semibold text-foreground tracking-tight">{title}</h3>
        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-md inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <PrimaryIcon className="w-3.5 h-3.5" />
              <span>{primaryAction.label}</span>
            </button>
          )}
          {!isDemoMode && (
            <button
              onClick={handleExploreDemo}
              disabled={isLoadingDemo}
              className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md inline-flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isLoadingDemo ? 'Loading...' : (secondaryAction?.label || 'Explore Demo Workspace')}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border border-border/80 rounded-xl bg-card p-8 sm:p-12 text-center select-none shadow-xs ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 mx-auto mb-4 flex items-center justify-center text-foreground border border-border">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1.5 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="px-3.5 py-2 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-md inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <PrimaryIcon className="w-3.5 h-3.5" />
            <span>{primaryAction.label}</span>
          </button>
        )}

        {!isDemoMode && (
          <button
            onClick={handleExploreDemo}
            disabled={isLoadingDemo}
            className="px-3.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isLoadingDemo ? 'Loading...' : (secondaryAction?.label || 'Explore Demo Workspace')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
