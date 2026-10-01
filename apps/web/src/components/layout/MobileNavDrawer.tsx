'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  Users,
  Target,
  FolderKanban,
  CheckSquare,
  FileText,
  ReceiptText,
  ScrollText,
  FileCheck2,
  CreditCard,
  Receipt,
  Timer,
  PackageCheck,
  Stamp,
  Repeat,
  BarChart3,
  Settings,
  ShieldCheck,
  X,
  Moon,
  Sun,
  ChevronRight,
} from 'lucide-react';

const NAVIGATION_GROUPS = [
  {
    title: 'Work',
    items: [
      { name: 'Leads', href: '/leads', icon: Target },
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Projects', href: '/projects', icon: FolderKanban },
      { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    ],
  },
  {
    title: 'Sales',
    items: [
      { name: 'Proposals', href: '/proposals', icon: FileText },
      { name: 'Quotes', href: '/quotes', icon: ReceiptText },
      { name: 'Contracts', href: '/contracts', icon: ScrollText },
    ],
  },
  {
    title: 'Money',
    items: [
      { name: 'Invoices', href: '/invoices', icon: FileCheck2 },
      { name: 'Payments', href: '/payments', icon: CreditCard },
      { name: 'Expenses', href: '/expenses', icon: Receipt },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Time Tracking', href: '/time', icon: Timer },
      { name: 'Deliverables', href: '/deliverables', icon: PackageCheck },
      { name: 'Approvals', href: '/approvals', icon: Stamp },
      { name: 'Retainers', href: '/retainers', icon: Repeat },
    ],
  },
  {
    title: 'Insights',
    items: [{ name: 'Reports & Profit', href: '/reports', icon: BarChart3 }],
  },
  {
    title: 'Settings',
    items: [
      { name: 'Workspace', href: '/settings', icon: Settings },
      { name: 'Billing', href: '/settings/billing', icon: ShieldCheck },
    ],
  },
];

export function MobileNavDrawer() {
  const pathname = usePathname();
  const {
    isMobileDrawerOpen,
    setMobileDrawerOpen,
    isDarkMode,
    toggleDarkMode,
  } = useAppStore();

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    if (isMobileDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen, setMobileDrawerOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  if (!isMobileDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setMobileDrawerOpen(false)}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-72 max-w-[85vw] bg-card border-r border-border shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4">
          <Link
            href="/dashboard"
            onClick={() => setMobileDrawerOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="w-6 h-6 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
              F
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight leading-none text-foreground">
                Nimish Studio
              </span>
              <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                FreelancerOS Pro
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close navigation"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Dashboard link */}
          <div>
            <Link
              href="/dashboard"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-neutral-100 text-foreground font-semibold dark:bg-neutral-800'
                  : 'text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Groups */}
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.title} className="space-y-0.5">
              <div className="px-3 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-neutral-100 text-foreground font-semibold dark:bg-neutral-800'
                        : 'text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer with Theme toggle & Profile */}
        <div className="p-3 border-t border-border bg-card/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium text-foreground">
              NP
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground leading-tight">
                Nimish Prabhu
              </span>
              <span className="text-[10px] text-muted-foreground">Studio Lead</span>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
