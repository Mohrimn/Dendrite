// ABOUTME: Main application shell with sidebar layout
// ABOUTME: Provides consistent layout structure and accessibility features

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { useStore } from '@/store';
import { useIsMobile } from '@/hooks';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {isMobile && <MobileHeader />}
      <Sidebar />

      <motion.main
        id="main-content"
        role="main"
        initial={false}
        animate={{ marginLeft: isMobile ? 0 : sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={isMobile ? 'min-h-screen pt-14' : 'min-h-screen'}
        tabIndex={-1}
      >
        {children}
      </motion.main>
    </div>
  );
}
