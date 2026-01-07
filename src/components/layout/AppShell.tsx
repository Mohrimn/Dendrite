import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useStore } from '@/store';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        {children}
      </motion.main>
    </div>
  );
}
