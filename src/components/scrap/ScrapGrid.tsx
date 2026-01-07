import { AnimatePresence } from 'framer-motion';
import type { Scrap } from '@/types';
import { ScrapCard } from './ScrapCard';
import { useStore } from '@/store';

interface ScrapGridProps {
  scraps: Scrap[];
  onScrapClick?: (scrap: Scrap) => void;
  onTagClick?: (tag: string) => void;
}

export function ScrapGrid({ scraps, onScrapClick, onTagClick }: ScrapGridProps) {
  const togglePin = useStore((state) => state.togglePin);
  const selectScrap = useStore((state) => state.selectScrap);
  const openModal = useStore((state) => state.openModal);

  const handleClick = (scrap: Scrap) => {
    selectScrap(scrap.id);
    openModal('detail');
    onScrapClick?.(scrap);
  };

  if (scraps.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {scraps.map((scrap) => (
          <ScrapCard
            key={scrap.id}
            scrap={scrap}
            onClick={() => handleClick(scrap)}
            onPin={() => togglePin(scrap.id)}
            onTagClick={onTagClick}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
