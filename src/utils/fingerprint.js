// Browser fingerprinting for ownership verification
export function generateFingerprint() {
  try {
    // Create a more resilient fingerprint that doesn't trigger ad blockers
    const fingerprint = [
      navigator.userAgent || '',
      navigator.language || '',
      screen.width + 'x' + screen.height || '0x0',
      new Date().getTimezoneOffset() || 0,
      navigator.hardwareConcurrency || 'unknown',
      navigator.platform || 'unknown',
      // Non-canvas based additional entropy
      navigator.vendor || '',
      navigator.product || '',
      navigator.appVersion || '',
      (window.devicePixelRatio || 1).toString()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Always return as string with fixed length
    return Math.abs(hash).toString(36).padStart(10, '0');
  } catch (error) {
    // Fallback to a simpler fingerprinting method that's still consistent
    console.warn("Fingerprinting encountered an error, using fallback method");
    
    // Create a simpler but consistent fingerprint
    const userAgentHash = navigator.userAgent ? 
      navigator.userAgent.split('').reduce((acc, char) => (acc + char.charCodeAt(0)), 0) % 10000 : 
      Math.floor(Math.random() * 10000);
    
    const now = Date.now();
    const timeComponent = (now % 1000000).toString().padStart(6, '0');
    const fingerprint = `fp-${timeComponent}-${userAgentHash.toString().padStart(4, '0')}`;
    
    return fingerprint;
  }
}

export function getCurrentOwnership() {
  let fingerprint = localStorage.getItem('user-fingerprint');
  if (!fingerprint) {
    fingerprint = generateFingerprint();
    localStorage.setItem('user-fingerprint', fingerprint);
  }
  return fingerprint;
}
