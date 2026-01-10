// ABOUTME: Zustand slice for smart view state management
// ABOUTME: Handles loading, creating, and selecting saved filters

import type { StateCreator } from 'zustand';
import type { SmartView, CreateSmartViewInput } from '@/types';
import { smartViewRepository } from '@/db/repositories';

export interface SmartViewSlice {
  smartViews: SmartView[];
  activeSmartViewId: string | null;
  loadSmartViews: () => Promise<void>;
  createSmartView: (input: CreateSmartViewInput) => Promise<SmartView>;
  deleteSmartView: (id: string) => Promise<void>;
  setActiveSmartView: (id: string | null) => void;
}

export const createSmartViewSlice: StateCreator<SmartViewSlice> = (set) => ({
  smartViews: [],
  activeSmartViewId: null,

  loadSmartViews: async () => {
    const smartViews = await smartViewRepository.getAll();
    set({ smartViews });
  },

  createSmartView: async (input) => {
    const smartView = await smartViewRepository.create(input);
    set((state) => ({
      smartViews: [...state.smartViews, smartView].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }));
    return smartView;
  },

  deleteSmartView: async (id) => {
    await smartViewRepository.delete(id);
    set((state) => ({
      smartViews: state.smartViews.filter((sv) => sv.id !== id),
      activeSmartViewId: state.activeSmartViewId === id ? null : state.activeSmartViewId,
    }));
  },

  setActiveSmartView: (id) => set({ activeSmartViewId: id }),
});
