import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline';
  color?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', color, style, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          'transition-colors duration-200',
          {
            'bg-slate-900 text-white': variant === 'default' && !color,
            'bg-slate-100 text-slate-700': variant === 'secondary',
            'border border-slate-200 text-slate-700': variant === 'outline',
          },
          className
        )}
        style={
          color
            ? {
                backgroundColor: `${color}20`,
                color: color,
                ...style,
              }
            : style
        }
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
