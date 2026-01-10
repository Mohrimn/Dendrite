// ABOUTME: Widget displaying forgotten scraps worth revisiting
// ABOUTME: Shows 1-3 scraps with time-since-viewed context

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scrap } from '@/types';
import { findRediscoverScraps } from '@/services/rediscover';
import { cn } from '@/lib/utils';

interface RediscoverWidgetProps {
  scraps: Scrap[];
  onScrapClick?: (id: string) => void;
}

const typeColors: Record<string, string> = {
  thought: '#8b5cf6',
  link: '#06b6d4',
  image: '#f59e0b',
  snippet: '#10b981',
  note: '#ec4899',
};

function formatDaysAgo(days: number): string {
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

export function RediscoverWidget({ scraps, onScrapClick }: RediscoverWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const rediscoverScraps = useMemo(
    () => findRediscoverScraps(scraps, 3, 7),
    [scraps]
  );

  if (rediscoverScraps.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-200 bg-gradient-to-r from-indigo-50 to-violet-50"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-indigo-100/50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-600"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
          <h2 className="text-sm font-semibold text-slate-700">Rediscover</h2>
          <span className="text-xs text-slate-500">{rediscoverScraps.length} forgotten scraps</span>
        </div>
        <motion.svg
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-400"
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {rediscoverScraps.map(({ scrap, daysSinceViewed }) => (
                <button
                  key={scrap.id}
                  onClick={() => onScrapClick?.(scrap.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg bg-white border border-slate-200',
                    'hover:border-indigo-300 hover:shadow-sm transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-medium"
                      style={{ backgroundColor: typeColors[scrap.type] }}
                    >
                      {scrap.type[0].toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {scrap.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Last viewed {formatDaysAgo(daysSinceViewed)}
                        {scrap.isPinned && (
                          <span className="ml-2 text-amber-600">Pinned</span>
                        )}
                      </p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-slate-400"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
