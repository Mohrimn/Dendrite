// ABOUTME: Tests for the rediscover service
// ABOUTME: Validates finding forgotten scraps based on view history and importance

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { findRediscoverScraps } from './rediscoverService';
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

describe('findRediscoverScraps', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array when all scraps were recently viewed', () => {
    const recentlyViewed = createTestScrap({
      id: 'recent',
      lastViewedAt: new Date('2024-06-14'), // 1 day ago
    });

    const result = findRediscoverScraps([recentlyViewed], 3, 7);

    expect(result).toHaveLength(0);
  });

  it('finds scraps that were never viewed', () => {
    const neverViewed = createTestScrap({
      id: 'never',
      lastViewedAt: undefined,
      createdAt: new Date('2024-06-01'), // 14 days ago
    });

    const result = findRediscoverScraps([neverViewed], 3, 7);

    expect(result).toHaveLength(1);
    expect(result[0].scrap.id).toBe('never');
  });

  it('finds scraps not viewed for more than minDaysOld', () => {
    const forgottenScrap = createTestScrap({
      id: 'forgotten',
      createdAt: new Date('2024-05-01'), // Old enough
      lastViewedAt: new Date('2024-06-01'), // 14 days ago
    });

    const result = findRediscoverScraps([forgottenScrap], 3, 7);

    expect(result).toHaveLength(1);
    expect(result[0].scrap.id).toBe('forgotten');
    expect(result[0].daysSinceViewed).toBe(14);
  });

  it('prioritizes pinned scraps', () => {
    const pinnedOld = createTestScrap({
      id: 'pinned',
      isPinned: true,
      createdAt: new Date('2024-05-01'),
      lastViewedAt: new Date('2024-06-01'),
    });
    const unpinnedOld = createTestScrap({
      id: 'unpinned',
      isPinned: false,
      createdAt: new Date('2024-05-01'),
      lastViewedAt: new Date('2024-06-01'),
    });

    const result = findRediscoverScraps([unpinnedOld, pinnedOld], 3, 7);

    expect(result[0].scrap.id).toBe('pinned');
    expect(result[0].score).toBeGreaterThan(result[1].score);
  });

  it('prioritizes scraps with more keywords', () => {
    const keywordRich = createTestScrap({
      id: 'rich',
      keywords: ['a', 'b', 'c', 'd', 'e'],
      createdAt: new Date('2024-05-01'),
      lastViewedAt: new Date('2024-06-01'),
    });
    const keywordPoor = createTestScrap({
      id: 'poor',
      keywords: [],
      createdAt: new Date('2024-05-01'),
      lastViewedAt: new Date('2024-06-01'),
    });

    const result = findRediscoverScraps([keywordPoor, keywordRich], 3, 7);

    expect(result[0].scrap.id).toBe('rich');
  });

  it('prioritizes scraps with user tags', () => {
    const withTags = createTestScrap({
      id: 'tagged',
      tags: ['important', 'work'],
      createdAt: new Date('2024-05-01'),
      lastViewedAt: new Date('2024-06-01'),
    });
    const withoutTags = createTestScrap({
      id: 'untagged',
      tags: [],
      createdAt: new Date('2024-05-01'),
      lastViewedAt: new Date('2024-06-01'),
    });

    const result = findRediscoverScraps([withoutTags, withTags], 3, 7);

    expect(result[0].scrap.id).toBe('tagged');
  });

  it('respects the limit parameter', () => {
    const scraps = [
      createTestScrap({ id: 's1', createdAt: new Date('2024-05-01'), lastViewedAt: new Date('2024-06-01') }),
      createTestScrap({ id: 's2', createdAt: new Date('2024-05-01'), lastViewedAt: new Date('2024-06-01') }),
      createTestScrap({ id: 's3', createdAt: new Date('2024-05-01'), lastViewedAt: new Date('2024-06-01') }),
      createTestScrap({ id: 's4', createdAt: new Date('2024-05-01'), lastViewedAt: new Date('2024-06-01') }),
    ];

    const result = findRediscoverScraps(scraps, 2, 7);

    expect(result).toHaveLength(2);
  });

  it('excludes scraps created too recently', () => {
    const tooNew = createTestScrap({
      id: 'new',
      createdAt: new Date('2024-06-14'), // 1 day ago
      lastViewedAt: undefined,
    });

    const result = findRediscoverScraps([tooNew], 3, 7);

    expect(result).toHaveLength(0);
  });
});
