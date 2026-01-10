// ABOUTME: Tests for scrap repository operations
// ABOUTME: Validates CRUD and read status functionality

import { describe, it, expect, beforeEach } from 'vitest';
import { scrapRepository } from './scrapRepository';
import { db } from '../schema';

describe('scrapRepository', () => {
  beforeEach(async () => {
    await db.scraps.clear();
  });

  describe('readStatus', () => {
    it('sets readStatus to unread when creating a link scrap', async () => {
      const scrap = await scrapRepository.create({
        type: 'link',
        title: 'Test Link',
        content: 'Test content',
        url: 'https://example.com',
      });

      expect(scrap.readStatus).toBe('unread');
    });

    it('does not set readStatus for non-link scraps', async () => {
      const scrap = await scrapRepository.create({
        type: 'thought',
        title: 'Test Thought',
        content: 'Test content',
      });

      expect(scrap.readStatus).toBeUndefined();
    });

    it('toggles readStatus from unread to read', async () => {
      const scrap = await scrapRepository.create({
        type: 'link',
        title: 'Test Link',
        content: 'Test content',
        url: 'https://example.com',
      });

      await scrapRepository.toggleReadStatus(scrap.id);
      const updated = await scrapRepository.getById(scrap.id);

      expect(updated?.readStatus).toBe('read');
    });

    it('toggles readStatus from read back to unread', async () => {
      const scrap = await scrapRepository.create({
        type: 'link',
        title: 'Test Link',
        content: 'Test content',
        url: 'https://example.com',
      });

      await scrapRepository.toggleReadStatus(scrap.id);
      await scrapRepository.toggleReadStatus(scrap.id);
      const updated = await scrapRepository.getById(scrap.id);

      expect(updated?.readStatus).toBe('unread');
    });

    it('does nothing when toggling readStatus on non-link scrap', async () => {
      const scrap = await scrapRepository.create({
        type: 'thought',
        title: 'Test Thought',
        content: 'Test content',
      });

      await scrapRepository.toggleReadStatus(scrap.id);
      const updated = await scrapRepository.getById(scrap.id);

      expect(updated?.readStatus).toBeUndefined();
    });

    it('filters scraps by read status', async () => {
      const link1 = await scrapRepository.create({
        type: 'link',
        title: 'Link 1',
        content: 'Content',
        url: 'https://example1.com',
      });
      await scrapRepository.create({
        type: 'link',
        title: 'Link 2',
        content: 'Content',
        url: 'https://example2.com',
      });

      // Mark first link as read
      await scrapRepository.toggleReadStatus(link1.id);

      const unread = await scrapRepository.getByReadStatus('unread');
      const read = await scrapRepository.getByReadStatus('read');

      expect(unread).toHaveLength(1);
      expect(unread[0].title).toBe('Link 2');
      expect(read).toHaveLength(1);
      expect(read[0].title).toBe('Link 1');
    });
  });
});
