/**
 * K-Means Clustering Algorithm
 * Groups documents into k clusters based on TF-IDF vector similarity
 */

import type { TFIDFVector } from './tfidf';
import { toDenseVector, euclideanDistance } from './similarity';

export interface KMeansCluster {
  centroid: number[];
  memberIds: string[];
  inertia: number; // Sum of squared distances to centroid
}

export interface KMeansResult {
  clusters: KMeansCluster[];
  assignments: Map<string, number>; // document id -> cluster index
  iterations: number;
  totalInertia: number;
}

/**
 * Initialize centroids using k-means++ algorithm for better initial placement
 */
function initializeCentroidsKMeansPlusPlus(
  vectors: number[][],
  k: number
): number[][] {
  const centroids: number[][] = [];
  const n = vectors.length;

  // Choose first centroid randomly
  const firstIdx = Math.floor(Math.random() * n);
  centroids.push([...vectors[firstIdx]]);

  // Choose remaining centroids with probability proportional to distance squared
  for (let c = 1; c < k; c++) {
    const distances: number[] = [];
    let totalDistance = 0;

    for (let i = 0; i < n; i++) {
      // Find minimum distance to any existing centroid
      let minDist = Infinity;
      for (const centroid of centroids) {
        const dist = euclideanDistance(vectors[i], centroid);
        minDist = Math.min(minDist, dist);
      }
      distances.push(minDist * minDist); // Square the distance
      totalDistance += minDist * minDist;
    }

    // Choose next centroid with probability proportional to distance squared
    let random = Math.random() * totalDistance;
    for (let i = 0; i < n; i++) {
      random -= distances[i];
      if (random <= 0) {
        centroids.push([...vectors[i]]);
        break;
      }
    }

    // Fallback if no centroid was chosen (shouldn't happen)
    if (centroids.length === c) {
      centroids.push([...vectors[Math.floor(Math.random() * n)]]);
    }
  }

  return centroids;
}

/**
 * Assign each vector to the nearest centroid
 */
function assignToClusters(
  vectors: number[][],
  centroids: number[][]
): { assignments: number[]; inertia: number } {
  const assignments: number[] = [];
  let totalInertia = 0;

  for (let i = 0; i < vectors.length; i++) {
    let minDist = Infinity;
    let nearestCluster = 0;

    for (let c = 0; c < centroids.length; c++) {
      const dist = euclideanDistance(vectors[i], centroids[c]);
      if (dist < minDist) {
        minDist = dist;
        nearestCluster = c;
      }
    }

    assignments.push(nearestCluster);
    totalInertia += minDist * minDist;
  }

  return { assignments, inertia: totalInertia };
}

/**
 * Update centroids based on current assignments
 */
function updateCentroids(
  vectors: number[][],
  assignments: number[],
  k: number,
  dims: number
): number[][] {
  const sums: number[][] = Array(k).fill(null).map(() => Array(dims).fill(0));
  const counts: number[] = Array(k).fill(0);

  for (let i = 0; i < vectors.length; i++) {
    const cluster = assignments[i];
    counts[cluster]++;
    for (let d = 0; d < dims; d++) {
      sums[cluster][d] += vectors[i][d];
    }
  }

  const centroids: number[][] = [];
  for (let c = 0; c < k; c++) {
    if (counts[c] > 0) {
      centroids.push(sums[c].map((sum) => sum / counts[c]));
    } else {
      // Empty cluster - reinitialize randomly
      const randomIdx = Math.floor(Math.random() * vectors.length);
      centroids.push([...vectors[randomIdx]]);
    }
  }

  return centroids;
}

/**
 * Check if centroids have converged (stopped moving significantly)
 */
function hasConverged(
  oldCentroids: number[][],
  newCentroids: number[][],
  tolerance: number = 1e-4
): boolean {
  for (let c = 0; c < oldCentroids.length; c++) {
    const dist = euclideanDistance(oldCentroids[c], newCentroids[c]);
    if (dist > tolerance) {
      return false;
    }
  }
  return true;
}

/**
 * Run k-means clustering algorithm
 */
export function kMeansClustering(
  tfidfVectors: TFIDFVector[],
  vocabulary: string[],
  k: number,
  maxIterations: number = 100
): KMeansResult {
  if (tfidfVectors.length === 0) {
    return {
      clusters: [],
      assignments: new Map(),
      iterations: 0,
      totalInertia: 0,
    };
  }

  // Ensure k doesn't exceed number of documents
  k = Math.min(k, tfidfVectors.length);

  if (k <= 0) {
    return {
      clusters: [],
      assignments: new Map(),
      iterations: 0,
      totalInertia: 0,
    };
  }

  // Convert to dense vectors
  const ids = tfidfVectors.map((v) => v.id);
  const vectors = tfidfVectors.map((v) => toDenseVector(v, vocabulary));
  const dims = vocabulary.length;

  // Initialize centroids
  let centroids = initializeCentroidsKMeansPlusPlus(vectors, k);

  let assignments: number[] = [];
  let totalInertia = 0;
  let iterations = 0;

  // Main k-means loop
  for (iterations = 0; iterations < maxIterations; iterations++) {
    // Assign vectors to clusters
    const result = assignToClusters(vectors, centroids);
    assignments = result.assignments;
    totalInertia = result.inertia;

    // Update centroids
    const newCentroids = updateCentroids(vectors, assignments, k, dims);

    // Check convergence
    if (hasConverged(centroids, newCentroids)) {
      centroids = newCentroids;
      break;
    }

    centroids = newCentroids;
  }

  // Build result
  const clusters: KMeansCluster[] = centroids.map((centroid) => ({
    centroid,
    memberIds: [],
    inertia: 0,
  }));

  const assignmentMap = new Map<string, number>();

  for (let i = 0; i < ids.length; i++) {
    const clusterIdx = assignments[i];
    clusters[clusterIdx].memberIds.push(ids[i]);
    assignmentMap.set(ids[i], clusterIdx);

    // Calculate inertia for this cluster
    const dist = euclideanDistance(vectors[i], centroids[clusterIdx]);
    clusters[clusterIdx].inertia += dist * dist;
  }

  return {
    clusters,
    assignments: assignmentMap,
    iterations: iterations + 1,
    totalInertia,
  };
}

/**
 * Find optimal k using the elbow method
 * Returns the k where adding more clusters yields diminishing returns
 */
export function findOptimalK(
  tfidfVectors: TFIDFVector[],
  vocabulary: string[],
  maxK: number = 10
): { optimalK: number; inertias: number[] } {
  if (tfidfVectors.length <= 2) {
    return { optimalK: 1, inertias: [] };
  }

  maxK = Math.min(maxK, tfidfVectors.length - 1);
  const inertias: number[] = [];

  // Calculate inertia for each k
  for (let k = 1; k <= maxK; k++) {
    const result = kMeansClustering(tfidfVectors, vocabulary, k, 50);
    inertias.push(result.totalInertia);
  }

  // Find elbow point using the "knee" detection algorithm
  // Calculate the angle at each point and find the maximum
  let optimalK = 1;
  let maxAngle = 0;

  for (let i = 1; i < inertias.length - 1; i++) {
    // Calculate vectors to neighboring points
    const v1 = { x: -1, y: inertias[i - 1] - inertias[i] };
    const v2 = { x: 1, y: inertias[i + 1] - inertias[i] };

    // Calculate angle between vectors (higher angle = sharper elbow)
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    const angle = Math.acos(dot / (mag1 * mag2));

    if (angle > maxAngle) {
      maxAngle = angle;
      optimalK = i + 1; // k is 1-indexed
    }
  }

  // Ensure we have at least 2 clusters if we have enough documents
  if (optimalK === 1 && tfidfVectors.length >= 4) {
    optimalK = 2;
  }

  return { optimalK, inertias };
}

/**
 * Calculate silhouette score for clustering quality
 * Returns a value between -1 and 1, where higher is better
 */
export function silhouetteScore(
  tfidfVectors: TFIDFVector[],
  vocabulary: string[],
  assignments: Map<string, number>
): number {
  if (tfidfVectors.length <= 1) return 0;

  const vectors = tfidfVectors.map((v) => toDenseVector(v, vocabulary));
  const ids = tfidfVectors.map((v) => v.id);

  let totalScore = 0;

  for (let i = 0; i < vectors.length; i++) {
    const myCluster = assignments.get(ids[i])!;

    // Calculate average distance to points in same cluster (a)
    let intraClusterDist = 0;
    let intraClusterCount = 0;

    // Calculate average distance to points in nearest other cluster (b)
    const clusterDistances = new Map<number, { sum: number; count: number }>();

    for (let j = 0; j < vectors.length; j++) {
      if (i === j) continue;

      const dist = euclideanDistance(vectors[i], vectors[j]);
      const otherCluster = assignments.get(ids[j])!;

      if (otherCluster === myCluster) {
        intraClusterDist += dist;
        intraClusterCount++;
      } else {
        if (!clusterDistances.has(otherCluster)) {
          clusterDistances.set(otherCluster, { sum: 0, count: 0 });
        }
        const cd = clusterDistances.get(otherCluster)!;
        cd.sum += dist;
        cd.count++;
      }
    }

    const a = intraClusterCount > 0 ? intraClusterDist / intraClusterCount : 0;

    let b = Infinity;
    for (const [, { sum, count }] of clusterDistances) {
      const avgDist = sum / count;
      if (avgDist < b) {
        b = avgDist;
      }
    }

    if (b === Infinity) b = 0;

    const silhouette = a === 0 && b === 0 ? 0 : (b - a) / Math.max(a, b);
    totalScore += silhouette;
  }

  return totalScore / vectors.length;
}
