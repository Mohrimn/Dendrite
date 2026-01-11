import { db } from '../schema';
import type { Tag, CreateTagInput } from '@/types';
import { v4 as uuid } from 'uuid';
import { slugify } from '@/lib/utils';

const DEFAULT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

function getColorForTag(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

async function createTag(input: CreateTagInput): Promise<Tag> {
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
}

async function ensureTag(name: string, isSystem = false): Promise<Tag> {
  const slug = slugify(name);
  const existing = await db.tags.where('slug').equals(slug).first();
  if (existing) {
    if (!isSystem && existing.isSystem) {
      await db.tags.update(existing.id, { isSystem: false });
      return { ...existing, isSystem: false };
    }
    return existing;
  }

  return createTag({
    name,
    color: getColorForTag(name),
    isSystem,
  });
}

export const tagRepository = {
  create: createTag,

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
    return db.tags.where('isSystem').equals(1).or('isSystem').equals(1).toArray();
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

  ensureTag,
};
