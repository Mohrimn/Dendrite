// ABOUTME: Main application entry point with routing and global providers
// ABOUTME: Includes animated page transitions and PWA support

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '@/components/layout';
import { SearchOverlay } from '@/components/search';
import { PWAPrompt } from '@/components/PWAPrompt';
import { HomePage, GraphPage, ClusterPage, SettingsPage } from '@/pages';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/clusters" element={<ClusterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
      <SearchOverlay />
      <PWAPrompt />
    </BrowserRouter>
  );
}
