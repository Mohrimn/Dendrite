// ABOUTME: Compact card for displaying related scraps
// ABOUTME: Shows title, type, and reason badges for why it's related

import type { Scrap } from '@/types';
import type { RelatednessReason } from '@/services/relatedness';
import { cn } from '@/lib/utils';

interface RelatedScrapCardProps {
  scrap: Scrap;
  reasons: RelatednessReason[];
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  thought: '#8b5cf6',
  link: '#06b6d4',
  image: '#f59e0b',
  snippet: '#10b981',
  note: '#ec4899',
};

const typeIcons: Record<string, React.ReactNode> = {
  thought: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  link: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  image: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
  snippet: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  note: (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
};

const reasonLabels: Record<RelatednessReason, string> = {
  tag: 'Tags',
  keyword: 'Keywords',
  cluster: 'Cluster',
};

export function RelatedScrapCard({ scrap, reasons, onClick }: RelatedScrapCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border border-slate-200',
        'hover:border-slate-300 hover:bg-slate-50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
          style={{ backgroundColor: `${typeColors[scrap.type]}15`, color: typeColors[scrap.type] }}
        >
          {typeIcons[scrap.type]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 truncate">
            {scrap.title}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {reasons.map((reason) => (
              <span
                key={reason}
                className="inline-flex items-center px-1.5 py-0.5 text-xs text-slate-500 bg-slate-100 rounded"
              >
                {reasonLabels[reason]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
