import type { CreateScrapInput, ScrapType } from '@/types';
import { extractKeywords, suggestTags, extractUrlTags } from './keywordExtractor';
import { normalizeUrl, generateTitleFromUrl, fetchLinkMeta, isPrimarylyUrl } from './linkParser';

export interface EnrichmentResult {
  type: ScrapType;
  title: string;
  content: string;
  url?: string;
  autoTags: string[];
  keywords: string[];
}

export async function enrichScrap(input: CreateScrapInput): Promise<EnrichmentResult> {
  let { type, title, content } = input;
  let url = input.url;
  let autoTags: string[] = [];
  let keywords: string[] = [];

  // Auto-detect type if content looks like a URL
  if (type === 'thought' && isPrimarylyUrl(content)) {
    type = 'link';
    url = normalizeUrl(content.trim());
    content = '';
  }

  // Handle link type
  if (type === 'link' && url) {
    url = normalizeUrl(url);

    // Generate title from URL if not provided
    if (!title || title === 'New link') {
      title = generateTitleFromUrl(url);
    }

    // Extract URL-based tags
    const urlTags = extractUrlTags(url);
    autoTags.push(...urlTags);

    // Fetch link metadata (title, description, etc.)
    const meta = await fetchLinkMeta(url);
    if (meta?.title && (!title || title === generateTitleFromUrl(url))) {
      title = meta.title;
    }
  }

  // Extract keywords from content
  const textToAnalyze = [title, content].filter(Boolean).join(' ');
  keywords = extractKeywords(textToAnalyze, 10);

  // Generate auto-tags from keywords (excluding user-selected tags to avoid duplicates)
  const existingTags = [...autoTags, ...(input.tags || [])];
  const suggestedTags = suggestTags(textToAnalyze, existingTags);
  autoTags.push(...suggestedTags);

  // Add type-specific tags
  if (type === 'snippet') {
    // Detect programming language (basic heuristics)
    const langTag = detectCodeLanguage(content);
    if (langTag && !autoTags.includes(langTag)) {
      autoTags.unshift(langTag);
    }
  }

  // Dedupe and limit tags
  autoTags = [...new Set(autoTags)].slice(0, 5);

  // Generate default title if empty
  if (!title || title.trim() === '') {
    title = generateDefaultTitle(type, content);
  }

  return {
    type,
    title,
    content,
    url,
    autoTags,
    keywords,
  };
}

function generateDefaultTitle(type: ScrapType, content: string): string {
  switch (type) {
    case 'thought':
      // Use first line or first N characters
      const firstLine = content.split('\n')[0].trim();
      if (firstLine.length <= 50) return firstLine || 'Quick thought';
      return firstLine.slice(0, 47) + '...';

    case 'snippet':
      return 'Code snippet';

    case 'note':
      const notePreview = content.split('\n')[0].trim();
      if (notePreview.length <= 50) return notePreview || 'Note';
      return notePreview.slice(0, 47) + '...';

    case 'link':
      return 'Saved link';

    case 'image':
      return 'Image';

    default:
      return 'Untitled';
  }
}

function detectCodeLanguage(code: string): string | null {
  const patterns: [RegExp, string][] = [
    [/^import\s+.*\s+from\s+['"]|^export\s+(default\s+)?/m, 'javascript'],
    [/^from\s+\w+\s+import|^def\s+\w+\s*\(|^class\s+\w+.*:/m, 'python'],
    [/^package\s+\w+|^import\s+".*"|^func\s+\w+/m, 'go'],
    [/^use\s+\w+::|^fn\s+\w+|^let\s+mut\s+/m, 'rust'],
    [/^<\?php|^\$\w+\s*=/m, 'php'],
    [/^<!DOCTYPE|^<html|^<div|^<script/im, 'html'],
    [/^@import|^@media|^\.[a-z][\w-]*\s*\{|^#[a-z][\w-]*\s*\{/m, 'css'],
    [/^SELECT\s+|^INSERT\s+INTO|^UPDATE\s+|^CREATE\s+TABLE/im, 'sql'],
    [/^\s*\{[\s\S]*"[\w]+":/m, 'json'],
    [/^---\n|^apiVersion:|^kind:/m, 'yaml'],
    [/^#!\s*\/bin\/(bash|sh)|^\s*if\s*\[\[/m, 'bash'],
  ];

  for (const [pattern, lang] of patterns) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  return null;
}

export { extractKeywords, suggestTags, extractUrlTags } from './keywordExtractor';
export { isValidUrl, normalizeUrl, extractDomain, fetchLinkMeta, extractUrls } from './linkParser';
