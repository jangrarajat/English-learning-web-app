import { useEffect } from 'react';

export const useKeyboardShortcut = (key, callback, condition = true) => {
  useEffect(() => {
    if (!condition) return;

    const handler = (event) => {
      // Check if the pressed key matches
      if (event.key === key && !event.repeat) {
        callback(event);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, condition]);
};