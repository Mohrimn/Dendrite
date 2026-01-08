import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore, useScraps } from '@/store';
import { searchService, type SearchResult, type SearchOptions } from '@/services/search';
import { useKeyboardShortcut } from '@/hooks';
import { cn } from '@/lib/utils';
import type { ScrapType } from '@/types';

const TYPE_ICONS: Record<ScrapType, JSX.Element> = {
  thought: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  link: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
  snippet: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  note: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  ),
};

const TYPE_COLORS: Record<ScrapType, string> = {
  thought: '#8b5cf6',
  link: '#06b6d4',
  image: '#f59e0b',
  snippet: '#10b981',
  note: '#ec4899',
};

interface SearchFilters {
  types: ScrapType[];
  tags: string[];
}

export function SearchOverlay() {
  const navigate = useNavigate();
  const searchOpen = useStore((state) => state.searchOpen);
  const toggleSearch = useStore((state) => state.toggleSearch);
  const selectScrap = useStore((state) => state.selectScrap);
  const scraps = useScraps();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({ types: [], tags: [] });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Index scraps when they change
  useEffect(() => {
    if (scraps.length > 0) {
      searchService.indexAll(scraps);
    }
  }, [scraps]);

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setSuggestions([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Perform search when query or filters change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    const options: SearchOptions = {
      limit: 20,
    };

    if (filters.types.length > 0) {
      options.types = filters.types;
    }
    if (filters.tags.length > 0) {
      options.tags = filters.tags;
    }

    const searchResults = searchService.search(query, options);
    setResults(searchResults);
    setSelectedIndex(0);

    // Get suggestions
    const newSuggestions = searchService.autoSuggest(query, 3);
    setSuggestions(newSuggestions.filter((s) => s !== query));
  }, [query, filters]);

  // Keyboard shortcuts
  useKeyboardShortcut({ key: 'k', modifiers: ['meta'] }, toggleSearch);
  useKeyboardShortcut({ key: 'k', modifiers: ['ctrl'] }, toggleSearch);
  useKeyboardShortcut({ key: '/', modifiers: [] }, () => {
    if (!searchOpen) toggleSearch();
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          toggleSearch();
          break;
      }
    },
    [results, selectedIndex, toggleSearch]
  );

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      selectScrap(result.id);
      toggleSearch();
      navigate('/');
    },
    [selectScrap, toggleSearch, navigate]
  );

  const toggleTypeFilter = useCallback((type: ScrapType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, results.length]);

  const highlightMatch = useCallback((text: string, terms: string[]) => {
    if (!terms.length) return text;

    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      terms.some((term) => part.toLowerCase() === term.toLowerCase()) ? (
        <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, []);

  if (!searchOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={toggleSearch}
        />

        <div className="flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                <svg
                  className="text-slate-400"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search scraps..."
                  className="flex-1 text-lg text-slate-900 placeholder-slate-400 outline-none bg-transparent"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500">
                  <span className="text-[10px]">ESC</span>
                </kbd>
              </div>

              {/* Type Filters */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-medium text-slate-500">Filter:</span>
                {(Object.keys(TYPE_ICONS) as ScrapType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                      'transition-all duration-200',
                      filters.types.includes(type)
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <span style={{ color: filters.types.includes(type) ? 'white' : TYPE_COLORS[type] }}>
                      {TYPE_ICONS[type]}
                    </span>
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/30">
                  <span className="text-xs text-slate-400">Suggestions:</span>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className="text-xs text-violet-600 hover:text-violet-800 hover:underline"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
                {query && results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                      <path d="M8 11h6" />
                    </svg>
                    <p className="mt-4 text-sm">No results found for "{query}"</p>
                    <p className="mt-1 text-xs">Try different keywords or filters</p>
                  </div>
                ) : !query ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <p className="text-sm">Start typing to search your scraps</p>
                    <p className="mt-1 text-xs">
                      Use <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-500">/</kbd> or{' '}
                      <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-500">Cmd+K</kbd> to open
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectResult(result)}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3 text-left',
                          'transition-colors duration-100',
                          index === selectedIndex
                            ? 'bg-violet-50'
                            : 'hover:bg-slate-50'
                        )}
                      >
                        <span
                          className="mt-0.5 p-1.5 rounded-lg"
                          style={{
                            backgroundColor: `${TYPE_COLORS[result.type]}15`,
                            color: TYPE_COLORS[result.type],
                          }}
                        >
                          {TYPE_ICONS[result.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">
                            {highlightMatch(result.title, result.terms)}
                          </h4>
                          <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">
                            {highlightMatch(
                              result.content.slice(0, 150),
                              result.terms
                            )}
                          </p>
                        </div>
                        {index === selectedIndex && (
                          <kbd className="self-center px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 rounded">
                            Enter
                          </kbd>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Enter</kbd>
                    <span>Open</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Esc</kbd>
                    <span>Close</span>
                  </span>
                </div>
                <span>
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
