import type { StateCreator } from 'zustand';

export type ViewMode = 'grid' | 'list';
export type ModalType = 'create' | 'edit' | 'detail' | null;

export interface UISlice {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // For mobile drawer
  viewMode: ViewMode;
  activeModal: ModalType;
  searchOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleSearch: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  viewMode: 'grid',
  activeModal: null,
  searchOpen: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setViewMode: (mode) => set({ viewMode: mode }),

  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null }),

  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
});
