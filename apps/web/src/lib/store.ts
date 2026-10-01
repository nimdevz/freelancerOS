import { create } from 'zustand';
import { Organization } from '@freelanceros/types';

export type QuickCreateType = 'client' | 'lead' | 'project' | 'proposal' | 'invoice' | 'expense' | null;

interface AppState {
  // Command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Quick Create Modal
  quickCreateType: QuickCreateType;
  openQuickCreate: (type: QuickCreateType) => void;
  closeQuickCreate: () => void;

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

export const useAppStore = create<AppState>((set, get) => ({
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  quickCreateType: null,
  openQuickCreate: (type) => set({ quickCreateType: type }),
  closeQuickCreate: () => set({ quickCreateType: null }),

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
}));
