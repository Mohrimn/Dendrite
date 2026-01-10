// ABOUTME: CRUD operations for saved filter views
// ABOUTME: Persists smart views to IndexedDB

import { db } from '../schema';
import type { SmartView, CreateSmartViewInput } from '@/types';
import { v4 as uuid } from 'uuid';

export const smartViewRepository = {
  async create(input: CreateSmartViewInput): Promise<SmartView> {
    const now = new Date();
    const smartView: SmartView = {
      id: uuid(),
      name: input.name,
      filters: input.filters,
      icon: input.icon,
      createdAt: now,
      updatedAt: now,
    };
    await db.smartViews.add(smartView);
    return smartView;
  },

  async update(id: string, updates: Partial<SmartView>): Promise<void> {
    await db.smartViews.update(id, { ...updates, updatedAt: new Date() });
  },

  async delete(id: string): Promise<void> {
    await db.smartViews.delete(id);
  },

  async getAll(): Promise<SmartView[]> {
    return db.smartViews.orderBy('name').toArray();
  },

  async getById(id: string): Promise<SmartView | undefined> {
    return db.smartViews.get(id);
  },
};
