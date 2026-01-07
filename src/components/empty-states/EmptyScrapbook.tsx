import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { useStore } from '@/store';

export function EmptyScrapbook() {
  const openModal = useStore((state) => state.openModal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {/* Illustration */}
      <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M12 6v7" />
          <path d="M8 10h8" />
        </svg>
      </div>

      {/* Text */}
      <h3 className="mb-2 text-xl font-semibold text-slate-900">
        Your scrapbook is empty
      </h3>
      <p className="mb-6 max-w-sm text-slate-500">
        Start capturing ideas, links, snippets, and notes. Your knowledge will
        naturally organize over time.
      </p>

      {/* Action */}
      <Button onClick={() => openModal('create')} size="lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
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
        Create your first scrap
      </Button>

      {/* Hint */}
      <p className="mt-4 text-sm text-slate-400">
        Press{' '}
        <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
          Ctrl+N
        </kbd>{' '}
        for quick capture
      </p>
    </motion.div>
  );
}
