// ABOUTME: Reusable empty state component with animated illustrations
// ABOUTME: Used across the app for consistent empty state messaging

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  hint?: ReactNode;
}

export function EmptyState({ icon, title, description, action, hint }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {/* Animated illustration container */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100"
      >
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {icon}
        </motion.div>
      </motion.div>

      {/* Text */}
      <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mb-6 max-w-sm text-slate-500">{description}</p>

      {/* Action */}
      {action && (
        <Button onClick={action.onClick} size="lg">
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
          {action.label}
        </Button>
      )}

      {/* Hint */}
      {hint && <div className="mt-4 text-sm text-slate-400">{hint}</div>}
    </motion.div>
  );
}

// Pre-built illustrations as SVG components
export function ScrapbookIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#gradient-collection)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="gradient-collection" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M12 6v7" />
      <path d="M8 10h8" />
    </svg>
  );
}

export function GraphIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#gradient-graph)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="gradient-graph" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="3" />
      <circle cx="4" cy="6" r="2" />
      <circle cx="20" cy="6" r="2" />
      <circle cx="4" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
      <line x1="6" y1="6" x2="9.5" y2="10" />
      <line x1="18" y1="6" x2="14.5" y2="10" />
      <line x1="6" y1="18" x2="9.5" y2="14" />
      <line x1="18" y1="18" x2="14.5" y2="14" />
    </svg>
  );
}

export function ClusterIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#gradient-cluster)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="gradient-cluster" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="4" />
      <circle cx="19" cy="5" r="2.5" />
      <circle cx="5" cy="5" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <path d="M12 8V5" />
      <path d="M7.5 6.5 9.5 9" />
      <path d="M16.5 6.5 14.5 9" />
      <path d="M7.5 17.5 9.5 15" />
      <path d="M16.5 17.5 14.5 15" />
    </svg>
  );
}

export function SearchIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#gradient-search)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="gradient-search" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
      <line x1="11" y1="8" x2="11" y2="14" />
    </svg>
  );
}
