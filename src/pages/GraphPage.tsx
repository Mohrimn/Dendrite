// ABOUTME: Graph visualization page for the knowledge scrapbook
// ABOUTME: Displays 3D force-directed graph of all scraps and connections

import { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout';
import {
  GraphCanvas,
  GraphControls,
  GraphLegend,
  type GraphCanvasHandle,
} from '@/components/graph';
import { useStore } from '@/store';
import { ScrapDetail, ScrapForm } from '@/components/scrap';
import { Modal } from '@/components/ui';
import { EmptyState, GraphIllustration } from '@/components/empty-states';
import type { ScrapType, CreateScrapInput } from '@/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks';

const TYPE_OPTIONS: { type: ScrapType; label: string; color: string }[] = [
  { type: 'thought', label: 'Thoughts', color: '#8b5cf6' },
  { type: 'link', label: 'Links', color: '#06b6d4' },
  { type: 'image', label: 'Images', color: '#f59e0b' },
  { type: 'snippet', label: 'Snippets', color: '#10b981' },
  { type: 'note', label: 'Notes', color: '#ec4899' },
];

export function GraphPage() {
  const navigate = useNavigate();
  const scraps = useStore((state) => state.scraps);
  const updateScrap = useStore((state) => state.updateScrap);
  const deleteScrap = useStore((state) => state.deleteScrap);
  const [selectedScrapId, setSelectedScrapId] = useState<string | null>(null);
  const [hoveredScrapId, setHoveredScrapId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ScrapType | null>(null);
  const [clusterFilter, setClusterFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const graphRef = useRef<GraphCanvasHandle>(null);
  const isMobile = useIsMobile();

  // Get unique clusters
  const clusters = useMemo(() => {
    const clusterMap = new Map<string, { id: string; count: number }>();
    for (const scrap of scraps) {
      if (scrap.clusterId) {
        const existing = clusterMap.get(scrap.clusterId);
        if (existing) {
          existing.count++;
        } else {
          clusterMap.set(scrap.clusterId, { id: scrap.clusterId, count: 1 });
        }
      }
    }
    return Array.from(clusterMap.values());
  }, [scraps]);

  // Filter scraps
  const filteredScraps = useMemo(() => {
    return scraps.filter((scrap) => {
      if (typeFilter && scrap.type !== typeFilter) return false;
      if (clusterFilter && scrap.clusterId !== clusterFilter) return false;
      return true;
    });
  }, [scraps, typeFilter, clusterFilter]);

  const hasFilters = typeFilter !== null || clusterFilter !== null;

  const selectedScrap = scraps.find((s) => s.id === selectedScrapId);
  const hoveredScrap = scraps.find((s) => s.id === hoveredScrapId);

  const handleNodeClick = useCallback((scrapId: string) => {
    const isDeselecting = selectedScrapId === scrapId;
    setSelectedScrapId(isDeselecting ? null : scrapId);

    // Zoom to the selected node
    if (!isDeselecting) {
      graphRef.current?.zoomToNode(scrapId);
    }
  }, [selectedScrapId]);

  const handleNodeHover = useCallback((scrapId: string | null) => {
    setHoveredScrapId(scrapId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedScrapId(null);
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleUpdateScrap = useCallback(
    async (data: CreateScrapInput) => {
      if (selectedScrap) {
        await updateScrap(selectedScrap.id, data);
        setIsEditModalOpen(false);
      }
    },
    [selectedScrap, updateScrap]
  );

  const handleDeleteScrap = useCallback(async () => {
    if (selectedScrap) {
      await deleteScrap(selectedScrap.id);
      setSelectedScrapId(null);
    }
  }, [selectedScrap, deleteScrap]);

  const handleZoomIn = useCallback(() => {
    graphRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    graphRef.current?.zoomOut();
  }, []);

  const handleResetView = useCallback(() => {
    graphRef.current?.resetView();
  }, []);

  const handleReheat = useCallback(() => {
    graphRef.current?.reheat();
  }, []);

  return (
    <>
      <Header title="Knowledge Graph" subtitle={isMobile ? undefined : 'Visualize your ideas'} />
      <div className={cn(
        'relative',
        isMobile ? 'h-[calc(100vh-56px-56px)]' : 'h-[calc(100vh-64px)]'
      )}>
        {scraps.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={<GraphIllustration />}
              title="No scraps to visualize"
              description="Your knowledge graph will appear here once you create some scraps. Start capturing your ideas!"
              action={{
                label: 'Create scraps',
                onClick: () => navigate('/'),
              }}
            />
          </div>
        ) : (
          <>
            <GraphCanvas
              ref={graphRef}
              scraps={filteredScraps}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              selectedNodeId={selectedScrapId}
            />

            {/* Controls */}
            <div className={cn(
              'absolute flex gap-2',
              isMobile ? 'top-2 right-2 flex-row-reverse' : 'top-4 right-4 flex-col'
            )}>
              <GraphControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetView={handleResetView}
                onReheat={handleReheat}
              />

              {/* Mobile filter toggle */}
              {isMobile && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'p-3 rounded-lg backdrop-blur-sm transition-colors',
                    showFilters || hasFilters
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800/90 text-slate-300'
                  )}
                  aria-label="Toggle filters"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  {hasFilters && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs">
                      !
                    </span>
                  )}
                </button>
              )}

              {/* Filter controls - always visible on desktop, collapsible on mobile */}
              {(!isMobile || showFilters) && (
                <div className={cn(
                  'bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 space-y-3',
                  isMobile && 'absolute top-14 right-0 z-10 min-w-[200px] max-w-[280px]'
                )}>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Filter
                  </div>

                  {/* Type filter */}
                  <div className="flex flex-wrap gap-1.5">
                    {TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.type}
                        onClick={() =>
                          setTypeFilter(typeFilter === option.type ? null : option.type)
                        }
                        className={cn(
                          'px-2.5 py-1.5 rounded text-xs font-medium transition-all touch-manipulation',
                          'min-h-[36px]',
                          typeFilter === option.type
                            ? 'text-white'
                            : 'text-slate-400 hover:text-slate-200 active:text-white'
                        )}
                        style={
                          typeFilter === option.type
                            ? { backgroundColor: option.color }
                            : undefined
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Cluster filter */}
                  {clusters.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-500">Clusters</div>
                      <div className="flex flex-wrap gap-1.5">
                        {clusters.map((cluster) => (
                          <button
                            key={cluster.id}
                            onClick={() =>
                              setClusterFilter(
                                clusterFilter === cluster.id ? null : cluster.id
                              )
                            }
                            className={cn(
                              'px-2.5 py-1.5 rounded text-xs font-medium transition-all touch-manipulation',
                              'min-h-[36px]',
                              clusterFilter === cluster.id
                                ? 'bg-violet-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 active:bg-slate-500'
                            )}
                          >
                            {cluster.id.slice(0, 8)}... ({cluster.count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear filters */}
                  {hasFilters && (
                    <button
                      onClick={() => {
                        setTypeFilter(null);
                        setClusterFilter(null);
                        if (isMobile) setShowFilters(false);
                      }}
                      className="w-full px-2.5 py-2 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors touch-manipulation"
                    >
                      Clear filters ({filteredScraps.length}/{scraps.length})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Legend - hide on mobile to save space */}
            {!isMobile && (
              <div className="absolute bottom-4 left-4">
                <GraphLegend />
              </div>
            )}

            {/* Tooltip for hovered node - not shown on mobile (no hover) */}
            {!isMobile && hoveredScrap && !selectedScrap && (
              <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">
                <p className="text-sm font-medium text-white">
                  {hoveredScrap.title}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {hoveredScrap.type}
                </p>
              </div>
            )}

            {/* Detail panel for selected node - bottom sheet on mobile, side panel on desktop */}
            {selectedScrap && (
              <div className={cn(
                'absolute bg-white shadow-xl overflow-auto',
                isMobile
                  ? 'inset-x-0 bottom-0 max-h-[60vh] rounded-t-2xl'
                  : 'top-4 left-4 w-96 max-h-[calc(100%-2rem)] rounded-lg'
              )}>
                {/* Mobile drag handle */}
                {isMobile && (
                  <div className="sticky top-0 flex justify-center py-3 bg-white border-b border-slate-100">
                    <div className="h-1 w-10 rounded-full bg-slate-300" />
                  </div>
                )}
                <ScrapDetail
                  scrap={selectedScrap}
                  onEdit={handleEdit}
                  onDelete={handleDeleteScrap}
                  onClose={handleCloseDetail}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen && !!selectedScrap}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Scrap"
        size="lg"
      >
        {selectedScrap && (
          <ScrapForm
            onSubmit={handleUpdateScrap}
            onCancel={() => setIsEditModalOpen(false)}
            initialData={selectedScrap}
          />
        )}
      </Modal>
    </>
  );
}
