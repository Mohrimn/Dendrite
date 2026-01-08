import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Scrap } from '@/types';
import { Card, CardTitle, CardContent, CardFooter } from '@/components/ui';
import { TagPill } from './TagPill';
import { LinkPreview } from './LinkPreview';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks';

interface ScrapCardProps {
  scrap: Scrap;
  onClick?: () => void;
  onPin?: () => void;
  onTagClick?: (tag: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  thought: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  link: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  image: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
  snippet: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  note: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  ),
};

const typeColors: Record<string, string> = {
  thought: '#8b5cf6',
  link: '#06b6d4',
  image: '#f59e0b',
  snippet: '#10b981',
  note: '#ec4899',
};

export const ScrapCard = memo(function ScrapCard({
  scrap,
  onClick,
  onPin,
  onTagClick,
}: ScrapCardProps) {
  const isMobile = useIsMobile();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        interactive
        onClick={onClick}
        className="group"
        style={
          scrap.color
            ? { borderLeftWidth: 3, borderLeftColor: scrap.color }
            : undefined
        }
      >
        {/* Pin indicator */}
        {scrap.isPinned && (
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="white"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76Z" />
            </svg>
          </div>
        )}

        {/* Type indicator */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ backgroundColor: `${typeColors[scrap.type]}15`, color: typeColors[scrap.type] }}
          >
            {typeIcons[scrap.type]}
          </span>
          <span className="text-xs font-medium capitalize text-slate-500">
            {scrap.type}
          </span>
        </div>

        {/* Title */}
        <CardTitle className="mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {scrap.title}
        </CardTitle>

        {/* Content preview */}
        <CardContent>
          {scrap.type === 'link' && scrap.url ? (
            <LinkPreview
              url={scrap.url}
              title={scrap.linkMeta?.title}
              favicon={scrap.linkMeta?.favicon}
              compact
            />
          ) : scrap.type === 'image' && scrap.imageData ? (
            <div className="mt-2 overflow-hidden rounded-lg bg-slate-100">
              <img
                src={scrap.imageData.thumbnail || scrap.imageData.base64}
                alt={scrap.title}
                className="h-32 w-full object-cover"
              />
            </div>
          ) : scrap.type === 'snippet' ? (
            <pre className="mt-2 overflow-hidden rounded-md bg-slate-50 p-2 font-mono text-xs text-slate-600">
              {truncate(scrap.content, 150)}
            </pre>
          ) : (
            <p className="line-clamp-3 text-sm">
              {truncate(scrap.content, 150)}
            </p>
          )}
        </CardContent>

        {/* Tags */}
        {(scrap.tags.length > 0 || scrap.autoTags.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scrap.tags.slice(0, 2).map((tag) => (
              <TagPill
                key={tag}
                tag={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
              />
            ))}
            {scrap.autoTags.slice(0, 2 - scrap.tags.length).map((tag) => (
              <TagPill
                key={tag}
                tag={tag}
                isSystem
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
              />
            ))}
            {scrap.tags.length + scrap.autoTags.length > 2 && (
              <span className="text-xs text-slate-400 px-1">
                +{scrap.tags.length + scrap.autoTags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <CardFooter className="mt-4 flex items-center justify-between">
          <time className="text-xs text-slate-400">
            {formatRelativeTime(scrap.createdAt)}
          </time>

          {/* Actions - always visible on mobile for touch accessibility */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity',
            isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin?.();
              }}
              className={cn(
                'rounded p-2 transition-colors',
                'min-h-[44px] min-w-[44px] flex items-center justify-center',
                scrap.isPinned
                  ? 'text-amber-500 hover:bg-amber-50 active:bg-amber-100'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:bg-slate-200'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={scrap.isPinned ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 17v5" />
                <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76Z" />
              </svg>
            </button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});
