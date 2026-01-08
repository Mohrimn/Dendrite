// ABOUTME: Hook for managing PWA install and update prompts
// ABOUTME: Provides install status, prompt trigger, and update notifications

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAResult {
  isInstallable: boolean;
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  installApp: () => Promise<void>;
  updateApp: () => void;
  dismissInstall: () => void;
  dismissUpdate: () => void;
}

export function usePWA(): UsePWAResult {
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isUpdateDismissed, setIsUpdateDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setIsUpdateAvailable(true);
              }
            });
          }
        });
      });

      // Also listen for controlling service worker changes
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const installApp = useCallback(async () => {
    if (!installPromptEvent) return;

    await installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPromptEvent(null);
  }, [installPromptEvent]);

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    setIsUpdateAvailable(false);
  }, []);

  const dismissInstall = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const dismissUpdate = useCallback(() => {
    setIsUpdateDismissed(true);
  }, []);

  return {
    isInstallable: !!installPromptEvent && !isDismissed && !isInstalled,
    isInstalled,
    isUpdateAvailable: isUpdateAvailable && !isUpdateDismissed,
    installApp,
    updateApp,
    dismissInstall,
    dismissUpdate,
  };
}
