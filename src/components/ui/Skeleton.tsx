// ABOUTME: Loading skeleton placeholder component
// ABOUTME: Displays animated pulse effect for content loading states

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-slate-200';

  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 space-y-3',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={16} className="w-3/4" />
          <Skeleton variant="text" height={12} className="w-1/2" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={60} />
      <div className="flex gap-2">
        <Skeleton variant="text" height={24} width={60} />
        <Skeleton variant="text" height={24} width={60} />
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  className?: string;
}

export function SkeletonGrid({ count = 6, className }: SkeletonGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
