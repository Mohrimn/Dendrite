// ABOUTME: Builds graph data structures from scraps and their connections
// ABOUTME: Provides nodes and links for visualization in Three.js

import { v4 as uuid } from 'uuid';
import type { Scrap, ScrapType } from '@/types';
import type { Connection, ConnectionType } from '@/types/connection';

export interface GraphNode {
  id: string;
  type: ScrapType;
  label: string;
  x?: number;
  y?: number;
  z?: number;
  clusterId?: string;
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  type: ConnectionType;
  strength: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

function buildNodes(scraps: Scrap[]): GraphNode[] {
  return scraps.map((scrap) => ({
    id: scrap.id,
    type: scrap.type,
    label: scrap.title,
    clusterId: scrap.clusterId,
  }));
}

function buildLinks(connections: Connection[]): GraphLink[] {
  return connections.map((conn) => ({
    id: conn.id,
    source: conn.sourceId,
    target: conn.targetId,
    type: conn.type,
    strength: conn.strength,
  }));
}

function findTagConnections(scraps: Scrap[]): Connection[] {
  const connections: Connection[] = [];
  const now = new Date();

  const tagMap = new Map<string, string[]>();

  for (const scrap of scraps) {
    const allTags = new Set([...scrap.tags, ...scrap.autoTags]);
    for (const tag of allTags) {
      const list = tagMap.get(tag);
      if (list) {
        list.push(scrap.id);
      } else {
        tagMap.set(tag, [scrap.id]);
      }
    }
  }

  const pairCounts = new Map<string, { sourceId: string; targetId: string; count: number }>();

  for (const scrapIds of tagMap.values()) {
    for (let i = 0; i < scrapIds.length; i++) {
      for (let j = i + 1; j < scrapIds.length; j++) {
        const a = scrapIds[i];
        const b = scrapIds[j];
        const [sourceId, targetId] = a < b ? [a, b] : [b, a];
        const key = `${sourceId}|${targetId}`;
        const existing = pairCounts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          pairCounts.set(key, { sourceId, targetId, count: 1 });
        }
      }
    }
  }

  for (const { sourceId, targetId, count } of pairCounts.values()) {
    const strength = Math.min(1, count * 0.3);
    connections.push({
      id: uuid(),
      sourceId,
      targetId,
      type: 'tag',
      strength,
      createdAt: now,
    });
  }

  return connections;
}

function findClusterConnections(scraps: Scrap[]): Connection[] {
  const connections: Connection[] = [];
  const now = new Date();

  // Group scraps by cluster
  const clusterMap = new Map<string, Scrap[]>();
  for (const scrap of scraps) {
    if (scrap.clusterId) {
      const cluster = clusterMap.get(scrap.clusterId) || [];
      cluster.push(scrap);
      clusterMap.set(scrap.clusterId, cluster);
    }
  }

  // Create connections between scraps in same cluster
  for (const clusterScraps of clusterMap.values()) {
    for (let i = 0; i < clusterScraps.length; i++) {
      for (let j = i + 1; j < clusterScraps.length; j++) {
        connections.push({
          id: uuid(),
          sourceId: clusterScraps[i].id,
          targetId: clusterScraps[j].id,
          type: 'cluster',
          strength: 0.5,
          createdAt: now,
        });
      }
    }
  }

  return connections;
}

class GraphBuilder {
  build(scraps: Scrap[], connections: Connection[]): GraphData {
    return {
      nodes: buildNodes(scraps),
      links: buildLinks(connections),
    };
  }

  findConnections(scraps: Scrap[]): Connection[] {
    if (scraps.length < 2) {
      return [];
    }

    const tagConnections = findTagConnections(scraps);
    const clusterConnections = findClusterConnections(scraps);

    // Combine and deduplicate connections
    const allConnections = [...tagConnections, ...clusterConnections];

    // Remove duplicate connections between same pairs
    const seen = new Set<string>();
    return allConnections.filter((conn) => {
      const key = [conn.sourceId, conn.targetId].sort().join('-');
      const typeKey = `${key}:${conn.type}`;
      if (seen.has(typeKey)) return false;
      seen.add(typeKey);
      return true;
    });
  }
}

export const graphBuilder = new GraphBuilder();
