// ABOUTME: Tests for activity analytics service
// ABOUTME: Validates scrap aggregation by date for heat map display

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateActivitySummary, getActivityLevel } from './activityAnalytics';
import type { Scrap } from '@/types';

const createTestScrap = (overrides: Partial<Scrap> = {}): Scrap => ({
  id: 'test-id',
  type: 'thought',
  title: 'Test Scrap',
  content: 'Test content',
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
  autoTags: [],
  keywords: [],
  connectionIds: [],
  isPinned: false,
  searchableText: 'test scrap test content',
  ...overrides,
});

describe('calculateActivitySummary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array for no scraps', () => {
    const result = calculateActivitySummary([], 1);
    expect(result.days).toHaveLength(0);
    expect(result.totalScraps).toBe(0);
  });

  it('groups scraps by creation date', () => {
    const scraps = [
      createTestScrap({ id: 's1', createdAt: new Date('2024-06-14') }),
      createTestScrap({ id: 's2', createdAt: new Date('2024-06-14') }),
      createTestScrap({ id: 's3', createdAt: new Date('2024-06-13') }),
    ];

    const result = calculateActivitySummary(scraps, 1);

    const june14 = result.days.find((d) => d.date === '2024-06-14');
    const june13 = result.days.find((d) => d.date === '2024-06-13');

    expect(june14?.count).toBe(2);
    expect(june14?.scrapIds).toContain('s1');
    expect(june14?.scrapIds).toContain('s2');
    expect(june13?.count).toBe(1);
  });

  it('calculates maxCount correctly', () => {
    const scraps = [
      createTestScrap({ id: 's1', createdAt: new Date('2024-06-14') }),
      createTestScrap({ id: 's2', createdAt: new Date('2024-06-14') }),
      createTestScrap({ id: 's3', createdAt: new Date('2024-06-14') }),
      createTestScrap({ id: 's4', createdAt: new Date('2024-06-13') }),
    ];

    const result = calculateActivitySummary(scraps, 1);

    expect(result.maxCount).toBe(3);
    expect(result.totalScraps).toBe(4);
  });

  it('only includes scraps within the specified month range', () => {
    const scraps = [
      createTestScrap({ id: 's1', createdAt: new Date('2024-06-14') }),
      createTestScrap({ id: 's2', createdAt: new Date('2024-01-01') }), // 5+ months ago
    ];

    const result = calculateActivitySummary(scraps, 1); // 1 month

    expect(result.totalScraps).toBe(1);
    expect(result.days.find((d) => d.scrapIds.includes('s2'))).toBeUndefined();
  });
});

describe('getActivityLevel', () => {
  it('returns 0 for count of 0', () => {
    expect(getActivityLevel(0, 10)).toBe(0);
  });

  it('returns 1 for low activity', () => {
    expect(getActivityLevel(1, 10)).toBe(1);
    expect(getActivityLevel(2, 10)).toBe(1);
  });

  it('returns 2 for medium-low activity', () => {
    expect(getActivityLevel(3, 10)).toBe(2);
    expect(getActivityLevel(4, 10)).toBe(2);
  });

  it('returns 3 for medium-high activity', () => {
    expect(getActivityLevel(5, 10)).toBe(3);
    expect(getActivityLevel(6, 10)).toBe(3);
    expect(getActivityLevel(7, 10)).toBe(3);
  });

  it('returns 4 for high activity', () => {
    expect(getActivityLevel(8, 10)).toBe(4);
    expect(getActivityLevel(10, 10)).toBe(4);
  });

  it('handles maxCount of 0', () => {
    expect(getActivityLevel(0, 0)).toBe(0);
  });
});
