import MiniSearch, { type SearchResult as MiniSearchResult } from 'minisearch';
import type { Scrap, ScrapType } from '@/types';

interface IndexDocument {
  id: string;
  type: ScrapType;
  title: string;
  content: string;
  searchableText: string;
  keywords: string;
}

export interface SearchResult {
  id: string;
  type: ScrapType;
  title: string;
  content: string;
  score: number;
  match: Record<string, string[]>;
  terms: string[];
}

export interface SearchOptions {
  types?: ScrapType[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

class SearchService {
  private index: MiniSearch<IndexDocument>;
  private documents: Map<string, Scrap> = new Map();

  constructor() {
    this.index = new MiniSearch<IndexDocument>({
      fields: ['title', 'content', 'searchableText', 'keywords'],
      storeFields: ['id', 'type', 'title', 'content'],
      searchOptions: {
        boost: { title: 2, keywords: 1.5 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
  }

  async indexAll(scraps: Scrap[]): Promise<void> {
    this.index.removeAll();
    this.documents.clear();

    const documentsToIndex = scraps.map((scrap) => {
      this.documents.set(scrap.id, scrap);
      return {
        id: scrap.id,
        type: scrap.type,
        title: scrap.title,
        content: scrap.content,
        searchableText: scrap.searchableText,
        keywords: scrap.keywords.join(' '),
      };
    });

    this.index.addAll(documentsToIndex);
  }

  addDocument(scrap: Scrap): void {
    this.documents.set(scrap.id, scrap);
    this.index.add({
      id: scrap.id,
      type: scrap.type,
      title: scrap.title,
      content: scrap.content,
      searchableText: scrap.searchableText,
      keywords: scrap.keywords.join(' '),
    });
  }

  updateDocument(scrap: Scrap): void {
    this.removeDocument(scrap.id);
    this.addDocument(scrap);
  }

  removeDocument(id: string): void {
    const doc = this.documents.get(id);
    if (doc) {
      this.index.discard(id);
      this.documents.delete(id);
    }
  }

  search(query: string, options?: SearchOptions): SearchResult[] {
    if (!query.trim()) return [];

    let results = this.index.search(query, {
      boost: { title: 2, keywords: 1.5 },
      fuzzy: 0.2,
      prefix: true,
    }) as MiniSearchResult[];

    // Apply filters
    if (options) {
      results = results.filter((result) => {
        const scrap = this.documents.get(result.id);
        if (!scrap) return false;

        // Filter by type
        if (options.types && options.types.length > 0) {
          if (!options.types.includes(scrap.type)) return false;
        }

        // Filter by tags
        if (options.tags && options.tags.length > 0) {
          const scrapTags = [...scrap.tags, ...scrap.autoTags];
          if (!options.tags.some((tag) => scrapTags.includes(tag))) return false;
        }

        // Filter by date range
        if (options.dateFrom) {
          if (new Date(scrap.createdAt) < options.dateFrom) return false;
        }
        if (options.dateTo) {
          if (new Date(scrap.createdAt) > options.dateTo) return false;
        }

        return true;
      });
    }

    // Apply limit
    const limit = options?.limit ?? 50;
    results = results.slice(0, limit);

    return results.map((result) => ({
      id: result.id,
      type: result.type as ScrapType,
      title: result.title as string,
      content: result.content as string,
      score: result.score,
      match: result.match,
      terms: result.terms,
    }));
  }

  autoSuggest(query: string, limit = 5): string[] {
    if (!query.trim()) return [];

    const results = this.index.autoSuggest(query, {
      fuzzy: 0.2,
    });

    return results.slice(0, limit).map((r) => r.suggestion);
  }

  getDocument(id: string): Scrap | undefined {
    return this.documents.get(id);
  }
}

export const searchService = new SearchService();
