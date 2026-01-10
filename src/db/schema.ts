import Dexie, { type Table } from 'dexie';
import type { Scrap, Tag, Cluster, Connection, SmartView } from '@/types';

export class KnowledgeDatabase extends Dexie {
  scraps!: Table<Scrap>;
  tags!: Table<Tag>;
  clusters!: Table<Cluster>;
  connections!: Table<Connection>;
  smartViews!: Table<SmartView>;

  constructor() {
    super('KnowledgeScrapbook');

    this.version(1).stores({
      scraps: 'id, type, createdAt, updatedAt, clusterId, isPinned, *tags, *autoTags, *keywords',
      tags: 'id, slug, isSystem, usageCount',
      clusters: 'id, createdAt, updatedAt',
      connections: 'id, sourceId, targetId, type, [sourceId+targetId]',
    });

    this.version(2).stores({
      scraps: 'id, type, createdAt, updatedAt, clusterId, isPinned, readStatus, *tags, *autoTags, *keywords',
      tags: 'id, slug, isSystem, usageCount',
      clusters: 'id, createdAt, updatedAt',
      connections: 'id, sourceId, targetId, type, [sourceId+targetId]',
    });

    this.version(3).stores({
      scraps: 'id, type, createdAt, updatedAt, clusterId, isPinned, readStatus, lastViewedAt, *tags, *autoTags, *keywords',
      tags: 'id, slug, isSystem, usageCount',
      clusters: 'id, createdAt, updatedAt',
      connections: 'id, sourceId, targetId, type, [sourceId+targetId]',
    });

    this.version(4).stores({
      scraps: 'id, type, createdAt, updatedAt, clusterId, isPinned, readStatus, lastViewedAt, *tags, *autoTags, *keywords',
      tags: 'id, slug, isSystem, usageCount',
      clusters: 'id, createdAt, updatedAt',
      connections: 'id, sourceId, targetId, type, [sourceId+targetId]',
      smartViews: 'id, name, createdAt',
    });
  }
}

export const db = new KnowledgeDatabase();
