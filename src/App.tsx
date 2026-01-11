// ABOUTME: Main application entry point with routing and global providers
// ABOUTME: Includes animated page transitions and PWA support

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '@/components/layout';
import { SearchOverlay } from '@/components/search';
import { PWAPrompt } from '@/components/PWAPrompt';
import { Skeleton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const GraphPage = lazy(() => import('@/pages/GraphPage').then(m => ({ default: m.GraphPage })));
const ClusterPage = lazy(() => import('@/pages/ClusterPage').then(m => ({ default: m.ClusterPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

function PageLoader() {
  return (
    <div className="p-6">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

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
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.GRAPH} element={<GraphPage />} />
            <Route path={ROUTES.CLUSTERS} element={<ClusterPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
      <SearchOverlay />
      <PWAPrompt />
    </BrowserRouter>
  );
}
