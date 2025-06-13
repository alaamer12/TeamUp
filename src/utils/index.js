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