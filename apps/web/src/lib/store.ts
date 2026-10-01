import { create } from 'zustand';
import { Organization, User } from '@freelanceros/types';

export type QuickCreateType =
  | 'client'
  | 'lead'
  | 'project'
  | 'task'
  | 'proposal'
  | 'quote'
  | 'invoice'
  | 'expense'
  | 'time'
  | 'deliverable'
  | null;

interface AppState {
  // User & Auth
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Sidebar Collapse (Persisted)
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Universal New Menu
  isNewMenuOpen: boolean;
  setNewMenuOpen: (open: boolean) => void;

  // Command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Quick Create Modal
  quickCreateType: QuickCreateType;
  openQuickCreate: (type: QuickCreateType) => void;
  closeQuickCreate: () => void;

  // Mobile Navigation Drawer
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleMobileDrawer: () => void;

  // Active Timer
  isTimerRunning: boolean;
  timerElapsedSeconds: number;
  timerProjectId: string | null;
  timerProjectName: string | null;
  timerDescription: string | null;
  activeTimeEntryId: string | null;
  startTimer: (entry: { id: string; projectId: string; projectName?: string; description?: string }) => void;
  stopTimer: () => void;
  tickTimer: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Current Organization
  organization: Organization | null;
  setOrganization: (org: Organization) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  let initialUser: User | null = null;
  let initialSidebarCollapsed = false;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('freelanceros_current_user');
      if (stored) initialUser = JSON.parse(stored);
      initialSidebarCollapsed = localStorage.getItem('freelanceros_sidebar_collapsed') === 'true';
    } catch {}
  }

  return {
    user: initialUser,
    setUser: (user) => {
      if (typeof window !== 'undefined') {
        try {
          if (user) {
            localStorage.setItem('freelanceros_current_user', JSON.stringify(user));
          } else {
            localStorage.removeItem('freelanceros_current_user');
          }
        } catch {}
      }
      set({ user });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('freelanceros_current_user');
          localStorage.removeItem('freelanceros_auth_token');
        } catch {}
      }
      set({ user: null });
    },

    isSidebarCollapsed: initialSidebarCollapsed,
    toggleSidebarCollapse: () => {
      const next = !get().isSidebarCollapsed;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('freelanceros_sidebar_collapsed', String(next));
        } catch {}
      }
      set({ isSidebarCollapsed: next });
    },
    setSidebarCollapsed: (collapsed: boolean) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('freelanceros_sidebar_collapsed', String(collapsed));
        } catch {}
      }
      set({ isSidebarCollapsed: collapsed });
    },

    isNewMenuOpen: false,
    setNewMenuOpen: (open: boolean) => set({ isNewMenuOpen: open }),

    isCommandPaletteOpen: false,
    setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

    quickCreateType: null,
    openQuickCreate: (type) => set({ quickCreateType: type }),
    closeQuickCreate: () => set({ quickCreateType: null }),

  isMobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
  toggleMobileDrawer: () => set((state) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen })),

  isTimerRunning: false,
  timerElapsedSeconds: 0,
  timerProjectId: null,
  timerProjectName: null,
  timerDescription: null,
  activeTimeEntryId: null,

  startTimer: ({ id, projectId, projectName, description }) =>
    set({
      isTimerRunning: true,
      timerElapsedSeconds: 0,
      activeTimeEntryId: id,
      timerProjectId: projectId,
      timerProjectName: projectName || 'Project Session',
      timerDescription: description || 'Active Session',
    }),

  stopTimer: () =>
    set({
      isTimerRunning: false,
      timerElapsedSeconds: 0,
      activeTimeEntryId: null,
      timerProjectId: null,
      timerProjectName: null,
      timerDescription: null,
    }),

  tickTimer: () => set((state) => ({ timerElapsedSeconds: state.timerElapsedSeconds + 1 })),

  isDarkMode: false,
  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    if (typeof document !== 'undefined') {
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ isDarkMode: next });
  },

  organization: null,
  setOrganization: (org) => set({ organization: org }),
  };
});
