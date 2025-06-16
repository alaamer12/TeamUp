/**
 * Safely adds an event listener to an element, checking if it exists first
 * @param {string|Element} element - Element or element ID
 * @param {string} event - Event name to listen for
 * @param {Function} callback - Event handler function
 * @param {boolean|Object} options - Event listener options
 * @returns {boolean} - Whether the listener was successfully added
 */
export function safeAddEventListener(element, event, callback, options = false) {
  try {
    // If element is a string, treat it as an ID
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    
    if (!el) {
      console.warn(`Element ${typeof element === 'string' ? element : 'provided'} not found. Event listener not added.`);
      return false;
    }
    
    el.addEventListener(event, callback, options);
    return true;
  } catch (error) {
    console.error('Error adding event listener:', error);
    return false;
  }
}

/**
 * Safe querySelector that won't throw if element doesn't exist
 * @param {string} selector - CSS selector
 * @param {Element|Document} parent - Parent element to query within (defaults to document)
 * @returns {Element|null} - The found element or null
 */
export function safeQuerySelector(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.warn(`Error querying for ${selector}:`, error);
    return null;
  }
}

/**
 * Checks if a script is being blocked by ad blockers
 * @param {string} scriptUrl - URL of the script to check
 * @returns {Promise<boolean>} - Promise resolving to true if script is blocked
 */
export function isScriptBlocked(scriptUrl) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    
    // If the script loads successfully, it's not blocked
    script.onload = () => {
      document.head.removeChild(script);
      resolve(false);
    };
    
    // If there's an error loading the script, it might be blocked
    script.onerror = () => {
      document.head.removeChild(script);
      resolve(true);
    };
    
    document.head.appendChild(script);
    
    // Set a timeout in case neither event fires
    setTimeout(() => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
        resolve(true);
      }
    }, 2000);
  });
}

/**
 * Initialize the application by clearing stale cache
 * This should be called when the app starts to ensure we don't have outdated data
 * @returns {Promise<void>}
 */
export async function initializeApplication() {
  try {
    // Import only when needed to avoid circular dependencies
    const { invalidateCache } = await import('./db.js');
    
    console.log('Initializing application and clearing stale cache...');
    await invalidateCache();
    console.log('Cache cleared successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

/**
 * Debug utility to check connection to API and data retrieval
 * Usage: Call from browser console `window.debugAPIConnection()`
 */
export function debugAPIConnection() {
  return new Promise(async (resolve) => {
    const results = {
      success: false,
      apiURL: null,
      status: null,
      responseTime: 0,
      data: null,
      error: null
    };
    
    try {
      // Import dynamically to avoid circular dependencies
      const apiClient = await import('./api-client.js');
      const API_URL = apiClient.default?.API_URL || 'Unknown';
      results.apiURL = API_URL;
      
      console.log('%c🔍 API Connection Test', 'font-size: 16px; font-weight: bold; color: blue');
      console.log(`Testing connection to: ${API_URL}`);
      
      const startTime = Date.now();
      
      // Attempt direct fetch to test connection
      const response = await fetch(`${API_URL}/requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      results.responseTime = Date.now() - startTime;
      results.status = response.status;
      
      if (response.ok) {
        const data = await response.json();
        results.data = data;
        results.success = true;
        
        console.log(`%c✅ Connection successful (${results.responseTime}ms)`, 'color: green; font-weight: bold');
        console.log(`Received ${data.length} records:`, data);
      } else {
        const errorText = await response.text();
        results.error = `HTTP ${response.status}: ${errorText}`;
        console.log(`%c❌ Connection failed: ${results.error}`, 'color: red; font-weight: bold');
      }
    } catch (error) {
      results.error = error.message;
      console.log(`%c❌ Connection error: ${error.message}`, 'color: red; font-weight: bold');
    }
    
    console.log('Debug results:', results);
    resolve(results);
    return results;
  });
}

/**
 * Completely clear all application data from IndexedDB
 * Use this as a last resort when data issues occur
 * @returns {Promise<void>}
 */
export async function clearAllApplicationData() {
  try {
    console.log('%c⚠️ Clearing all application data...', 'color: orange; font-weight: bold');
    
    // Import dynamically to avoid circular dependencies
    const { clear } = await import('idb-keyval');
    
    // Clear all data in the idb-keyval store
    await clear();
    console.log('%c✅ All application data cleared successfully', 'color: green; font-weight: bold');
    
    // Refresh the page to apply changes
    console.log('Reloading page to apply changes...');
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear application data:', error);
    throw error;
  }
}

// Expose debug function to browser console for easy access
if (typeof window !== 'undefined') {
  window.debugAPIConnection = debugAPIConnection;
  window.clearAllApplicationData = clearAllApplicationData;
} 