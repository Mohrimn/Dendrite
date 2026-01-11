import { db } from '../schema';
import { tagRepository } from './tagRepository';
import type { Scrap, ScrapType, CreateScrapInput, UpdateScrapInput, ReadStatus } from '@/types';
import { v4 as uuid } from 'uuid';
import { slugify } from '@/lib/utils';

function buildSearchableText(scrap: Partial<Scrap>): string {
  return [
    scrap.title || '',
    scrap.content || '',
    ...(scrap.keywords || []),
    ...(scrap.tags || []),
    scrap.linkMeta?.title || '',
    scrap.linkMeta?.description || '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function buildTagSet(tags?: string[]): Set<string> {
  return new Set((tags || []).map((tag) => tag.trim()).filter(Boolean));
}

async function updateTagUsage(previous?: Scrap, next?: Scrap): Promise<void> {
  const previousTags = buildTagSet(previous?.tags);
  const previousAutoTags = buildTagSet(previous?.autoTags);
  const nextTags = buildTagSet(next?.tags);
  const nextAutoTags = buildTagSet(next?.autoTags);

  const previousAll = new Set([...previousTags, ...previousAutoTags]);
  const nextAll = new Set([...nextTags, ...nextAutoTags]);

  const added = [...nextAll].filter((tag) => !previousAll.has(tag));
  const removed = [...previousAll].filter((tag) => !nextAll.has(tag));

  for (const tag of added) {
    const isSystem = !nextTags.has(tag);
    const ensured = await tagRepository.ensureTag(tag, isSystem);
    await tagRepository.incrementUsage(ensured.id);
  }

  for (const tag of removed) {
    const existing = await tagRepository.getBySlug(slugify(tag));
    if (existing) {
      await tagRepository.decrementUsage(existing.id);
    }
  }
}

export const scrapRepository = {
  async create(input: CreateScrapInput): Promise<Scrap> {
    const now = new Date();
    const scrap: Scrap = {
      id: uuid(),
      type: input.type,
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now,
      url: input.url,
      imageData: input.imageData,
      tags: input.tags || [],
      autoTags: [],
      keywords: [],
      connectionIds: [],
      isPinned: false,
      color: input.color,
      searchableText: '',
      readStatus: input.type === 'link' ? 'unread' : undefined,
    };
    scrap.searchableText = buildSearchableText(scrap);

    await db.scraps.add(scrap);
    await updateTagUsage(undefined, scrap);
    return scrap;
  },

  async update(id: string, updates: UpdateScrapInput): Promise<void> {
    const scrap = await db.scraps.get(id);
    if (!scrap) return;

    const updatedScrap = { ...scrap, ...updates, updatedAt: new Date() };
    updatedScrap.searchableText = buildSearchableText(updatedScrap);

    await db.scraps.update(id, updatedScrap);
    await updateTagUsage(scrap, updatedScrap);
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.scraps, db.connections, db.tags], async () => {
      const scrap = await db.scraps.get(id);
      if (scrap) {
        await updateTagUsage(scrap, undefined);
      }
      await db.connections.where('sourceId').equals(id).delete();
      await db.connections.where('targetId').equals(id).delete();
      await db.scraps.delete(id);
    });
  },

  async getById(id: string): Promise<Scrap | undefined> {
    return db.scraps.get(id);
  },

  async getAll(): Promise<Scrap[]> {
    return db.scraps.orderBy('updatedAt').reverse().toArray();
  },

  async getByType(type: ScrapType): Promise<Scrap[]> {
    return db.scraps.where('type').equals(type).toArray();
  },

  async getByCluster(clusterId: string): Promise<Scrap[]> {
    return db.scraps.where('clusterId').equals(clusterId).toArray();
  },

  async getByTag(tagId: string): Promise<Scrap[]> {
    return db.scraps.where('tags').equals(tagId).toArray();
  },

  async getPinned(): Promise<Scrap[]> {
    return db.scraps.where('isPinned').equals(1).or('isPinned').equals(1).toArray();
  },

  async getRecent(limit = 20): Promise<Scrap[]> {
    return db.scraps.orderBy('createdAt').reverse().limit(limit).toArray();
  },

  async count(): Promise<number> {
    return db.scraps.count();
  },

  async togglePin(id: string): Promise<void> {
    const scrap = await db.scraps.get(id);
    if (scrap) {
      await db.scraps.update(id, { isPinned: !scrap.isPinned });
    }
  },

  async toggleReadStatus(id: string): Promise<void> {
    const scrap = await db.scraps.get(id);
    if (scrap && scrap.type === 'link') {
      const newStatus: ReadStatus = scrap.readStatus === 'read' ? 'unread' : 'read';
      await db.scraps.update(id, { readStatus: newStatus });
    }
  },

  async getByReadStatus(status: ReadStatus): Promise<Scrap[]> {
    return db.scraps.where('readStatus').equals(status).toArray();
  },

  async recordView(id: string): Promise<void> {
    const scrap = await db.scraps.get(id);
    if (scrap) {
      await db.scraps.update(id, {
        lastViewedAt: new Date(),
        viewCount: (scrap.viewCount || 0) + 1,
      });
    }
  },
};
