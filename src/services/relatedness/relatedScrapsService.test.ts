// ABOUTME: Tests for the related scraps service
// ABOUTME: Validates finding similar scraps based on tags, keywords, and clusters

import { describe, it, expect } from 'vitest';
import { findRelatedScraps } from './relatedScrapsService';
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

describe('findRelatedScraps', () => {
  it('returns empty array when no other scraps exist', () => {
    const target = createTestScrap({ id: 'target' });
    const result = findRelatedScraps(target, [target]);

    expect(result).toHaveLength(0);
  });

  it('finds scraps with shared tags', () => {
    const target = createTestScrap({ id: 'target', tags: ['react', 'javascript'] });
    const related = createTestScrap({ id: 'related', tags: ['react', 'typescript'] });
    const unrelated = createTestScrap({ id: 'unrelated', tags: ['python'] });

    const result = findRelatedScraps(target, [target, related, unrelated]);

    expect(result).toHaveLength(1);
    expect(result[0].scrap.id).toBe('related');
    expect(result[0].reasons).toContain('tag');
  });

  it('finds scraps with shared autoTags', () => {
    const target = createTestScrap({ id: 'target', autoTags: ['github'] });
    const related = createTestScrap({ id: 'related', autoTags: ['github'] });

    const result = findRelatedScraps(target, [target, related]);

    expect(result).toHaveLength(1);
    expect(result[0].scrap.id).toBe('related');
    expect(result[0].reasons).toContain('tag');
  });

  it('finds scraps with shared keywords', () => {
    const target = createTestScrap({ id: 'target', keywords: ['algorithm', 'optimization'] });
    const related = createTestScrap({ id: 'related', keywords: ['algorithm', 'performance'] });

    const result = findRelatedScraps(target, [target, related]);

    expect(result).toHaveLength(1);
    expect(result[0].scrap.id).toBe('related');
    expect(result[0].reasons).toContain('keyword');
  });

  it('finds scraps in same cluster', () => {
    const target = createTestScrap({ id: 'target', clusterId: 'cluster-a' });
    const related = createTestScrap({ id: 'related', clusterId: 'cluster-a' });
    const differentCluster = createTestScrap({ id: 'different', clusterId: 'cluster-b' });

    const result = findRelatedScraps(target, [target, related, differentCluster]);

    expect(result).toHaveLength(1);
    expect(result[0].scrap.id).toBe('related');
    expect(result[0].reasons).toContain('cluster');
  });

  it('ranks scraps with multiple signals higher', () => {
    const target = createTestScrap({
      id: 'target',
      tags: ['react'],
      keywords: ['component'],
      clusterId: 'cluster-a',
    });
    const highMatch = createTestScrap({
      id: 'high',
      tags: ['react'],
      keywords: ['component'],
      clusterId: 'cluster-a',
    });
    const lowMatch = createTestScrap({
      id: 'low',
      tags: ['react'],
    });

    const result = findRelatedScraps(target, [target, highMatch, lowMatch]);

    expect(result[0].scrap.id).toBe('high');
    expect(result[0].score).toBeGreaterThan(result[1].score);
  });

  it('respects the limit parameter', () => {
    const target = createTestScrap({ id: 'target', tags: ['shared'] });
    const scraps = [
      target,
      createTestScrap({ id: 'r1', tags: ['shared'] }),
      createTestScrap({ id: 'r2', tags: ['shared'] }),
      createTestScrap({ id: 'r3', tags: ['shared'] }),
      createTestScrap({ id: 'r4', tags: ['shared'] }),
      createTestScrap({ id: 'r5', tags: ['shared'] }),
    ];

    const result = findRelatedScraps(target, scraps, 3);

    expect(result).toHaveLength(3);
  });

  it('excludes scraps below minimum score threshold', () => {
    const target = createTestScrap({ id: 'target', tags: ['unique-tag'] });
    const unrelated = createTestScrap({ id: 'unrelated', tags: ['completely-different'] });

    const result = findRelatedScraps(target, [target, unrelated]);

    expect(result).toHaveLength(0);
  });
});
