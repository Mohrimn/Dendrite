import type { LinkMeta } from '@/types';

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

export function isValidUrl(text: string): boolean {
  try {
    new URL(text.startsWith('http') ? text : `https://${text}`);
    return URL_REGEX.test(text);
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(normalizeUrl(url));
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

// Generate a title from URL if none provided
export function generateTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(normalizeUrl(url));
    const domain = urlObj.hostname.replace('www.', '');

    // Extract path for title
    const pathParts = urlObj.pathname
      .split('/')
      .filter((p) => p && p.length > 0)
      .map((p) => p.replace(/[-_]/g, ' '))
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1));

    if (pathParts.length > 0) {
      return `${pathParts.slice(-2).join(' - ')} | ${domain}`;
    }

    return domain;
  } catch {
    return url;
  }
}

// Fetch Open Graph metadata from URL
// Note: This requires a CORS proxy or backend in production
export async function fetchLinkMeta(url: string): Promise<LinkMeta | null> {
  try {
    const normalizedUrl = normalizeUrl(url);
    const domain = extractDomain(normalizedUrl);

    // For now, return basic metadata without fetching
    // In production, you'd use a backend API or CORS proxy
    return {
      title: generateTitleFromUrl(normalizedUrl),
      description: '',
      image: '',
      domain,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    };
  } catch {
    return null;
  }
}

// Detect URLs in text content
export function extractUrls(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const matches = text.match(urlPattern);
  return matches ? [...new Set(matches)] : [];
}

// Check if content is primarily a URL
export function isPrimarylyUrl(content: string): boolean {
  const trimmed = content.trim();
  if (isValidUrl(trimmed)) {
    return true;
  }

  // Check if content is mostly a single URL
  const urls = extractUrls(content);
  if (urls.length === 1) {
    const urlLength = urls[0].length;
    const contentLength = trimmed.length;
    return urlLength / contentLength > 0.8;
  }

  return false;
}
