import { cn } from '@/lib/utils';

interface LinkPreviewProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  compact?: boolean;
  className?: string;
}

export function LinkPreview({
  url,
  title,
  description,
  image,
  favicon,
  compact = false,
  className,
}: LinkPreviewProps) {
  let domain = '';
  try {
    domain = new URL(url).hostname.replace('www.', '');
  } catch {
    domain = url;
  }

  const faviconUrl = favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={faviconUrl}
          alt=""
          className="h-4 w-4 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="truncate">{domain}</span>
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
          className="flex-shrink-0 opacity-50"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" x2="21" y1="14" y2="3" />
        </svg>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block rounded-lg border border-slate-200 overflow-hidden',
        'transition-all duration-200 hover:border-slate-300 hover:shadow-sm',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden bg-slate-100">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start gap-3">
          <img
            src={faviconUrl}
            alt=""
            className="mt-0.5 h-5 w-5 rounded flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-900 line-clamp-2 text-sm">
              {title || domain}
            </h4>
            {description && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {description}
              </p>
            )}
            <p className="mt-1.5 text-xs text-slate-400 truncate">{domain}</p>
          </div>
        </div>
      </div>
    </a>
  );
}
