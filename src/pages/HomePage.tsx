import { useEffect, useCallback, useState, useMemo } from 'react';
import { Header } from '@/components/layout';
import { ScrapGrid, ScrapForm, ScrapDetail, FilterBar } from '@/components/scrap';
import { EmptyCollection } from '@/components/empty-states';
import { Modal } from '@/components/ui';
import { useStore, useScraps, useSelectedScrap, useIsLoading } from '@/store';
import type { CreateScrapInput, ScrapType } from '@/types';

export function HomePage() {
  const scraps = useScraps();
  const selectedScrap = useSelectedScrap();
  const isLoading = useIsLoading();
  const loadScraps = useStore((state) => state.loadScraps);
  const createScrap = useStore((state) => state.createScrap);
  const updateScrap = useStore((state) => state.updateScrap);
  const deleteScrap = useStore((state) => state.deleteScrap);
  const activeModal = useStore((state) => state.activeModal);
  const openModal = useStore((state) => state.openModal);
  const closeModal = useStore((state) => state.closeModal);
  const selectScrap = useStore((state) => state.selectScrap);

  // Filter state
  const [selectedType, setSelectedType] = useState<ScrapType | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadScraps();
  }, [loadScraps]);

  // Keyboard shortcut for quick capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openModal('create');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  const handleCreateScrap = useCallback(
    async (data: CreateScrapInput) => {
      await createScrap(data);
      closeModal();
    },
    [createScrap, closeModal]
  );

  const handleUpdateScrap = useCallback(
    async (data: CreateScrapInput) => {
      if (selectedScrap) {
        await updateScrap(selectedScrap.id, data);
        closeModal();
      }
    },
    [selectedScrap, updateScrap, closeModal]
  );

  const handleDeleteScrap = useCallback(async () => {
    if (selectedScrap) {
      await deleteScrap(selectedScrap.id);
      closeModal();
    }
  }, [selectedScrap, deleteScrap, closeModal]);

  const handleCloseDetail = useCallback(() => {
    selectScrap(null);
    closeModal();
  }, [selectScrap, closeModal]);

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag((current) => (current === tag ? null : tag));
  }, []);

  // Filter scraps
  const filteredScraps = useMemo(() => {
    return scraps.filter((scrap) => {
      if (selectedType && scrap.type !== selectedType) return false;
      if (selectedTag) {
        const allTags = [...scrap.tags, ...scrap.autoTags];
        if (!allTags.includes(selectedTag)) return false;
      }
      return true;
    });
  }, [scraps, selectedType, selectedTag]);

  const pinnedScraps = filteredScraps.filter((s) => s.isPinned);
  const otherScraps = filteredScraps.filter((s) => !s.isPinned);

  const subtitle = useMemo(() => {
    if (scraps.length === 0) return undefined;
    if (filteredScraps.length === scraps.length) {
      return `${scraps.length} items`;
    }
    return `${filteredScraps.length} of ${scraps.length} items`;
  }, [scraps.length, filteredScraps.length]);

  return (
    <>
      <Header title="Scraps" subtitle={subtitle} />

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          </div>
        ) : scraps.length === 0 ? (
          <EmptyCollection />
        ) : (
          <div className="space-y-6">
            {/* Filter bar */}
            <FilterBar
              scraps={scraps}
              selectedType={selectedType}
              selectedTag={selectedTag}
              onTypeChange={setSelectedType}
              onTagChange={setSelectedTag}
            />

            {/* Results */}
            {filteredScraps.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-500">No scraps match your filters</p>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setSelectedTag(null);
                  }}
                  className="mt-2 text-sm text-indigo-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Pinned scraps */}
                {pinnedScraps.length > 0 && (
                  <section>
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 17v5" />
                        <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76Z" />
                      </svg>
                      Pinned
                    </h2>
                    <ScrapGrid scraps={pinnedScraps} onTagClick={handleTagClick} />
                  </section>
                )}

                {/* All scraps */}
                <section>
                  {pinnedScraps.length > 0 && (
                    <h2 className="mb-4 text-sm font-medium text-slate-500">
                      All Scraps
                    </h2>
                  )}
                  <ScrapGrid scraps={otherScraps} onTagClick={handleTagClick} />
                </section>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={activeModal === 'create'}
        onClose={closeModal}
        title="Create Scrap"
        description="Capture a thought, link, snippet, or note"
        size="lg"
      >
        <ScrapForm onSubmit={handleCreateScrap} onCancel={closeModal} />
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={activeModal === 'detail' && !!selectedScrap}
        onClose={handleCloseDetail}
        size="lg"
      >
        {selectedScrap && (
          <ScrapDetail
            scrap={selectedScrap}
            onEdit={() => openModal('edit')}
            onDelete={handleDeleteScrap}
            onClose={handleCloseDetail}
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={activeModal === 'edit' && !!selectedScrap}
        onClose={closeModal}
        title="Edit Scrap"
        size="lg"
      >
        {selectedScrap && (
          <ScrapForm
            onSubmit={handleUpdateScrap}
            onCancel={closeModal}
            initialData={selectedScrap}
          />
        )}
      </Modal>
    </>
  );
}
