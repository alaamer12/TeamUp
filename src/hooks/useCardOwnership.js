
import { useState, useEffect } from 'react';
import { getCurrentOwnership } from '../utils/fingerprint';

export function useCardOwnership(teamData) {
  const [isOwner, setIsOwner] = useState(false);
  const [currentFingerprint, setCurrentFingerprint] = useState('');
  
  useEffect(() => {
    const fingerprint = getCurrentOwnership();
    setCurrentFingerprint(fingerprint);
    setIsOwner(teamData?.ownerFingerprint === fingerprint);
  }, [teamData?.ownerFingerprint]);
  
  return { isOwner, currentFingerprint };
}
