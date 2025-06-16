/**
 * Safe fingerprinting implementation that won't trigger ad blockers
 * Enhanced for cross-browser and platform compatibility
 */

/**
 * Check if the browser supports localStorage
 * @returns {boolean} Whether localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Creates a fallback storage when localStorage isn't available
 */
const memoryStorage: Record<string, string> = {};
const fallbackStorage = {
  getItem(key: string): string | null {
    return memoryStorage[key] || null;
  },
  setItem(key: string, value: string): void {
    memoryStorage[key] = value;
  },
  removeItem(key: string): void {
    delete memoryStorage[key];
  }
};

/**
 * Get the appropriate storage mechanism for the current environment
 */
function getStorage() {
  return isLocalStorageAvailable() ? localStorage : fallbackStorage;
}

/**
 * Generates a simple fingerprint that doesn't use canvas or other methods that might trigger ad blockers
 * Enhanced for maximum cross-browser compatibility
 * @returns {string} A fingerprint string
 */
export function generateFingerprint(): string {
  try {
    // Platform-agnostic fingerprinting
    const fingerprint = [
      navigator?.userAgent || '',
      navigator?.language || '',
      typeof screen !== 'undefined' ? `${screen.width || 0}x${screen.height || 0}` : '0x0',
      new Date().getTimezoneOffset() || 0,
      navigator?.hardwareConcurrency || 'unknown',
      navigator?.platform || 'unknown',
      
      // Non-canvas based additional entropy that's available in most browsers
      navigator?.vendor || '',
      navigator?.product || '',
      navigator?.appVersion || '',
      typeof window !== 'undefined' ? (window.devicePixelRatio || 1).toString() : '1'
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
    console.warn("Fingerprinting encountered an error, using fallback method:", error);
    
    // Create a simpler but consistent fingerprint
    const createSimpleHash = (str: string) => {
      return str.split('').reduce((acc, char) => (acc + char.charCodeAt(0)), 0) % 10000;
    };
    
    const userAgentHash = navigator?.userAgent ? 
      createSimpleHash(navigator.userAgent) : 
      Math.floor(Math.random() * 10000);
    
    const now = Date.now();
    const timeComponent = (now % 1000000).toString().padStart(6, '0');
    const fingerprint = `fp-${timeComponent}-${userAgentHash.toString().padStart(4, '0')}`;
    
    return fingerprint;
  }
}

// Constant fingerprint key to ensure consistency
const FINGERPRINT_STORAGE_KEY = 'teamup-user-fingerprint';

/**
 * Gets the current user's ownership fingerprint
 * @returns {string} The user's fingerprint
 */
export function getCurrentOwnership(): string {
  const storage = getStorage();
  let fingerprint = storage.getItem(FINGERPRINT_STORAGE_KEY);
  
  if (!fingerprint) {
    fingerprint = generateFingerprint();
    try {
      storage.setItem(FINGERPRINT_STORAGE_KEY, fingerprint);
    } catch (e) {
      console.warn('Could not save fingerprint to storage:', e);
    }
  }
  
  return fingerprint;
}

/**
 * Resets the user's fingerprint (useful for testing)
 */
export function resetFingerprint(): void {
  const storage = getStorage();
  storage.removeItem(FINGERPRINT_STORAGE_KEY);
} 