import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scrap, ScrapType } from '@/types';
import { TagPill } from './TagPill';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  scraps: Scrap[];
  selectedType: ScrapType | null;
  selectedTag: string | null;
  onTypeChange: (type: ScrapType | null) => void;
  onTagChange: (tag: string | null) => void;
  onSaveAsSmartView?: () => void;
}

const typeOptions: { type: ScrapType; label: string; color: string }[] = [
  { type: 'thought', label: 'Thoughts', color: '#8b5cf6' },
  { type: 'link', label: 'Links', color: '#06b6d4' },
  { type: 'image', label: 'Images', color: '#f59e0b' },
  { type: 'snippet', label: 'Snippets', color: '#10b981' },
  { type: 'note', label: 'Notes', color: '#ec4899' },
];

export function FilterBar({
  scraps,
  selectedType,
  selectedTag,
  onTypeChange,
  onTagChange,
  onSaveAsSmartView,
}: FilterBarProps) {
  // Get all unique tags from scraps
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>();

    for (const scrap of scraps) {
      for (const tag of [...scrap.tags, ...scrap.autoTags]) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [scraps]);

  // Count scraps by type
  const typeCounts = useMemo(() => {
    const counts = new Map<ScrapType, number>();
    for (const scrap of scraps) {
      counts.set(scrap.type, (counts.get(scrap.type) || 0) + 1);
    }
    return counts;
  }, [scraps]);

  const hasFilters = selectedType !== null || selectedTag !== null;

  return (
    <div className="space-y-3">
      {/* Type filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-500">Filter:</span>
        {typeOptions.map((option) => {
          const count = typeCounts.get(option.type) || 0;
          if (count === 0) return null;

          return (
            <button
              key={option.type}
              onClick={() =>
                onTypeChange(selectedType === option.type ? null : option.type)
              }
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm',
                'transition-all duration-200',
                selectedType === option.type
                  ? 'shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
              style={
                selectedType === option.type
                  ? {
                      backgroundColor: `${option.color}15`,
                      color: option.color,
                    }
                  : undefined
              }
            >
              {option.label}
              <span
                className={cn(
                  'text-xs',
                  selectedType === option.type ? 'opacity-70' : 'text-slate-400'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Tags:</span>
          {allTags.map(({ tag }) => (
            <TagPill
              key={tag}
              tag={tag}
              onClick={() => onTagChange(selectedTag === tag ? null : tag)}
              className={cn(
                'cursor-pointer',
                selectedTag === tag && 'ring-2 ring-offset-1'
              )}
            />
          ))}
        </div>
      )}

      {/* Active filters indicator */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm"
          >
            <span className="text-slate-500">Showing:</span>
            {selectedType && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${typeOptions.find((t) => t.type === selectedType)?.color}15`,
                  color: typeOptions.find((t) => t.type === selectedType)?.color,
                }}
              >
                {typeOptions.find((t) => t.type === selectedType)?.label}
              </span>
            )}
            {selectedTag && <TagPill tag={selectedTag} />}
            <button
              onClick={() => {
                onTypeChange(null);
                onTagChange(null);
              }}
              className="ml-2 text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Clear
            </button>
            {onSaveAsSmartView && (
              <button
                onClick={onSaveAsSmartView}
                className="ml-2 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Save View
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
