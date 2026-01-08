/**
 * Test seed data for the Knowledge Scrapbook
 * Run this to populate the app with sample scraps for testing
 */

import type { CreateScrapInput } from '@/types';

export const testScraps: CreateScrapInput[] = [
  // === PROGRAMMING / REACT CLUSTER ===
  {
    type: 'thought',
    title: 'React Server Components',
    content: 'Server Components allow rendering on the server without sending JavaScript to the client. This is huge for performance. Need to explore how this changes data fetching patterns.',
    tags: ['react', 'performance'],
  },
  {
    type: 'link',
    title: 'React 19 Documentation',
    content: 'Official React 19 docs with new features like Actions, useOptimistic, and improved Suspense.',
    url: 'https://react.dev',
    tags: ['react', 'documentation'],
  },
  {
    type: 'snippet',
    title: 'Custom React Hook for Local Storage',
    content: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}`,
    tags: ['react', 'hooks', 'typescript'],
  },
  {
    type: 'note',
    title: 'Component Design Principles',
    content: '1. Single Responsibility - each component does one thing well\n2. Composition over inheritance\n3. Props down, events up\n4. Keep state as local as possible\n5. Derive state when you can instead of syncing',
    tags: ['react', 'architecture'],
  },

  // === MACHINE LEARNING / AI CLUSTER ===
  {
    type: 'thought',
    title: 'Transformer Architecture Insights',
    content: 'The key insight of transformers is self-attention - allowing each token to attend to all other tokens. This parallelization was the breakthrough that enabled training on massive datasets.',
    tags: ['machine-learning', 'transformers'],
  },
  {
    type: 'link',
    title: 'Attention Is All You Need Paper',
    content: 'The foundational paper introducing the Transformer architecture that revolutionized NLP and now powers models like GPT and Claude.',
    url: 'https://arxiv.org/abs/1706.03762',
    tags: ['machine-learning', 'research'],
  },
  {
    type: 'note',
    title: 'LLM Prompting Best Practices',
    content: '- Be specific and clear in instructions\n- Provide examples (few-shot learning)\n- Break complex tasks into steps\n- Use structured output formats\n- Include context and constraints\n- Ask for reasoning before answers',
    tags: ['ai', 'prompting'],
  },
  {
    type: 'thought',
    title: 'Embeddings are Compressed Meaning',
    content: 'Vector embeddings capture semantic meaning in high-dimensional space. Similar concepts cluster together. This is why RAG works - you can find relevant context by measuring distance in embedding space.',
    tags: ['machine-learning', 'embeddings'],
  },
  {
    type: 'snippet',
    title: 'Cosine Similarity Function',
    content: `function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}`,
    tags: ['machine-learning', 'algorithms'],
  },

  // === DESIGN / UX CLUSTER ===
  {
    type: 'thought',
    title: 'The 60-30-10 Color Rule',
    content: 'Use 60% dominant color (usually neutral), 30% secondary color, and 10% accent color. This creates visual hierarchy and prevents overwhelming the user.',
    tags: ['design', 'color'],
  },
  {
    type: 'link',
    title: 'Refactoring UI Tips',
    content: 'Practical design tips for developers. Covers spacing, typography, color, and layout fundamentals.',
    url: 'https://www.refactoringui.com',
    tags: ['design', 'ui'],
  },
  {
    type: 'note',
    title: 'Accessibility Checklist',
    content: '- Color contrast ratio 4.5:1 minimum\n- All interactive elements keyboard accessible\n- Images have alt text\n- Form inputs have labels\n- Focus states visible\n- Skip navigation link\n- Semantic HTML structure',
    tags: ['accessibility', 'ux'],
  },
  {
    type: 'thought',
    title: 'Microinteractions Matter',
    content: 'Small animations and feedback loops make interfaces feel alive and responsive. A button that subtly scales on press, a success checkmark animation - these details build trust and delight.',
    tags: ['design', 'animation'],
  },

  // === PRODUCTIVITY / WORKFLOWS CLUSTER ===
  {
    type: 'thought',
    title: 'Second Brain Methodology',
    content: 'The idea of offloading knowledge to an external system. Capture everything, organize later. The goal is to free mental RAM for creative thinking rather than remembering.',
    tags: ['productivity', 'note-taking'],
  },
  {
    type: 'note',
    title: 'Daily Review Template',
    content: '## Morning\n- Top 3 priorities for today\n- Blocked time for deep work\n\n## Evening\n- What went well?\n- What could improve?\n- Tomorrow\'s most important task',
    tags: ['productivity', 'habits'],
  },
  {
    type: 'link',
    title: 'Getting Things Done Summary',
    content: 'David Allen\'s GTD methodology - capture, clarify, organize, reflect, engage. The key is getting everything out of your head into a trusted system.',
    url: 'https://gettingthingsdone.com',
    tags: ['productivity', 'gtd'],
  },
  {
    type: 'thought',
    title: 'Context Switching Cost',
    content: 'It takes 23 minutes on average to fully regain focus after an interruption. Batch similar tasks together. Protect deep work time. Notifications are the enemy of flow state.',
    tags: ['productivity', 'focus'],
  },

  // === TYPESCRIPT / JAVASCRIPT CLUSTER ===
  {
    type: 'snippet',
    title: 'TypeScript Utility Types',
    content: `// Make all properties optional
type Partial<T> = { [P in keyof T]?: T[P] };

// Make all properties required
type Required<T> = { [P in keyof T]-?: T[P] };

// Pick specific properties
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

// Omit specific properties
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;`,
    tags: ['typescript', 'types'],
  },
  {
    type: 'thought',
    title: 'Discriminated Unions Pattern',
    content: 'Use a common literal property to discriminate between union members. TypeScript narrows the type automatically. Perfect for state machines and API responses.',
    tags: ['typescript', 'patterns'],
  },
  {
    type: 'snippet',
    title: 'Debounce Function Implementation',
    content: `function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}`,
    tags: ['javascript', 'utilities'],
  },
  {
    type: 'note',
    title: 'ES2024 New Features',
    content: '- Array grouping (Object.groupBy)\n- Promise.withResolvers()\n- Well-formed Unicode strings\n- Atomics.waitAsync\n- RegExp v flag for set notation',
    tags: ['javascript', 'es2024'],
  },

  // === DATABASE / BACKEND CLUSTER ===
  {
    type: 'thought',
    title: 'IndexedDB for Offline-First',
    content: 'IndexedDB is the only browser storage that supports structured data, transactions, and large datasets. Perfect for offline-first apps. Dexie.js makes the API much nicer.',
    tags: ['database', 'offline'],
  },
  {
    type: 'snippet',
    title: 'PostgreSQL Full-Text Search',
    content: `-- Create search index
CREATE INDEX articles_search_idx ON articles
USING GIN (to_tsvector('english', title || ' ' || content));

-- Search query
SELECT * FROM articles
WHERE to_tsvector('english', title || ' ' || content)
  @@ plainto_tsquery('english', 'search terms');`,
    tags: ['postgresql', 'search'],
  },
  {
    type: 'note',
    title: 'Database Indexing Rules',
    content: '1. Index columns used in WHERE clauses\n2. Index foreign keys\n3. Consider composite indexes for multi-column queries\n4. Don\'t over-index - writes become slower\n5. Monitor slow queries and add indexes as needed',
    tags: ['database', 'performance'],
  },
  {
    type: 'link',
    title: 'SQLite is Enough',
    content: 'For most applications, SQLite provides everything you need. It handles concurrent reads well and can scale further than most people think.',
    url: 'https://www.sqlite.org/whentouse.html',
    tags: ['database', 'sqlite'],
  },

  // === RANDOM THOUGHTS / MISC ===
  {
    type: 'thought',
    title: 'Chesterton\'s Fence',
    content: 'Before removing something, understand why it was put there. Don\'t refactor code you don\'t understand. The previous developer might have known something you don\'t.',
    tags: ['philosophy', 'engineering'],
  },
  {
    type: 'thought',
    title: 'Worse is Better',
    content: 'Simple, slightly wrong solutions often beat complex, correct ones. Unix philosophy - do one thing well. Ship early, iterate. Perfection is the enemy of done.',
    tags: ['philosophy', 'simplicity'],
  },
  {
    type: 'note',
    title: 'Code Review Checklist',
    content: '- Does it solve the problem?\n- Is it readable and maintainable?\n- Are there tests?\n- Any security concerns?\n- Performance implications?\n- Error handling?\n- Documentation needed?',
    tags: ['engineering', 'process'],
  },
];

/**
 * Seed the database with test scraps
 * This function should be called from a component or dev tools
 */
export async function seedTestData(
  createScrap: (input: CreateScrapInput) => Promise<any>
): Promise<void> {
  console.log('Seeding test data...');

  for (const scrap of testScraps) {
    try {
      await createScrap(scrap);
      console.log(`Created: ${scrap.title}`);
    } catch (error) {
      console.error(`Failed to create: ${scrap.title}`, error);
    }
  }

  console.log(`Seeding complete! Created ${testScraps.length} scraps.`);
}
