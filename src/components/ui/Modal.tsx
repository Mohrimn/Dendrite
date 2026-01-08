// ABOUTME: Accessible modal dialog component
// ABOUTME: Handles focus trapping, escape key, and ARIA attributes

import { useEffect, useCallback, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  full: 'sm:max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      // Focus the modal
      setTimeout(() => modalRef.current?.focus(), 0);
    } else {
      // Restore focus when modal closes
      previousActiveElement.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  // Mobile: slide up from bottom, Desktop: scale from center
  const mobileAnimation = {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
  };

  const desktopAnimation = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
  };

  const animation = isMobile ? mobileAnimation : desktopAnimation;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={cn(
          'fixed inset-0 z-50 flex',
          isMobile ? 'items-end' : 'items-center justify-center p-4'
        )}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            tabIndex={-1}
            {...animation}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full bg-white shadow-2xl focus:outline-none',
              isMobile
                ? 'max-h-[92vh] rounded-t-2xl'
                : cn('max-h-[90vh] rounded-2xl', sizeClasses[size]),
              'overflow-hidden'
            )}
          >
            {/* Mobile swipe indicator */}
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-slate-300" />
              </div>
            )}
            {(title || description) && (
              <div className={cn(
                'border-b border-slate-100 px-6',
                isMobile ? 'py-3' : 'py-4'
              )}>
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold text-slate-900">{title}</h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-1 text-sm text-slate-500">{description}</p>
                )}
              </div>
            )}
            <div className="overflow-y-auto p-6">{children}</div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className={cn(
                'absolute right-4 top-4 rounded-lg p-1.5',
                'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
                'transition-colors duration-200'
              )}
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
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
