import type { StateCreator } from 'zustand';
import type { Scrap, CreateScrapInput, UpdateScrapInput } from '@/types';
import { scrapRepository } from '@/db/repositories';
import { enrichScrap } from '@/services/enrichment';

export interface ScrapSlice {
  scraps: Scrap[];
  isLoading: boolean;
  selectedScrapId: string | null;
  loadScraps: () => Promise<void>;
  createScrap: (input: CreateScrapInput) => Promise<Scrap>;
  updateScrap: (id: string, updates: UpdateScrapInput) => Promise<void>;
  deleteScrap: (id: string) => Promise<void>;
  selectScrap: (id: string | null) => void;
  togglePin: (id: string) => Promise<void>;
  toggleReadStatus: (id: string) => Promise<void>;
  recordView: (id: string) => Promise<void>;
}

export const createScrapSlice: StateCreator<ScrapSlice> = (set, get) => ({
  scraps: [],
  isLoading: false,
  selectedScrapId: null,

  loadScraps: async () => {
    set({ isLoading: true });
    try {
      const scraps = await scrapRepository.getAll();
      set({ scraps, isLoading: false });
    } catch (error) {
      console.error('Failed to load scraps:', error);
      set({ isLoading: false });
    }
  },

  createScrap: async (input) => {
    // Enrich the scrap before saving
    const enriched = await enrichScrap(input);

    const scrapInput: CreateScrapInput = {
      ...input,
      type: enriched.type,
      title: enriched.title || input.title,
      content: enriched.content,
      url: enriched.url,
      tags: [...(input.tags || [])],
    };

    const scrap = await scrapRepository.create(scrapInput);

    // Add auto-generated tags and keywords
    const enrichedScrap: Scrap = {
      ...scrap,
      autoTags: enriched.autoTags,
      keywords: enriched.keywords,
    };

    // Update with enrichment data
    await scrapRepository.update(scrap.id, {
      autoTags: enriched.autoTags,
      keywords: enriched.keywords,
    });

    set((state) => ({ scraps: [enrichedScrap, ...state.scraps] }));
    return enrichedScrap;
  },

  updateScrap: async (id, updates) => {
    // Re-enrich if content changed
    if (updates.content || updates.title) {
      const currentScrap = get().scraps.find((s) => s.id === id);
      if (currentScrap) {
        const enriched = await enrichScrap({
          type: currentScrap.type,
          title: updates.title || currentScrap.title,
          content: updates.content || currentScrap.content,
          url: currentScrap.url,
        });
        updates = {
          ...updates,
          autoTags: enriched.autoTags,
          keywords: enriched.keywords,
        };
      }
    }

    await scrapRepository.update(id, updates);
    set((state) => ({
      scraps: state.scraps.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
      ),
    }));
  },

  deleteScrap: async (id) => {
    await scrapRepository.delete(id);
    set((state) => ({
      scraps: state.scraps.filter((s) => s.id !== id),
      selectedScrapId: state.selectedScrapId === id ? null : state.selectedScrapId,
    }));
  },

  selectScrap: (id) => set({ selectedScrapId: id }),

  togglePin: async (id) => {
    const scrap = get().scraps.find((s) => s.id === id);
    if (scrap) {
      await scrapRepository.togglePin(id);
      set((state) => ({
        scraps: state.scraps.map((s) =>
          s.id === id ? { ...s, isPinned: !s.isPinned } : s
        ),
      }));
    }
  },

  toggleReadStatus: async (id) => {
    const scrap = get().scraps.find((s) => s.id === id);
    if (scrap && scrap.type === 'link') {
      await scrapRepository.toggleReadStatus(id);
      set((state) => ({
        scraps: state.scraps.map((s) =>
          s.id === id
            ? { ...s, readStatus: s.readStatus === 'read' ? 'unread' : 'read' }
            : s
        ),
      }));
    }
  },

  recordView: async (id) => {
    await scrapRepository.recordView(id);
    set((state) => ({
      scraps: state.scraps.map((s) =>
        s.id === id
          ? { ...s, lastViewedAt: new Date(), viewCount: (s.viewCount || 0) + 1 }
          : s
      ),
    }));
  },
});
