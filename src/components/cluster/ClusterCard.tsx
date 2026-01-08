import { motion } from 'framer-motion';
import type { Cluster, Scrap } from '@/types';
import { cn } from '@/lib/utils';

interface ClusterCardProps {
  cluster: Cluster;
  scraps: Scrap[];
  isSelected?: boolean;
  onClick?: () => void;
}

const TYPE_ICONS: Record<string, JSX.Element> = {
  thought: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  link: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  image: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
  snippet: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  note: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
};

export function ClusterCard({ cluster, scraps, isSelected, onClick }: ClusterCardProps) {
  // Count scrap types in this cluster
  const typeCounts = scraps.reduce((acc, scrap) => {
    acc[scrap.type] = (acc[scrap.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get preview scraps (up to 3)
  const previewScraps = scraps.slice(0, 3);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer rounded-2xl border bg-white p-5',
        'transition-all duration-200',
        isSelected
          ? 'border-slate-900 ring-2 ring-slate-900/10'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
      )}
    >
      {/* Color indicator */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ backgroundColor: cluster.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 pl-3">
          <h3 className="font-semibold text-slate-900 truncate">{cluster.name}</h3>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
            {cluster.description}
          </p>
        </div>

        {/* Coherence indicator */}
        <div
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${cluster.color}15`,
            color: cluster.color,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
          </svg>
          <span>{Math.round(cluster.coherence * 100)}%</span>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="mt-4 pl-3 flex flex-wrap gap-2">
        {Object.entries(typeCounts).map(([type, count]) => (
          <div
            key={type}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-xs text-slate-600"
          >
            {TYPE_ICONS[type]}
            <span>{count}</span>
          </div>
        ))}
      </div>

      {/* Keywords */}
      <div className="mt-4 pl-3 flex flex-wrap gap-1.5">
        {cluster.keywords.slice(0, 5).map((keyword) => (
          <span
            key={keyword}
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${cluster.color}10`,
              color: cluster.color,
            }}
          >
            {keyword}
          </span>
        ))}
        {cluster.keywords.length > 5 && (
          <span className="px-2 py-0.5 rounded-full text-xs text-slate-400">
            +{cluster.keywords.length - 5} more
          </span>
        )}
      </div>

      {/* Preview */}
      <div className="mt-4 pl-3 space-y-2">
        {previewScraps.map((scrap) => (
          <div
            key={scrap.id}
            className="flex items-center gap-2 text-sm text-slate-600 truncate"
          >
            <span className="text-slate-400">{TYPE_ICONS[scrap.type]}</span>
            <span className="truncate">{scrap.title}</span>
          </div>
        ))}
        {scraps.length > 3 && (
          <div className="text-xs text-slate-400 pl-5">
            +{scraps.length - 3} more scraps
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200',
          'group-hover:opacity-100 pointer-events-none'
        )}
        style={{
          background: `linear-gradient(135deg, ${cluster.color}05, ${cluster.color}10)`,
        }}
      />
    </motion.div>
  );
}
