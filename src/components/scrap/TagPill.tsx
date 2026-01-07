import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TagPillProps extends HTMLAttributes<HTMLSpanElement> {
  tag: string;
  color?: string;
  isSystem?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const defaultColors = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

function getColorForTag(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return defaultColors[Math.abs(hash) % defaultColors.length];
}

export const TagPill = forwardRef<HTMLSpanElement, TagPillProps>(
  ({ tag, color, isSystem, removable, onRemove, className, onClick, ...props }, ref) => {
    const tagColor = color || getColorForTag(tag);

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
          'text-xs font-medium transition-all duration-200',
          onClick && 'cursor-pointer hover:scale-105',
          isSystem && 'border border-dashed',
          className
        )}
        style={{
          backgroundColor: `${tagColor}15`,
          color: tagColor,
          borderColor: isSystem ? `${tagColor}40` : undefined,
        }}
        onClick={onClick}
        {...props}
      >
        {isSystem && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
        )}
        <span>{tag}</span>
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

TagPill.displayName = 'TagPill';
