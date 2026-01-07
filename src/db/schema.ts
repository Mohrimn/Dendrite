import Dexie, { type Table } from 'dexie';
import type { Scrap, Tag, Cluster, Connection } from '@/types';

export class KnowledgeDatabase extends Dexie {
  scraps!: Table<Scrap>;
  tags!: Table<Tag>;
  clusters!: Table<Cluster>;
  connections!: Table<Connection>;

  constructor() {
    super('KnowledgeScrapbook');

    this.version(1).stores({
      scraps: 'id, type, createdAt, updatedAt, clusterId, isPinned, *tags, *autoTags, *keywords',
      tags: 'id, slug, isSystem, usageCount',
      clusters: 'id, createdAt, updatedAt',
      connections: 'id, sourceId, targetId, type, [sourceId+targetId]',
    });
  }
}

export const db = new KnowledgeDatabase();
