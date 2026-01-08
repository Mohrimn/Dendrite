// ABOUTME: Tests for the enrichment service
// ABOUTME: Validates scrap enrichment including auto-tag generation

import { describe, it, expect } from 'vitest';
import { enrichScrap } from './index';

describe('enrichScrap', () => {
  describe('autoTags', () => {
    it('does not duplicate user-selected tags in autoTags', async () => {
      const result = await enrichScrap({
        type: 'thought',
        title: 'Learning JavaScript and React',
        content: 'This is about javascript programming with react framework',
        tags: ['javascript', 'react'],
      });

      // autoTags should not contain tags already in user-selected tags
      for (const userTag of ['javascript', 'react']) {
        expect(result.autoTags).not.toContain(userTag);
      }
    });

    it('generates autoTags from content when no user tags provided', async () => {
      const result = await enrichScrap({
        type: 'thought',
        title: 'Learning JavaScript',
        content: 'This is about javascript programming with typescript',
      });

      // Should have some autoTags generated
      expect(result.autoTags.length).toBeGreaterThan(0);
    });
  });
});
