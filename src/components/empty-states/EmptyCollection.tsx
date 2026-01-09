// ABOUTME: Empty state for the main collection page
// ABOUTME: Shown when user has no scraps yet

import { useStore } from '@/store';
import { EmptyState, ScrapbookIllustration } from './EmptyState';

export function EmptyCollection() {
  const openModal = useStore((state) => state.openModal);

  return (
    <EmptyState
      icon={<ScrapbookIllustration />}
      title="Your collection is empty"
      description="Start capturing ideas, links, snippets, and notes. Your knowledge will naturally organize over time."
      action={{
        label: 'Create your first scrap',
        onClick: () => openModal('create'),
      }}
      hint={
        <p>
          Press{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
            Ctrl+N
          </kbd>{' '}
          for quick capture
        </p>
      }
    />
  );
}
