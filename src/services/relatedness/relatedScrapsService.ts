// ABOUTME: Finds related scraps using tags, keywords, and cluster membership
// ABOUTME: Combines multiple signals into a weighted relatedness score

import type { Scrap } from '@/types';

export type RelatednessReason = 'tag' | 'keyword' | 'cluster';

export interface RelatedScrap {
  scrap: Scrap;
  score: number;
  reasons: RelatednessReason[];
}

const TAG_WEIGHT = 0.4;
const KEYWORD_WEIGHT = 0.4;
const CLUSTER_WEIGHT = 0.2;
const MIN_SCORE_THRESHOLD = 0.1;

function calculateTagOverlap(a: Scrap, b: Scrap): number {
  const tagsA = new Set([...a.tags, ...a.autoTags]);
  const tagsB = new Set([...b.tags, ...b.autoTags]);

  if (tagsA.size === 0 || tagsB.size === 0) return 0;

  let shared = 0;
  for (const tag of tagsA) {
    if (tagsB.has(tag)) shared++;
  }

  const maxTags = Math.max(tagsA.size, tagsB.size);
  return shared / maxTags;
}

function calculateKeywordOverlap(a: Scrap, b: Scrap): number {
  if (a.keywords.length === 0 || b.keywords.length === 0) return 0;

  const keywordsA = new Set(a.keywords);
  const keywordsB = new Set(b.keywords);

  let shared = 0;
  for (const keyword of keywordsA) {
    if (keywordsB.has(keyword)) shared++;
  }

  const maxKeywords = Math.max(keywordsA.size, keywordsB.size);
  return shared / maxKeywords;
}

function isSameCluster(a: Scrap, b: Scrap): boolean {
  return Boolean(a.clusterId && b.clusterId && a.clusterId === b.clusterId);
}

export function findRelatedScraps(
  targetScrap: Scrap,
  allScraps: Scrap[],
  limit: number = 5
): RelatedScrap[] {
  const candidates: RelatedScrap[] = [];

  for (const scrap of allScraps) {
    if (scrap.id === targetScrap.id) continue;

    const reasons: RelatednessReason[] = [];
    let score = 0;

    const tagOverlap = calculateTagOverlap(targetScrap, scrap);
    if (tagOverlap > 0) {
      score += tagOverlap * TAG_WEIGHT;
      reasons.push('tag');
    }

    const keywordOverlap = calculateKeywordOverlap(targetScrap, scrap);
    if (keywordOverlap > 0) {
      score += keywordOverlap * KEYWORD_WEIGHT;
      reasons.push('keyword');
    }

    if (isSameCluster(targetScrap, scrap)) {
      score += CLUSTER_WEIGHT;
      reasons.push('cluster');
    }

    if (score >= MIN_SCORE_THRESHOLD) {
      candidates.push({ scrap, score, reasons });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit);
}
