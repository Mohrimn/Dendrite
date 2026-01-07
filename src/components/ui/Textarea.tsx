import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2',
            'text-sm placeholder:text-slate-400',
            'transition-colors duration-200',
            'focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
