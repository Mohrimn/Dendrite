import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TagPill } from './TagPill';

interface TagInputProps {
  tags: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  tags,
  suggestions = [],
  onChange,
  placeholder = 'Add tags...',
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(s)
  );

  const addTag = useCallback(
    (tag: string) => {
      const normalizedTag = tag.trim().toLowerCase();
      if (
        normalizedTag &&
        !tags.includes(normalizedTag) &&
        tags.length < maxTags
      ) {
        onChange([...tags, normalizedTag]);
        setInputValue('');
        setShowSuggestions(false);
        setSelectedIndex(0);
      }
    },
    [tags, onChange, maxTags]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(tags.filter((t) => t !== tagToRemove));
    },
    [tags, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (showSuggestions && filteredSuggestions[selectedIndex]) {
          addTag(filteredSuggestions[selectedIndex]);
        } else if (inputValue) {
          addTag(inputValue);
        }
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      } else if (e.key === 'ArrowDown' && showSuggestions) {
        e.preventDefault();
        setSelectedIndex((i) =>
          i < filteredSuggestions.length - 1 ? i + 1 : 0
        );
      } else if (e.key === 'ArrowUp' && showSuggestions) {
        e.preventDefault();
        setSelectedIndex((i) =>
          i > 0 ? i - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      } else if (e.key === ',' || e.key === 'Tab') {
        if (inputValue) {
          e.preventDefault();
          addTag(inputValue);
        }
      }
    },
    [inputValue, tags, showSuggestions, filteredSuggestions, selectedIndex, addTag, removeTag]
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2',
          'min-h-[42px] cursor-text transition-colors duration-200',
          'focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <TagPill
            key={tag}
            tag={tag}
            removable
            onRemove={() => removeTag(tag)}
          />
        ))}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(0);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[100px] border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              className={cn(
                'w-full px-3 py-1.5 text-left text-sm transition-colors',
                index === selectedIndex
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
              onClick={() => addTag(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="mt-1 text-xs text-slate-500">
          Maximum {maxTags} tags allowed
        </p>
      )}
    </div>
  );
}
