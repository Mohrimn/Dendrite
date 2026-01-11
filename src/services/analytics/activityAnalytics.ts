// ABOUTME: Aggregates scrap creation dates into daily activity counts
// ABOUTME: Supports date range queries for heat map visualization

import type { Scrap } from '@/types';

export interface DailyActivity {
  date: string; // YYYY-MM-DD format
  count: number;
  scrapIds: string[];
}

export interface ActivitySummary {
  days: DailyActivity[];
  maxCount: number;
  totalScraps: number;
  startDate: Date;
  endDate: Date;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateActivitySummary(
  scraps: Scrap[],
  months: number = 6
): ActivitySummary {
  if (scraps.length === 0) {
    return {
      days: [],
      maxCount: 0,
      totalScraps: 0,
      startDate: new Date(),
      endDate: new Date(),
    };
  }

  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setHours(0, 0, 0, 0);

  const dateMap = new Map<string, { count: number; scrapIds: string[] }>();

  let totalScraps = 0;

  for (const scrap of scraps) {
    const scrapDate = new Date(scrap.createdAt);

    if (scrapDate < startDate) {
      continue;
    }

    const dateKey = formatDateKey(scrapDate);
    const existing = dateMap.get(dateKey) || { count: 0, scrapIds: [] };
    existing.count++;
    existing.scrapIds.push(scrap.id);
    dateMap.set(dateKey, existing);
    totalScraps++;
  }

  const days: DailyActivity[] = [];
  let maxCount = 0;

  for (const [date, data] of dateMap) {
    days.push({
      date,
      count: data.count,
      scrapIds: data.scrapIds,
    });
    if (data.count > maxCount) {
      maxCount = data.count;
    }
  }

  days.sort((a, b) => a.date.localeCompare(b.date));

  return {
    days,
    maxCount,
    totalScraps,
    startDate,
    endDate: now,
  };
}

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export function getActivityLevel(count: number, maxCount: number): ActivityLevel {
  if (count === 0 || maxCount === 0) return 0;

  const ratio = count / maxCount;

  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}
