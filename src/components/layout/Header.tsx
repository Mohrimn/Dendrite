import { useStore } from '@/store';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const toggleSearch = useStore((state) => state.toggleSearch);
  const openModal = useStore((state) => state.openModal);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={toggleSearch}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2',
              'text-sm text-slate-500 transition-colors duration-200',
              'hover:border-slate-300 hover:text-slate-700'
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500 sm:inline">
              /
            </kbd>
          </button>

          {/* Create Button */}
          <Button onClick={() => openModal('create')}>
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
              className="mr-2"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            New Scrap
          </Button>
        </div>
      </div>
    </header>
  );
}
