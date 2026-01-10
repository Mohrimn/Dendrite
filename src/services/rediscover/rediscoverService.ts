// ABOUTME: Surfaces forgotten scraps using time-based and importance scoring
// ABOUTME: Prioritizes scraps not viewed recently with high keyword richness

import type { Scrap } from '@/types';

export interface RediscoverCandidate {
  scrap: Scrap;
  score: number;
  daysSinceViewed: number;
}

const PINNED_BOOST = 0.3;
const KEYWORD_WEIGHT = 0.1;
const TAG_BOOST = 0.1;
const MAX_KEYWORDS_FOR_BOOST = 10;

function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / msPerDay);
}

function calculateImportanceMultiplier(scrap: Scrap): number {
  let multiplier = 1;

  if (scrap.isPinned) {
    multiplier += PINNED_BOOST;
  }

  const keywordRichness = Math.min(scrap.keywords.length, MAX_KEYWORDS_FOR_BOOST) / MAX_KEYWORDS_FOR_BOOST;
  multiplier += keywordRichness * KEYWORD_WEIGHT;

  if (scrap.tags.length > 0) {
    multiplier += TAG_BOOST;
  }

  return multiplier;
}

export function findRediscoverScraps(
  scraps: Scrap[],
  limit: number = 3,
  minDaysOld: number = 7
): RediscoverCandidate[] {
  const now = new Date();
  const candidates: RediscoverCandidate[] = [];

  for (const scrap of scraps) {
    const daysSinceCreated = daysBetween(scrap.createdAt, now);

    if (daysSinceCreated < minDaysOld) {
      continue;
    }

    let daysSinceViewed: number;
    if (scrap.lastViewedAt) {
      daysSinceViewed = daysBetween(scrap.lastViewedAt, now);
    } else {
      daysSinceViewed = daysSinceCreated;
    }

    if (daysSinceViewed < minDaysOld) {
      continue;
    }

    const recencyPenalty = Math.log(daysSinceViewed + 1);
    const importanceMultiplier = calculateImportanceMultiplier(scrap);
    const score = recencyPenalty * importanceMultiplier;

    candidates.push({
      scrap,
      score,
      daysSinceViewed,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit);
}
