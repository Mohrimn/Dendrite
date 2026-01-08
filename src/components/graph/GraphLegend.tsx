// ABOUTME: Legend showing node colors by scrap type
// ABOUTME: Helps users understand the visual encoding in the graph

import type { ScrapType } from '@/types';

const LEGEND_ITEMS: { type: ScrapType; label: string; color: string }[] = [
  { type: 'thought', label: 'Thought', color: '#8b5cf6' },
  { type: 'link', label: 'Link', color: '#06b6d4' },
  { type: 'image', label: 'Image', color: '#f59e0b' },
  { type: 'snippet', label: 'Snippet', color: '#10b981' },
  { type: 'note', label: 'Note', color: '#ec4899' },
];

interface GraphLegendProps {
  className?: string;
}

export function GraphLegend({ className = '' }: GraphLegendProps) {
  return (
    <div
      className={`bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 ${className}`}
    >
      <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
        Node Types
      </h4>
      <div className="space-y-1.5">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
