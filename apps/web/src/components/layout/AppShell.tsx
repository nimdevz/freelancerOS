'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { GlobalNewMenu } from './GlobalNewMenu';

const MobileNavDrawer = dynamic(
  () => import('./MobileNavDrawer').then((m) => m.MobileNavDrawer),
  { ssr: false }
);

const CommandPalette = dynamic(
  () => import('../command-palette/CommandPalette').then((m) => m.CommandPalette),
  { ssr: false }
);

const QuickCreateModal = dynamic(
  () => import('../modals/QuickCreateModal').then((m) => m.QuickCreateModal),
  { ssr: false }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Slide-over Drawer for Phone Devices */}
      <MobileNavDrawer />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-20 md:pb-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Fixed Bottom Navigation for Phone Devices */}
      <BottomNav />

      {/* Global Interactive Overlays */}
      <CommandPalette />
      <QuickCreateModal />
      <GlobalNewMenu />
    </div>
  );
}
