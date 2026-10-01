'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronRight,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    api.auth.logout();
    logout();
    router.push('/login');
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Nimish Prabhu';
  const roleName = user?.email || 'Video & Creative Lead';
  const initials = user
    ? `${(user.firstName || 'C')[0]}${(user.lastName || 'P')[0]}`.toUpperCase()
    : 'NP';

  return (
    <aside className="hidden md:flex w-64 border-r border-border bg-card/60 backdrop-blur-sm flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Workspace Brand Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
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
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          PRO
        </span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Dashboard link */}
        <div>
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-neutral-100 text-foreground font-semibold dark:bg-neutral-800'
                : 'text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Section Groups */}
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.title} className="space-y-0.5">
            <div className="px-2.5 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-foreground font-semibold dark:bg-neutral-800'
                      : 'text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User / Status */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-foreground shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-foreground leading-tight truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">{roleName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/settings"
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-muted rounded transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
