'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  CheckSquare,
  Menu,
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const isMobileDrawerOpen = useAppStore((s) => s.isMobileDrawerOpen);
  const toggleMobileDrawer = useAppStore((s) => s.toggleMobileDrawer);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Invoices', href: '/invoices', icon: FileCheck2 },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around h-14 md:hidden px-2 select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
              isActive
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={toggleMobileDrawer}
        aria-label="Toggle mobile menu"
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          isMobileDrawerOpen
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Menu className="w-4 h-4" />
        <span className="text-[10px] mt-0.5 tracking-tight">More</span>
      </button>
    </nav>
  );
}
