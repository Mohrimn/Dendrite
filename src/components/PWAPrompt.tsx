// ABOUTME: PWA install and update prompt components
// ABOUTME: Shows banners for app installation and update notifications

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { usePWA } from '@/hooks';

export function PWAPrompt() {
  const {
    isInstallable,
    isUpdateAvailable,
    installApp,
    updateApp,
    dismissInstall,
    dismissUpdate,
  } = usePWA();

  return (
    <AnimatePresence>
      {isInstallable && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  <path d="m9 10 2 2 4-4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900">
                  Install Dendrite
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Add to your home screen for offline access
                </p>
              </div>
              <button
                onClick={dismissInstall}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                aria-label="Dismiss"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={dismissInstall}
                className="flex-1"
              >
                Not now
              </Button>
              <Button size="sm" onClick={installApp} className="flex-1">
                Install
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {isUpdateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-indigo-600 rounded-lg shadow-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white">Update available</h3>
                <p className="text-sm text-indigo-200 mt-0.5">
                  A new version is ready to install
                </p>
              </div>
              <button
                onClick={dismissUpdate}
                className="flex-shrink-0 text-indigo-200 hover:text-white"
                aria-label="Dismiss"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissUpdate}
                className="flex-1 text-white hover:bg-white/10"
              >
                Later
              </Button>
              <Button
                size="sm"
                onClick={updateApp}
                className="flex-1 bg-white text-indigo-600 hover:bg-indigo-50"
              >
                Update now
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
