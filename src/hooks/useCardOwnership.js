import { useState, useEffect } from 'react';

// Fallback fingerprint function in case the import fails
const getFallbackFingerprint = () => {
  let fingerprint = localStorage.getItem('user-fingerprint');
  if (!fingerprint) {
    fingerprint = [
      Date.now(),
      Math.random().toString(36).substring(2),
      navigator.userAgent?.substring(0, 20) || 'unknown'
    ].join('-');
    localStorage.setItem('user-fingerprint', fingerprint);
  }
  return fingerprint;
};

// Try to import the original module, but use fallback if it fails
let getCurrentOwnership;
try {
  import('../utils/fingerprint')
    .then(module => {
      getCurrentOwnership = module.getCurrentOwnership;
    })
    .catch(() => {
      getCurrentOwnership = getFallbackFingerprint;
    });
} catch (error) {
  getCurrentOwnership = getFallbackFingerprint;
}

export function useCardOwnership(teamData) {
  const [isOwner, setIsOwner] = useState(false);
  const [currentFingerprint, setCurrentFingerprint] = useState('');
  
  useEffect(() => {
    // Use the getCurrentOwnership function if available, otherwise use fallback
    const getFingerprint = () => {
      if (typeof getCurrentOwnership === 'function') {
        return getCurrentOwnership();
      }
      return getFallbackFingerprint();
    };
    
    const fingerprint = getFingerprint();
    setCurrentFingerprint(fingerprint);
    setIsOwner(teamData?.ownerFingerprint === fingerprint);
  }, [teamData?.ownerFingerprint]);
  
  return { isOwner, currentFingerprint };
}
