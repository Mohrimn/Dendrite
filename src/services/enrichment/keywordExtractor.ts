// Stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
  'have', 'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'can', 'should', 'now', 'also', 'into', 'could', 'would',
  'there', 'their', 'then', 'these', 'your', 'you', 'our', 'out', 'about',
  'up', 'down', 'if', 'or', 'because', 'any', 'been', 'being', 'between',
  'did', 'do', 'does', 'doing', 'during', 'get', 'got', 'here', 'him',
  'his', 'her', 'hers', 'i', 'me', 'my', 'myself', 'we', 'us', 'she',
  'over', 'under', 'again', 'further', 'once', 'through', 'before', 'after',
]);

// Common programming terms to boost
const TECH_TERMS = new Set([
  'api', 'react', 'vue', 'angular', 'javascript', 'typescript', 'python',
  'node', 'css', 'html', 'database', 'sql', 'nosql', 'mongodb', 'postgres',
  'docker', 'kubernetes', 'aws', 'cloud', 'server', 'client', 'frontend',
  'backend', 'fullstack', 'algorithm', 'function', 'component', 'module',
  'package', 'library', 'framework', 'testing', 'debug', 'deploy', 'git',
  'github', 'npm', 'yarn', 'webpack', 'vite', 'build', 'compile', 'runtime',
]);

interface ExtractedKeyword {
  word: string;
  score: number;
  count: number;
}

export function extractKeywords(text: string, maxKeywords = 10): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Tokenize and normalize
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  // Count frequencies
  const frequencies = new Map<string, number>();
  for (const word of words) {
    frequencies.set(word, (frequencies.get(word) || 0) + 1);
  }

  // Score keywords
  const keywords: ExtractedKeyword[] = [];
  const totalWords = words.length;

  for (const [word, count] of frequencies) {
    // Base score is term frequency
    let score = count / totalWords;

    // Boost technical terms
    if (TECH_TERMS.has(word)) {
      score *= 1.5;
    }

    // Boost longer words (likely more meaningful)
    if (word.length > 6) {
      score *= 1.2;
    }

    // Boost words that appear multiple times
    if (count > 1) {
      score *= 1 + Math.log(count) * 0.2;
    }

    keywords.push({ word, score, count });
  }

  // Sort by score and return top keywords
  return keywords
    .sort((a, b) => b.score - a.score)
    .slice(0, maxKeywords)
    .map((k) => k.word);
}

export function suggestTags(text: string, existingTags: string[] = []): string[] {
  const keywords = extractKeywords(text, 15);

  // Filter out existing tags and very short words
  const suggestions = keywords.filter(
    (kw) => kw.length > 3 && !existingTags.includes(kw)
  );

  return suggestions.slice(0, 5);
}

// Extract potential tags from URL
export function extractUrlTags(url: string): string[] {
  try {
    const urlObj = new URL(url);
    const tags: string[] = [];

    // Extract domain-based tags
    const domain = urlObj.hostname.replace('www.', '');

    // Known platform tags
    const platformMap: Record<string, string> = {
      'github.com': 'github',
      'stackoverflow.com': 'stackoverflow',
      'medium.com': 'medium',
      'dev.to': 'devto',
      'youtube.com': 'youtube',
      'twitter.com': 'twitter',
      'x.com': 'twitter',
      'reddit.com': 'reddit',
      'linkedin.com': 'linkedin',
      'notion.so': 'notion',
      'figma.com': 'figma',
      'dribbble.com': 'dribbble',
      'codepen.io': 'codepen',
      'npmjs.com': 'npm',
      'docs.google.com': 'google-docs',
    };

    if (platformMap[domain]) {
      tags.push(platformMap[domain]);
    }

    // Extract path-based keywords
    const pathParts = urlObj.pathname
      .split('/')
      .filter((p) => p.length > 2 && !p.match(/^\d+$/));

    for (const part of pathParts.slice(0, 3)) {
      const cleaned = part.replace(/[-_]/g, ' ').toLowerCase();
      if (cleaned.length > 2 && !STOP_WORDS.has(cleaned)) {
        tags.push(cleaned);
      }
    }

    return [...new Set(tags)].slice(0, 5);
  } catch {
    return [];
  }
}
