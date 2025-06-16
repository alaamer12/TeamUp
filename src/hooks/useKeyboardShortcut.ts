import { useEffect, useCallback, useRef } from 'react';

// Type definitions for keyboard shortcuts
type KeyCombination = {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
};

type KeyboardShortcutOptions = {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enabled?: boolean;
  capture?: boolean;
  target?: EventTarget;
};

/**
 * Custom hook for managing keyboard shortcuts consistently across the app.
 * 
 * @param keyCombinations Object mapping shortcut combinations to handler functions
 * @param options Configuration options for the keyboard shortcuts
 */
export function useKeyboardShortcut(
  keyCombinations: Record<string, (event: KeyboardEvent) => void>,
  options: KeyboardShortcutOptions = {}
) {
  // Store a reference to the key combinations to avoid unnecessary re-renders
  const keyHandlersRef = useRef(keyCombinations);
  
  // Update the ref if the key combinations change
  useEffect(() => {
    keyHandlersRef.current = keyCombinations;
  }, [keyCombinations]);
  
  // Default options
  const {
    preventDefault = true,
    stopPropagation = false,
    enabled = true,
    capture = true,
    target = window,
  } = options;
  
  // Platform detection for Mac users
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  // Parse shortcut string into KeyCombination object
  const parseShortcut = useCallback((shortcut: string): KeyCombination => {
    const parts = shortcut.toLowerCase().split('+');
    const key = parts.pop() || '';
    
    return {
      key,
      altKey: parts.includes('alt'),
      ctrlKey: parts.includes('ctrl'),
      shiftKey: parts.includes('shift'),
      metaKey: parts.includes('meta') || (isMac && parts.includes('cmd')),
    };
  }, [isMac]);
  
  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Check if the key matches any registered shortcut
    let matchFound = false;
    
    Object.entries(keyHandlersRef.current).forEach(([shortcutStr, handler]) => {
      const shortcut = parseShortcut(shortcutStr);
      
      // Check if this event matches the shortcut
      if (
        event.key.toLowerCase() === shortcut.key &&
        !!event.altKey === !!shortcut.altKey &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.metaKey === !!shortcut.metaKey
      ) {
        // Match found, execute handler
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        
        handler(event);
        matchFound = true;
      }
    });
    
    return matchFound;
  }, [enabled, parseShortcut, preventDefault, stopPropagation]);
  
  // Set up and tear down event listener
  useEffect(() => {
    if (!enabled) return;
    
    target.addEventListener('keydown', handleKeyDown as EventListener, { capture });
    
    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener, { capture });
    };
  }, [target, enabled, handleKeyDown, capture]);
  
  // Return utilities for shortcut manipulation
  return {
    // Convert a KeyCombination to a user-friendly display string
    formatShortcutForDisplay: useCallback((shortcut: string): string => {
      if (isMac) {
        // Mac display style (⌘⌥⇧A)
        return shortcut
          .replace(/cmd\+/i, '⌘')
          .replace(/meta\+/i, '⌘')
          .replace(/alt\+/i, '⌥')
          .replace(/ctrl\+/i, '⌃')
          .replace(/shift\+/i, '⇧');
      } else {
        // Windows/Linux display style (Ctrl+Alt+Shift+A)
        return shortcut
          .replace(/meta\+/i, 'Win+')
          .replace(/cmd\+/i, 'Ctrl+');
      }
    }, [isMac]),
    
    // Check if a specific shortcut is currently enabled
    isEnabled: enabled
  };
} 