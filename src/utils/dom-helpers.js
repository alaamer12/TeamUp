/**
 * DOM helper utilities to prevent errors with null elements
 */

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
 * Safely removes an event listener from an element, checking if it exists first
 * @param {string|Element} element - Element or element ID
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function to remove
 * @param {boolean|Object} options - Event listener options
 * @returns {boolean} - Whether the listener was successfully removed
 */
export function safeRemoveEventListener(element, event, callback, options = false) {
  try {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    
    if (!el) {
      console.warn(`Element ${typeof element === 'string' ? element : 'provided'} not found. Event listener not removed.`);
      return false;
    }
    
    el.removeEventListener(event, callback, options);
    return true;
  } catch (error) {
    console.error('Error removing event listener:', error);
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
 * Safely get an element by ID with a default fallback element
 * @param {string} id - Element ID
 * @param {HTMLElement} fallback - Optional fallback element to return if not found
 * @returns {HTMLElement|null} - The found element or null
 */
export function safeGetElementById(id, fallback = null) {
  try {
    const element = document.getElementById(id);
    return element || fallback;
  } catch (error) {
    console.warn(`Error getting element by ID ${id}:`, error);
    return fallback;
  }
} 