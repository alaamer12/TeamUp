import { useState, useEffect } from 'react';
import { getCurrentOwnership } from '../utils/fingerprint-safe';

export function useCardOwnership(teamData) {
  const [isOwner, setIsOwner] = useState(false);
  const [currentFingerprint, setCurrentFingerprint] = useState('');
  
  useEffect(() => {
    const fingerprint = getCurrentOwnership();
    setCurrentFingerprint(fingerprint);
    
    // Check both camelCase and snake_case versions of the property
    const ownerFingerprintValue = teamData?.ownerFingerprint || teamData?.owner_fingerprint;
    
    // Debug log to help troubleshoot
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Ownership check:', {
        current: fingerprint,
        stored: ownerFingerprintValue,
        match: fingerprint === ownerFingerprintValue
      });
    }
    
    setIsOwner(fingerprint === ownerFingerprintValue);
  }, [teamData]);
  
  return { isOwner, currentFingerprint };
}
