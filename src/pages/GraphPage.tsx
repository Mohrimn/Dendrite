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
import { ScrapDetail } from '@/components/scrap';
import { EmptyState, GraphIllustration } from '@/components/empty-states';
import type { ScrapType } from '@/types';
import { cn } from '@/lib/utils';

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
  const [selectedScrapId, setSelectedScrapId] = useState<string | null>(null);
  const [hoveredScrapId, setHoveredScrapId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ScrapType | null>(null);
  const [clusterFilter, setClusterFilter] = useState<string | null>(null);
  const graphRef = useRef<GraphCanvasHandle>(null);

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
      <Header title="Knowledge Graph" subtitle="Visualize your ideas" />
      <div className="relative h-[calc(100vh-64px)]">
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
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <GraphControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetView={handleResetView}
                onReheat={handleReheat}
              />

              {/* Filter controls */}
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 space-y-3">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Filter
                </div>

                {/* Type filter */}
                <div className="flex flex-wrap gap-1">
                  {TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.type}
                      onClick={() =>
                        setTypeFilter(typeFilter === option.type ? null : option.type)
                      }
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium transition-all',
                        typeFilter === option.type
                          ? 'text-white'
                          : 'text-slate-400 hover:text-slate-200'
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
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">Clusters</div>
                    <div className="flex flex-wrap gap-1">
                      {clusters.map((cluster) => (
                        <button
                          key={cluster.id}
                          onClick={() =>
                            setClusterFilter(
                              clusterFilter === cluster.id ? null : cluster.id
                            )
                          }
                          className={cn(
                            'px-2 py-1 rounded text-xs font-medium transition-all',
                            clusterFilter === cluster.id
                              ? 'bg-violet-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                    }}
                    className="w-full px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    Clear filters ({filteredScraps.length}/{scraps.length})
                  </button>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4">
              <GraphLegend />
            </div>

            {/* Tooltip for hovered node */}
            {hoveredScrap && !selectedScrap && (
              <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">
                <p className="text-sm font-medium text-white">
                  {hoveredScrap.title}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {hoveredScrap.type}
                </p>
              </div>
            )}

            {/* Detail panel for selected node */}
            {selectedScrap && (
              <div className="absolute top-4 left-4 w-96 max-h-[calc(100%-2rem)] overflow-auto bg-white rounded-lg shadow-xl">
                <ScrapDetail scrap={selectedScrap} onClose={handleCloseDetail} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
