/**
 * Cluster Engine
 * High-level API for clustering scraps using TF-IDF and k-means
 */

import { v4 as uuid } from 'uuid';
import type { Scrap, Cluster } from '@/types';
import { TFIDFCalculator, type TFIDFResult } from './tfidf';
import { kMeansClustering, findOptimalK, silhouetteScore } from './kmeans';
import { cosineSimilarity } from './similarity';

// Cluster colors for visualization
const CLUSTER_COLORS = [
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
  '#a855f7', // purple
];

export interface ClusterEngineResult {
  clusters: Cluster[];
  assignments: Map<string, string>; // scrap id -> cluster id
  quality: number; // silhouette score
}

/**
 * Extract text content from a scrap for clustering
 */
function getScrapText(scrap: Scrap): string {
  const parts: string[] = [
    scrap.title,
    scrap.content,
    ...scrap.keywords,
    ...scrap.tags,
    ...scrap.autoTags,
  ];

  if (scrap.linkMeta) {
    parts.push(scrap.linkMeta.title, scrap.linkMeta.description);
  }

  return parts.filter(Boolean).join(' ');
}

/**
 * Generate a cluster name from top keywords
 */
function generateClusterName(
  memberScraps: Scrap[],
  tfidf: TFIDFResult,
  clusterIndex: number
): string {
  // Aggregate term frequencies across cluster members
  const termScores = new Map<string, number>();

  for (const scrap of memberScraps) {
    const vector = tfidf.vectors.find((v) => v.id === scrap.id);
    if (vector) {
      for (const [term, score] of vector.vector) {
        termScores.set(term, (termScores.get(term) || 0) + score);
      }
    }
  }

  // Sort by score and take top terms
  const sortedTerms = Array.from(termScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([term]) => term);

  if (sortedTerms.length > 0) {
    // Capitalize first letter of each term
    const formatted = sortedTerms
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
      .join(', ');
    return formatted;
  }

  return `Cluster ${clusterIndex + 1}`;
}

/**
 * Generate cluster description from member scraps
 */
function generateClusterDescription(memberScraps: Scrap[]): string {
  const typeCount = new Map<string, number>();
  for (const scrap of memberScraps) {
    typeCount.set(scrap.type, (typeCount.get(scrap.type) || 0) + 1);
  }

  const typeSummary = Array.from(typeCount.entries())
    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
    .join(', ');

  return `Contains ${memberScraps.length} scraps: ${typeSummary}`;
}

/**
 * Extract top keywords from cluster
 */
function extractClusterKeywords(
  memberScraps: Scrap[],
  tfidf: TFIDFResult,
  limit: number = 10
): string[] {
  const termScores = new Map<string, number>();

  for (const scrap of memberScraps) {
    const vector = tfidf.vectors.find((v) => v.id === scrap.id);
    if (vector) {
      for (const [term, score] of vector.vector) {
        termScores.set(term, (termScores.get(term) || 0) + score);
      }
    }
  }

  return Array.from(termScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}

class ClusterEngine {
  private tfidfCalculator = new TFIDFCalculator();
  private lastTfidfResult: TFIDFResult | null = null;
  private scrapsMap = new Map<string, Scrap>();

  /**
   * Rebuild clusters for a set of scraps
   */
  async rebuildClusters(scraps: Scrap[]): Promise<ClusterEngineResult> {
    // Need at least 2 scraps to cluster
    if (scraps.length < 2) {
      return {
        clusters: [],
        assignments: new Map(),
        quality: 0,
      };
    }

    // Clear and rebuild TF-IDF
    this.tfidfCalculator.clear();
    this.scrapsMap.clear();

    for (const scrap of scraps) {
      this.scrapsMap.set(scrap.id, scrap);
      this.tfidfCalculator.addDocument(scrap.id, getScrapText(scrap));
    }

    // Calculate TF-IDF vectors
    this.lastTfidfResult = this.tfidfCalculator.calculateAllVectors();

    if (this.lastTfidfResult.vectors.length < 2) {
      return {
        clusters: [],
        assignments: new Map(),
        quality: 0,
      };
    }

    // Find optimal number of clusters
    const maxK = Math.min(10, Math.floor(scraps.length / 2));
    const { optimalK } = findOptimalK(
      this.lastTfidfResult.vectors,
      this.lastTfidfResult.vocabulary,
      maxK
    );

    // Run k-means clustering
    const kmeansResult = kMeansClustering(
      this.lastTfidfResult.vectors,
      this.lastTfidfResult.vocabulary,
      optimalK
    );

    // Calculate clustering quality
    const quality = silhouetteScore(
      this.lastTfidfResult.vectors,
      this.lastTfidfResult.vocabulary,
      kmeansResult.assignments
    );

    // Build Cluster objects
    const now = new Date();
    const clusters: Cluster[] = [];
    const scrapToCluster = new Map<string, string>();

    for (let i = 0; i < kmeansResult.clusters.length; i++) {
      const kcluster = kmeansResult.clusters[i];

      if (kcluster.memberIds.length === 0) continue;

      const memberScraps = kcluster.memberIds
        .map((id) => this.scrapsMap.get(id))
        .filter((s): s is Scrap => s !== undefined);

      const clusterId = uuid();

      const cluster: Cluster = {
        id: clusterId,
        name: generateClusterName(memberScraps, this.lastTfidfResult, i),
        description: generateClusterDescription(memberScraps),
        keywords: extractClusterKeywords(memberScraps, this.lastTfidfResult),
        scrapIds: kcluster.memberIds,
        centroid: kcluster.centroid,
        coherence: 1 - (kcluster.inertia / Math.max(kcluster.memberIds.length, 1)),
        color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
        createdAt: now,
        updatedAt: now,
      };

      clusters.push(cluster);

      // Map scraps to cluster
      for (const scrapId of kcluster.memberIds) {
        scrapToCluster.set(scrapId, clusterId);
      }
    }

    return {
      clusters,
      assignments: scrapToCluster,
      quality,
    };
  }

  /**
   * Find the best cluster for a new scrap
   */
  async assignToCluster(
    scrap: Scrap,
    existingClusters: Cluster[]
  ): Promise<{ clusterId: string | null; score: number }> {
    if (!this.lastTfidfResult || existingClusters.length === 0) {
      return { clusterId: null, score: 0 };
    }

    // Add document to TF-IDF calculator
    this.tfidfCalculator.addDocument(scrap.id, getScrapText(scrap));
    const tfidfResult = this.tfidfCalculator.calculateAllVectors();

    const scrapVector = tfidfResult.vectors.find((v) => v.id === scrap.id);
    if (!scrapVector) {
      return { clusterId: null, score: 0 };
    }

    // Find most similar cluster by comparing to centroid
    let bestCluster: string | null = null;
    let bestScore = 0;

    for (const cluster of existingClusters) {
      // Calculate average similarity to cluster members
      const memberVectors = tfidfResult.vectors.filter((v) =>
        cluster.scrapIds.includes(v.id)
      );

      if (memberVectors.length === 0) continue;

      let totalSimilarity = 0;
      for (const memberVector of memberVectors) {
        totalSimilarity += cosineSimilarity(scrapVector, memberVector);
      }
      const avgSimilarity = totalSimilarity / memberVectors.length;

      if (avgSimilarity > bestScore) {
        bestScore = avgSimilarity;
        bestCluster = cluster.id;
      }
    }

    // Only assign if similarity is above threshold
    if (bestScore < 0.1) {
      return { clusterId: null, score: bestScore };
    }

    return { clusterId: bestCluster, score: bestScore };
  }

  /**
   * Get similarity between a scrap and a cluster
   */
  getClusterSimilarity(scrapId: string, cluster: Cluster): number {
    if (!this.lastTfidfResult) return 0;

    const scrapVector = this.lastTfidfResult.vectors.find((v) => v.id === scrapId);
    if (!scrapVector) return 0;

    const memberVectors = this.lastTfidfResult.vectors.filter((v) =>
      cluster.scrapIds.includes(v.id) && v.id !== scrapId
    );

    if (memberVectors.length === 0) return 0;

    let totalSimilarity = 0;
    for (const memberVector of memberVectors) {
      totalSimilarity += cosineSimilarity(scrapVector, memberVector);
    }

    return totalSimilarity / memberVectors.length;
  }

  /**
   * Get similar scraps to a given scrap
   */
  getSimilarScraps(
    scrapId: string,
    limit: number = 5
  ): Array<{ id: string; similarity: number }> {
    if (!this.lastTfidfResult) return [];

    const targetVector = this.lastTfidfResult.vectors.find((v) => v.id === scrapId);
    if (!targetVector) return [];

    const similarities: Array<{ id: string; similarity: number }> = [];

    for (const vector of this.lastTfidfResult.vectors) {
      if (vector.id === scrapId) continue;

      const similarity = cosineSimilarity(targetVector, vector);
      if (similarity > 0.05) {
        similarities.push({ id: vector.id, similarity });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

export const clusterEngine = new ClusterEngine();
