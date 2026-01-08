/**
 * Similarity functions for comparing document vectors
 */

import type { TFIDFVector } from './tfidf';

/**
 * Calculate cosine similarity between two TF-IDF vectors
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export function cosineSimilarity(a: TFIDFVector, b: TFIDFVector): number {
  if (a.magnitude === 0 || b.magnitude === 0) {
    return 0;
  }

  let dotProduct = 0;

  // Iterate over the smaller vector for efficiency
  const [smaller, larger] = a.vector.size <= b.vector.size
    ? [a.vector, b.vector]
    : [b.vector, a.vector];

  for (const [term, valueA] of smaller) {
    const valueB = larger.get(term);
    if (valueB !== undefined) {
      dotProduct += valueA * valueB;
    }
  }

  return dotProduct / (a.magnitude * b.magnitude);
}

/**
 * Calculate cosine distance (1 - similarity)
 * Returns a value between 0 (identical) and 1 (completely different)
 */
export function cosineDistance(a: TFIDFVector, b: TFIDFVector): number {
  return 1 - cosineSimilarity(a, b);
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let sumSquares = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sumSquares += diff * diff;
  }

  return Math.sqrt(sumSquares);
}

/**
 * Convert sparse TF-IDF vector to dense array using vocabulary
 */
export function toDenseVector(vector: TFIDFVector, vocabulary: string[]): number[] {
  return vocabulary.map((term) => vector.vector.get(term) || 0);
}

/**
 * Convert dense array back to sparse TF-IDF vector
 */
export function toSparseVector(dense: number[], vocabulary: string[], id: string): TFIDFVector {
  const vector = new Map<string, number>();
  let sumSquares = 0;

  for (let i = 0; i < vocabulary.length; i++) {
    if (dense[i] !== 0) {
      vector.set(vocabulary[i], dense[i]);
      sumSquares += dense[i] * dense[i];
    }
  }

  return {
    id,
    vector,
    magnitude: Math.sqrt(sumSquares),
  };
}

/**
 * Calculate pairwise similarity matrix for a set of vectors
 */
export function pairwiseSimilarityMatrix(vectors: TFIDFVector[]): number[][] {
  const n = vectors.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1; // Self-similarity is always 1
    for (let j = i + 1; j < n; j++) {
      const similarity = cosineSimilarity(vectors[i], vectors[j]);
      matrix[i][j] = similarity;
      matrix[j][i] = similarity;
    }
  }

  return matrix;
}

/**
 * Find the most similar vectors to a given vector
 */
export function findMostSimilar(
  target: TFIDFVector,
  candidates: TFIDFVector[],
  topK: number = 5
): Array<{ id: string; similarity: number }> {
  const similarities = candidates
    .filter((c) => c.id !== target.id)
    .map((candidate) => ({
      id: candidate.id,
      similarity: cosineSimilarity(target, candidate),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, topK);
}
