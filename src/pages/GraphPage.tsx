// ABOUTME: Graph visualization page for the knowledge scrapbook
// ABOUTME: Displays 3D force-directed graph of all scraps and connections

import { useState, useCallback, useRef } from 'react';
import { Header } from '@/components/layout';
import {
  GraphCanvas,
  GraphControls,
  GraphLegend,
  type GraphCanvasHandle,
} from '@/components/graph';
import { useStore } from '@/store';
import { ScrapDetail } from '@/components/scrap';

export function GraphPage() {
  const scraps = useStore((state) => state.scraps);
  const [selectedScrapId, setSelectedScrapId] = useState<string | null>(null);
  const [hoveredScrapId, setHoveredScrapId] = useState<string | null>(null);
  const graphRef = useRef<GraphCanvasHandle>(null);

  const selectedScrap = scraps.find((s) => s.id === selectedScrapId);
  const hoveredScrap = scraps.find((s) => s.id === hoveredScrapId);

  const handleNodeClick = useCallback((scrapId: string) => {
    setSelectedScrapId((prev) => (prev === scrapId ? null : scrapId));
  }, []);

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
            <div className="text-center">
              <div className="mb-4 flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-slate-400"
                >
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="4" cy="6" r="2" />
                  <circle cx="20" cy="6" r="2" />
                  <circle cx="4" cy="18" r="2" />
                  <circle cx="20" cy="18" r="2" />
                  <line x1="6" y1="6" x2="10" y2="10.5" />
                  <line x1="18" y1="6" x2="14" y2="10.5" />
                  <line x1="6" y1="18" x2="10" y2="13.5" />
                  <line x1="18" y1="18" x2="14" y2="13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                No scraps yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Create some scraps to see them visualized here
              </p>
            </div>
          </div>
        ) : (
          <>
            <GraphCanvas
              ref={graphRef}
              scraps={scraps}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              selectedNodeId={selectedScrapId}
            />

            {/* Controls */}
            <div className="absolute top-4 right-4">
              <GraphControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetView={handleResetView}
                onReheat={handleReheat}
              />
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
