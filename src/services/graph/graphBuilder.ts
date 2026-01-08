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

  for (let i = 0; i < scraps.length; i++) {
    for (let j = i + 1; j < scraps.length; j++) {
      const scrapA = scraps[i];
      const scrapB = scraps[j];

      // Find shared tags
      const allTagsA = [...scrapA.tags, ...scrapA.autoTags];
      const allTagsB = [...scrapB.tags, ...scrapB.autoTags];
      const sharedTags = allTagsA.filter((tag) => allTagsB.includes(tag));

      if (sharedTags.length > 0) {
        // Strength based on number of shared tags
        const strength = Math.min(1, sharedTags.length * 0.3);
        connections.push({
          id: uuid(),
          sourceId: scrapA.id,
          targetId: scrapB.id,
          type: 'tag',
          strength,
          createdAt: now,
        });
      }
    }
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
