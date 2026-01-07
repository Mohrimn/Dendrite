import { db } from '../schema';
import type { Tag, CreateTagInput } from '@/types';
import { v4 as uuid } from 'uuid';
import { slugify } from '@/lib/utils';

export const tagRepository = {
  async create(input: CreateTagInput): Promise<Tag> {
    const tag: Tag = {
      id: uuid(),
      name: input.name,
      slug: slugify(input.name),
      color: input.color,
      isSystem: input.isSystem || false,
      usageCount: 0,
      createdAt: new Date(),
    };

    await db.tags.add(tag);
    return tag;
  },

  async getById(id: string): Promise<Tag | undefined> {
    return db.tags.get(id);
  },

  async getBySlug(slug: string): Promise<Tag | undefined> {
    return db.tags.where('slug').equals(slug).first();
  },

  async getAll(): Promise<Tag[]> {
    return db.tags.orderBy('usageCount').reverse().toArray();
  },

  async getSystemTags(): Promise<Tag[]> {
    return db.tags.where('isSystem').equals(1).toArray();
  },

  async incrementUsage(id: string): Promise<void> {
    const tag = await db.tags.get(id);
    if (tag) {
      await db.tags.update(id, { usageCount: tag.usageCount + 1 });
    }
  },

  async decrementUsage(id: string): Promise<void> {
    const tag = await db.tags.get(id);
    if (tag && tag.usageCount > 0) {
      await db.tags.update(id, { usageCount: tag.usageCount - 1 });
    }
  },

  async delete(id: string): Promise<void> {
    await db.tags.delete(id);
  },
};
