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
    
    return Math.abs(hash).toString(36);
  } catch (error) {
    // Fallback to a simpler fingerprinting method if the primary one fails
    console.warn("Fingerprinting encountered an error, using fallback method");
    const simpleFingerprint = [
      Date.now(),
      Math.random().toString(36).substring(2),
      navigator.userAgent?.substring(0, 20) || 'unknown'
    ].join('-');
    
    return simpleFingerprint;
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
