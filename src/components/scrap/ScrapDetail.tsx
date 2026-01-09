import type { Scrap } from '@/types';
import { Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ScrapDetailProps {
  scrap: Scrap;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

const typeColors: Record<string, string> = {
  thought: '#8b5cf6',
  link: '#06b6d4',
  image: '#f59e0b',
  snippet: '#10b981',
  note: '#ec4899',
};

export function ScrapDetail({ scrap, onEdit, onDelete, onClose }: ScrapDetailProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: typeColors[scrap.type] }}
          >
            <span className="text-sm font-medium capitalize">{scrap.type[0]}</span>
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{scrap.title}</h2>
            <p className="text-sm text-slate-500">
              Created {formatDate(scrap.createdAt)}
            </p>
          </div>
        </div>
        {scrap.isPinned && (
          <Badge color="#f59e0b">Pinned</Badge>
        )}
      </div>

      {/* URL for links */}
      {scrap.type === 'link' && scrap.url && (
        <a
          href={scrap.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-2 rounded-lg border border-slate-200 p-3',
            'text-sm text-slate-600 transition-colors',
            'hover:border-slate-300 hover:bg-slate-50'
          )}
        >
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
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
          </svg>
          <span className="flex-1 truncate">{scrap.url}</span>
        </a>
      )}

      {/* Image */}
      {scrap.type === 'image' && scrap.imageData && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <img
            src={scrap.imageData.base64}
            alt={scrap.title}
            className="w-full"
          />
        </div>
      )}

      {/* Content */}
      {scrap.content && (
        <div
          className={cn(
            'rounded-lg border border-slate-200 p-4',
            scrap.type === 'snippet' && 'bg-slate-50 font-mono text-sm'
          )}
        >
          {scrap.type === 'snippet' ? (
            <pre className="overflow-x-auto whitespace-pre-wrap">{scrap.content}</pre>
          ) : (
            <p className="whitespace-pre-wrap text-slate-700">{scrap.content}</p>
          )}
        </div>
      )}

      {/* Tags */}
      {(scrap.tags.length > 0 || scrap.autoTags.length > 0) && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {scrap.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {scrap.autoTags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between border-t border-slate-100 pt-4">
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>Edit</Button>
        </div>
      </div>
    </div>
  );
}
