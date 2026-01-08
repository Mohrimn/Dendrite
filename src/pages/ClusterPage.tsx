import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout';
import { ClusterCard } from '@/components/cluster';
import { Button } from '@/components/ui';
import { useScraps, useStore } from '@/store';
import { clusterEngine, type ClusterEngineResult } from '@/services/clustering';
import type { Cluster } from '@/types';
import { cn } from '@/lib/utils';

export function ClusterPage() {
  const navigate = useNavigate();
  const scraps = useScraps();
  const selectScrap = useStore((state) => state.selectScrap);

  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [quality, setQuality] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  const rebuildClusters = useCallback(async () => {
    if (scraps.length < 2) {
      setClusters([]);
      setQuality(0);
      return;
    }

    setIsLoading(true);
    try {
      const result: ClusterEngineResult = await clusterEngine.rebuildClusters(scraps);
      setClusters(result.clusters);
      setQuality(result.quality);
    } catch (error) {
      console.error('Failed to build clusters:', error);
    } finally {
      setIsLoading(false);
    }
  }, [scraps]);

  // Build clusters when scraps change
  useEffect(() => {
    rebuildClusters();
  }, [rebuildClusters]);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId);
  const clusterScraps = selectedCluster
    ? scraps.filter((s) => selectedCluster.scrapIds.includes(s.id))
    : [];

  const handleScrapClick = (scrapId: string) => {
    selectScrap(scrapId);
    navigate('/');
  };

  if (scraps.length < 2) {
    return (
      <>
        <Header title="Clusters" subtitle="Themed groups of related scraps" />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="text-center max-w-md">
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
                <circle cx="12" cy="12" r="3" />
                <circle cx="19" cy="5" r="2" />
                <circle cx="5" cy="5" r="2" />
                <circle cx="19" cy="19" r="2" />
                <circle cx="5" cy="19" r="2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Not enough scraps</h3>
            <p className="mt-2 text-sm text-slate-500">
              Add at least 2 scraps to see automatic thematic clusters.
              The more scraps you add, the better the clustering will be.
            </p>
            <Button onClick={() => navigate('/')} className="mt-6">
              Add Scraps
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Clusters"
        subtitle={`${clusters.length} thematic groups • ${Math.round(quality * 100)}% quality`}
      />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Clusters List */}
        <div className="w-1/2 border-r border-slate-200 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Thematic Groups
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={rebuildClusters}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="-ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
              )}
              Rebuild
            </Button>
          </div>

          {isLoading && clusters.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg
                  className="animate-spin mx-auto h-8 w-8 text-violet-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="mt-4 text-sm text-slate-500">
                  Analyzing and clustering your scraps...
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {clusters.map((cluster) => (
                  <ClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    scraps={scraps.filter((s) => cluster.scrapIds.includes(s.id))}
                    isSelected={selectedClusterId === cluster.id}
                    onClick={() => setSelectedClusterId(
                      selectedClusterId === cluster.id ? null : cluster.id
                    )}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Cluster Detail */}
        <div className="w-1/2 overflow-y-auto bg-slate-50">
          <AnimatePresence mode="wait">
            {selectedCluster ? (
              <motion.div
                key={selectedCluster.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                {/* Cluster header */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${selectedCluster.color}20` }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={selectedCluster.color}
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="19" cy="5" r="2" />
                      <circle cx="5" cy="5" r="2" />
                      <circle cx="19" cy="19" r="2" />
                      <circle cx="5" cy="19" r="2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {selectedCluster.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedCluster.description}
                    </p>
                  </div>
                </div>

                {/* Keywords */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">
                    Top Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCluster.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${selectedCluster.color}15`,
                          color: selectedCluster.color,
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Scraps in cluster */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">
                    Scraps in this cluster ({clusterScraps.length})
                  </h3>
                  <div className="space-y-2">
                    {clusterScraps.map((scrap) => (
                      <motion.button
                        key={scrap.id}
                        whileHover={{ x: 4 }}
                        onClick={() => handleScrapClick(scrap.id)}
                        className={cn(
                          'w-full text-left p-4 rounded-xl bg-white border border-slate-200',
                          'hover:border-slate-300 hover:shadow-md transition-all duration-200'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-0.5 p-1.5 rounded-lg"
                            style={{
                              backgroundColor: `${selectedCluster.color}15`,
                              color: selectedCluster.color,
                            }}
                          >
                            {scrap.type === 'thought' && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            )}
                            {scrap.type === 'link' && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            )}
                            {scrap.type === 'image' && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                              </svg>
                            )}
                            {scrap.type === 'snippet' && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="16 18 22 12 16 6" />
                                <polyline points="8 6 2 12 8 18" />
                              </svg>
                            )}
                            {scrap.type === 'note' && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 truncate">
                              {scrap.title}
                            </h4>
                            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                              {scrap.content}
                            </p>
                            {scrap.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {scrap.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center text-slate-400">
                  <svg
                    className="mx-auto h-12 w-12"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="mt-4 text-sm">
                    Select a cluster to view its scraps
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
