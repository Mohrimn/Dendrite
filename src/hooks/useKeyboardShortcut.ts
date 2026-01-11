import { useEffect, useCallback } from 'react';

type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';

interface ShortcutOptions {
  key: string;
  modifiers?: ModifierKey[];
  preventDefault?: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

export function useKeyboardShortcut(
  options: ShortcutOptions,
  callback: () => void
) {
  const { key, modifiers = [], preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }
      const modifierChecks = {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      };

      const allModifiersPressed = modifiers.every((mod) => modifierChecks[mod]);
      const noExtraModifiers = (Object.keys(modifierChecks) as ModifierKey[])
        .filter((mod) => !modifiers.includes(mod))
        .every((mod) => !modifierChecks[mod]);

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        allModifiersPressed &&
        noExtraModifiers
      ) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [key, modifiers, preventDefault, callback]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
