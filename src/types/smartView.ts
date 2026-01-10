// ABOUTME: Type definition for saved filter combinations
// ABOUTME: Allows users to create reusable filter presets

import type { ScrapType, ReadStatus } from './scrap';

export interface SmartViewFilters {
  types?: ScrapType[];
  tags?: string[];
  readStatus?: ReadStatus;
  isPinned?: boolean;
}

export interface SmartView {
  id: string;
  name: string;
  filters: SmartViewFilters;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSmartViewInput = Pick<SmartView, 'name' | 'filters' | 'icon'>;
