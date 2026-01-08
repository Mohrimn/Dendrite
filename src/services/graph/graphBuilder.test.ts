// ABOUTME: Tests for the graph builder service
// ABOUTME: Validates graph data construction from scraps and connections

import { describe, it, expect } from 'vitest';
import { graphBuilder } from './graphBuilder';
import type { Scrap } from '@/types';
import type { Connection } from '@/types/connection';

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
  searchableText: 'Test Scrap Test content',
  ...overrides,
});

describe('graphBuilder', () => {
  describe('build', () => {
    it('creates nodes from scraps', () => {
      const scraps: Scrap[] = [
        createTestScrap({ id: 'scrap-1', type: 'thought', title: 'Thought 1' }),
        createTestScrap({ id: 'scrap-2', type: 'link', title: 'Link 1' }),
      ];

      const result = graphBuilder.build(scraps, []);

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0]).toMatchObject({
        id: 'scrap-1',
        type: 'thought',
        label: 'Thought 1',
      });
      expect(result.nodes[1]).toMatchObject({
        id: 'scrap-2',
        type: 'link',
        label: 'Link 1',
      });
    });

    it('creates links from connections', () => {
      const scraps: Scrap[] = [
        createTestScrap({ id: 'scrap-1' }),
        createTestScrap({ id: 'scrap-2' }),
      ];
      const connections: Connection[] = [
        {
          id: 'conn-1',
          sourceId: 'scrap-1',
          targetId: 'scrap-2',
          type: 'tag',
          strength: 0.8,
          createdAt: new Date(),
        },
      ];

      const result = graphBuilder.build(scraps, connections);

      expect(result.links).toHaveLength(1);
      expect(result.links[0]).toMatchObject({
        source: 'scrap-1',
        target: 'scrap-2',
        type: 'tag',
        strength: 0.8,
      });
    });

    it('returns empty graph for empty input', () => {
      const result = graphBuilder.build([], []);

      expect(result.nodes).toHaveLength(0);
      expect(result.links).toHaveLength(0);
    });
  });

  describe('findConnections', () => {
    it('creates connections between scraps with shared tags', () => {
      const scraps: Scrap[] = [
        createTestScrap({ id: 'scrap-1', tags: ['react', 'javascript'] }),
        createTestScrap({ id: 'scrap-2', tags: ['react', 'typescript'] }),
        createTestScrap({ id: 'scrap-3', tags: ['python'] }),
      ];

      const connections = graphBuilder.findConnections(scraps);

      // scrap-1 and scrap-2 share 'react' tag
      const tagConnection = connections.find(
        (c) =>
          c.type === 'tag' &&
          ((c.sourceId === 'scrap-1' && c.targetId === 'scrap-2') ||
            (c.sourceId === 'scrap-2' && c.targetId === 'scrap-1'))
      );
      expect(tagConnection).toBeDefined();
      expect(tagConnection?.strength).toBeGreaterThan(0);
    });

    it('creates connections between scraps in same cluster', () => {
      const scraps: Scrap[] = [
        createTestScrap({ id: 'scrap-1', clusterId: 'cluster-a' }),
        createTestScrap({ id: 'scrap-2', clusterId: 'cluster-a' }),
        createTestScrap({ id: 'scrap-3', clusterId: 'cluster-b' }),
      ];

      const connections = graphBuilder.findConnections(scraps);

      const clusterConnection = connections.find(
        (c) =>
          c.type === 'cluster' &&
          ((c.sourceId === 'scrap-1' && c.targetId === 'scrap-2') ||
            (c.sourceId === 'scrap-2' && c.targetId === 'scrap-1'))
      );
      expect(clusterConnection).toBeDefined();
    });

    it('returns empty array for single scrap', () => {
      const scraps: Scrap[] = [createTestScrap({ id: 'scrap-1' })];

      const connections = graphBuilder.findConnections(scraps);

      expect(connections).toHaveLength(0);
    });
  });
});
