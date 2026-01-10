// ABOUTME: Dialog for naming and saving current filter as a smart view
// ABOUTME: Captures current filter state from parent component

import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import type { SmartViewFilters } from '@/types';

interface SaveFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, filters: SmartViewFilters) => void;
  currentFilters: SmartViewFilters;
}

function describeFilters(filters: SmartViewFilters): string {
  const parts: string[] = [];

  if (filters.types && filters.types.length > 0) {
    parts.push(`Types: ${filters.types.join(', ')}`);
  }

  if (filters.tags && filters.tags.length > 0) {
    parts.push(`Tags: ${filters.tags.join(', ')}`);
  }

  if (filters.readStatus) {
    parts.push(`Read status: ${filters.readStatus}`);
  }

  if (filters.isPinned !== undefined) {
    parts.push(filters.isPinned ? 'Pinned only' : 'Not pinned');
  }

  return parts.length > 0 ? parts.join(' • ') : 'No filters applied';
}

export function SaveFilterDialog({
  isOpen,
  onClose,
  onSave,
  currentFilters,
}: SaveFilterDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state and focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      // Delay focus to allow modal animation to complete
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a name for this view');
      return;
    }

    onSave(trimmedName, currentFilters);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save as Smart View"
      description="Create a saved filter for quick access"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="view-name" className="block text-sm font-medium text-slate-700 mb-1">
            Name
          </label>
          <Input
            ref={inputRef}
            id="view-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g., Unread Links, Work Notes"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500 mb-1">Filters to save:</p>
          <p className="text-sm text-slate-700">{describeFilters(currentFilters)}</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save View</Button>
        </div>
      </form>
    </Modal>
  );
}
