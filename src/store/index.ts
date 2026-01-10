import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createScrapSlice, type ScrapSlice } from './slices/scrapSlice';
import { createUISlice, type UISlice } from './slices/uiSlice';
import { createSmartViewSlice, type SmartViewSlice } from './slices/smartViewSlice';

export type StoreState = ScrapSlice & UISlice & SmartViewSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...args) => ({
        ...createScrapSlice(...args),
        ...createUISlice(...args),
        ...createSmartViewSlice(...args),
      }),
      {
        name: 'knowledge-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          viewMode: state.viewMode,
        }),
      }
    ),
    { name: 'KnowledgeScrapbook' }
  )
);

// Selectors
export const useScraps = () => useStore((state) => state.scraps);
export const useScrapById = (id: string) =>
  useStore((state) => state.scraps.find((s) => s.id === id));
export const usePinnedScraps = () =>
  useStore((state) => state.scraps.filter((s) => s.isPinned));
export const useIsLoading = () => useStore((state) => state.isLoading);
export const useSelectedScrap = () =>
  useStore((state) =>
    state.selectedScrapId
      ? state.scraps.find((s) => s.id === state.selectedScrapId)
      : null
  );
export const useSmartViews = () => useStore((state) => state.smartViews);
export const useActiveSmartView = () =>
  useStore((state) =>
    state.activeSmartViewId
      ? state.smartViews.find((sv) => sv.id === state.activeSmartViewId)
      : null
  );
