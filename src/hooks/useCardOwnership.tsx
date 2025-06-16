import { useState, useEffect, useCallback } from 'react';
import { getCurrentOwnership } from '../utils/fingerprint-safe';
import { useKeyboardShortcut } from './useKeyboardShortcut';

// Define types for props and return values
interface TeamData {
  id?: string;
  ownerFingerprint?: string;
  owner_fingerprint?: string;
  [key: string]: any;
}

interface CardOwnershipResult {
  isOwner: boolean;
  currentFingerprint: string;
  deleteCard: (cardId: string) => boolean;
  editCard: (cardId: string) => boolean;
}

/**
 * Hook to check if the current user is the owner of a card
 * and provide ownership-related functionality
 */
export function useCardOwnership(teamData?: TeamData | null): CardOwnershipResult {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [currentFingerprint, setCurrentFingerprint] = useState<string>('');
  
  useEffect(() => {
    const fingerprint = getCurrentOwnership();
    setCurrentFingerprint(fingerprint);
    
    // Check both camelCase and snake_case versions of the property
    const ownerFingerprintValue = teamData?.ownerFingerprint || teamData?.owner_fingerprint;
    
    // Debug log to help troubleshoot ownership
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Ownership check:', {
        current: fingerprint,
        stored: ownerFingerprintValue,
        match: fingerprint === ownerFingerprintValue
      });
    }
    
    setIsOwner(fingerprint === ownerFingerprintValue);
  }, [teamData]);
  
  // Callback functions for card actions
  const deleteCard = useCallback((cardId: string): boolean => {
    // Check global admin mode flag - it's set by AdminProvider
    const isAdminMode = typeof window !== 'undefined' && window.__ADMIN_MODE__ === true;
    
    if (!isOwner && !isAdminMode) {
      console.warn('Cannot delete - not owner and not in admin mode');
      return false;
    }
    
    console.log(`Deleting card ${cardId}...`);
    // Your delete implementation here
    return true;
  }, [isOwner]);
  
  const editCard = useCallback((cardId: string): boolean => {
    // Check global admin mode flag - it's set by AdminProvider
    const isAdminMode = typeof window !== 'undefined' && window.__ADMIN_MODE__ === true;
    
    if (!isOwner && !isAdminMode) {
      console.warn('Cannot edit - not owner and not in admin mode');
      return false;
    }
    
    console.log(`Editing card ${cardId}...`);
    // Your edit implementation here
    return true;
  }, [isOwner]);
  
  // Register keyboard shortcuts for delete/edit if this is the owner's card
  // Only register when we have a card ID and the user is an owner
  useKeyboardShortcut(
    {
      // Use Alt+D for delete and Alt+E for edit
      'alt+d': (e) => {
        if (teamData?.id && (isOwner || (typeof window !== 'undefined' && window.__ADMIN_MODE__ === true))) {
          deleteCard(teamData.id);
        }
      },
      'alt+e': (e) => {
        if (teamData?.id && (isOwner || (typeof window !== 'undefined' && window.__ADMIN_MODE__ === true))) {
          editCard(teamData.id);
        }
      },
    },
    {
      enabled: !!teamData?.id && (isOwner || (typeof window !== 'undefined' && window.__ADMIN_MODE__ === true)),
      preventDefault: true,
      capture: true // Use capture to ensure we get the event before other handlers
    }
  );
  
  return { 
    isOwner, 
    currentFingerprint,
    deleteCard,
    editCard
  };
} 