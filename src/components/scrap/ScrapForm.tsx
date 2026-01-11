import { useState, useCallback, useEffect } from 'react';
import type { Scrap, ScrapType, CreateScrapInput, ImageData } from '@/types';
import { Button, Input, Textarea } from '@/components/ui';
import { TagInput } from './TagInput';
import { ImageUpload } from './ImageUpload';
import { cn } from '@/lib/utils';
import { suggestTags, isValidUrl } from '@/services/enrichment';

interface ScrapFormProps {
  onSubmit: (data: CreateScrapInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Scrap;
}

const scrapTypes: { type: ScrapType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'thought',
    label: 'Thought',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    type: 'link',
    label: 'Link',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    type: 'image',
    label: 'Image',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
  },
  {
    type: 'snippet',
    label: 'Snippet',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    type: 'note',
    label: 'Note',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
      </svg>
    ),
  },
];

const typeColors: Record<ScrapType, string> = {
  thought: '#8b5cf6',
  link: '#06b6d4',
  image: '#f59e0b',
  snippet: '#10b981',
  note: '#ec4899',
};

const MAX_TAGS = 10;

export function ScrapForm({ onSubmit, onCancel, isLoading, initialData }: ScrapFormProps) {
  const [type, setType] = useState<ScrapType>(initialData?.type ?? 'thought');
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [url, setUrl] = useState(initialData?.url ?? '');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [imageData, setImageData] = useState<ImageData | undefined>(initialData?.imageData);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const isEditing = !!initialData;

  // Auto-detect URL in content (only for new scraps)
  useEffect(() => {
    if (!isEditing && type === 'thought' && content.trim() && isValidUrl(content.trim())) {
      setType('link');
      setUrl(content.trim());
      setContent('');
    }
  }, [content, type, isEditing]);

  // Generate tag suggestions
  useEffect(() => {
    const text = [title, content].filter(Boolean).join(' ');
    if (text.length > 10) {
      const suggestions = suggestTags(text, tags);
      setTagSuggestions(suggestions);
    } else {
      setTagSuggestions([]);
    }
  }, [title, content, tags]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const data: CreateScrapInput = {
        type,
        title: title.trim(),
        content: content.trim(),
        tags,
        ...(type === 'link' && url ? { url } : {}),
        ...(type === 'image' && imageData ? { imageData } : {}),
      };

      onSubmit(data);
    },
    [type, title, content, url, tags, imageData, onSubmit]
  );

  const isValid = useCallback(() => {
    if (type === 'link') return url.trim().length > 0;
    if (type === 'image') return !!imageData;
    return content.trim().length > 0;
  }, [type, url, content, imageData]);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      const normalized = suggestion.trim().toLowerCase();
      if (!normalized) return;
      if (tags.includes(normalized)) return;
      if (tags.length >= MAX_TAGS) return;
      setTags([...tags, normalized]);
    },
    [tags]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          {scrapTypes.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setType(item.type)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2',
                'transition-all duration-200',
                type === item.type
                  ? 'border-transparent shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              )}
              style={
                type === item.type
                  ? {
                      backgroundColor: `${typeColors[item.type]}15`,
                      color: typeColors[item.type],
                    }
                  : undefined
              }
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* URL field for links */}
      {type === 'link' && (
        <Input
          label="URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
      )}

      {/* Image upload */}
      {type === 'image' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Image
          </label>
          <ImageUpload value={imageData} onChange={setImageData} />
        </div>
      )}

      {/* Title */}
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={
          type === 'thought'
            ? 'Optional title...'
            : type === 'image'
            ? 'Describe the image...'
            : 'Give it a title...'
        }
      />

      {/* Content (hide for image type) */}
      {type !== 'image' && (
        <Textarea
          label={type === 'link' ? 'Notes (optional)' : 'Content'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            type === 'thought'
              ? "What's on your mind?"
              : type === 'snippet'
              ? 'Paste your code snippet...'
              : type === 'link'
              ? 'Add notes about this link...'
              : 'Add some notes...'
          }
          className={type === 'snippet' ? 'font-mono text-sm' : undefined}
          required={type !== 'link'}
        />
      )}

      {/* Tags */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Tags
        </label>
        <TagInput
          tags={tags}
          suggestions={tagSuggestions}
          onChange={setTags}
          placeholder="Add tags (press Enter or comma)"
          maxTags={MAX_TAGS}
        />
        {tagSuggestions.length > 0 && tags.length < 5 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500">Suggestions:</span>
            <div className="flex flex-wrap gap-1">
              {tagSuggestions.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    'transition-colors duration-200'
                  )}
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={!isValid()}>
          {isEditing ? 'Save' : 'Create Scrap'}
        </Button>
      </div>
    </form>
  );
}
