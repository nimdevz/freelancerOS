'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Target,
  FolderKanban,
  CheckSquare,
  PackageCheck,
  FileCheck2,
  Receipt,
  FileText,
  Timer,
  BarChart3,
  Calendar,
  Calculator,
  Settings,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

const NAVIGATION_GROUPS = [
  {
    title: 'Work',
    items: [
      { name: 'Projects', href: '/projects', icon: FolderKanban },
      { name: 'Tasks', href: '/tasks', icon: CheckSquare },
      { name: 'Deliverables', href: '/deliverables', icon: PackageCheck },
      { name: 'Calendar', href: '/calendar', icon: Calendar },
    ],
  },
  {
    title: 'Clients',
    items: [
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Leads', href: '/leads', icon: Target },
    ],
  },
  {
    title: 'Money',
    items: [
      { name: 'Invoices', href: '/invoices', icon: FileCheck2 },
      { name: 'Expenses', href: '/expenses', icon: Receipt },
    ],
  },
  {
    title: 'Business',
    items: [
      { name: 'Proposals', href: '/proposals', icon: FileText },
      { name: 'Time', href: '/time', icon: Timer },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Calculators', href: '/calculators', icon: Calculator },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const isSidebarCollapsed = useAppStore((s) => s.isSidebarCollapsed);
  const toggleSidebarCollapse = useAppStore((s) => s.toggleSidebarCollapse);
  const isDemoMode = useAppStore((s) => s.isDemoMode);

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
    <aside
      className={`hidden md:flex flex-col h-screen select-none shrink-0 sticky top-0 border-r border-border bg-card/70 backdrop-blur-md transition-all duration-200 z-20 ${
        isSidebarCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Workspace Brand Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0"
          title="FreelancerOS"
        >
          <div className="w-6 h-6 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0">
            F
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold tracking-tight leading-none text-foreground truncate">
                FreelancerOS
              </span>
              <span className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate flex items-center gap-1">
                {isDemoMode ? (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Demo Studio</span>
                ) : (
                  <span>Production</span>
                )}
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={toggleSidebarCollapse}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Dashboard link */}
        <div>
          <Link
            href="/dashboard"
            title="Dashboard"
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-neutral-100 text-foreground font-semibold dark:bg-neutral-800'
                : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50'
            } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </Link>
        </div>

        {/* Section Groups */}
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.title} className="space-y-0.5">
            {!isSidebarCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.name}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-foreground font-semibold dark:bg-neutral-800'
                      : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isSidebarCollapsed && isActive && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer: Settings & User Profile */}
      <div className="p-2 border-t border-border bg-card/60 space-y-1">
        {/* Settings button */}
        <Link
          href="/settings"
          title="Settings"
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
            pathname.startsWith('/settings')
              ? 'bg-neutral-100 text-foreground font-semibold dark:bg-neutral-800'
              : ''
          } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isSidebarCollapsed && <span>Settings</span>}
        </Link>

        {/* User Profile & Sign Out */}
        <div
          className={`pt-1 flex items-center ${
            isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-foreground shrink-0 overflow-hidden"
              title={displayName}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground leading-tight truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                  {roleName}
                </span>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-muted rounded transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
