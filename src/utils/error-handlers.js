/**
 * Global error handlers to catch and handle errors from browser extensions or other sources
 */

/**
 * Installs a global error handler to catch and handle uncaught errors
 * @param {boolean} suppressConsoleErrors - Whether to suppress console errors
 * @returns {Function} - Function to remove the error handler
 */
export function installGlobalErrorHandler(suppressConsoleErrors = false) {
  // Handler for uncaught errors
  const errorHandler = (event) => {
    // Check if this is a script loading error
    const isScriptError = event.target && 
      (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK');
    
    // Check if this is likely from a browser extension
    const isLikelyExtensionError = 
      (event.filename && (
        event.filename.includes('chrome-extension://') || 
        event.filename.includes('moz-extension://') ||
        event.filename.includes('extension://')
      )) || 
      (event.message && event.message.includes('background.js')) ||
      (event.error && event.error.stack && (
        event.error.stack.includes('background.js') ||
        event.error.stack.includes('chrome-extension://') ||
        event.error.stack.includes('moz-extension://')
      ));
    
    if (isScriptError || isLikelyExtensionError) {
      // Log the error but don't let it propagate to the console
      if (!suppressConsoleErrors) {
        console.warn('Suppressed likely extension error:', {
          message: event.message,
          source: event.filename || 'unknown',
          isScriptError,
          isLikelyExtensionError
        });
      }
      
      // Prevent the error from showing in the console
      event.preventDefault();
      return true; // Prevent default
    }
    
    // Let other errors propagate normally
    return false;
  };
  
  // Add the error handler
  window.addEventListener('error', errorHandler, true);
  
  // Return a function to remove the handler
  return () => window.removeEventListener('error', errorHandler, true);
}

/**
 * Installs a handler for unhandled promise rejections
 * @param {boolean} suppressConsoleErrors - Whether to suppress console errors
 * @returns {Function} - Function to remove the rejection handler
 */
export function installPromiseRejectionHandler(suppressConsoleErrors = false) {
  // Handler for unhandled promise rejections
  const rejectionHandler = (event) => {
    const reason = event.reason;
    const reasonString = String(reason);
    
    // Check if this is likely from a browser extension
    const isLikelyExtensionError = 
      reasonString.includes('background.js') ||
      reasonString.includes('chrome-extension://') ||
      reasonString.includes('moz-extension://') ||
      reasonString.includes('extension://');
    
    if (isLikelyExtensionError) {
      // Log the error but don't let it propagate to the console
      if (!suppressConsoleErrors) {
        console.warn('Suppressed likely extension promise rejection:', {
          reason: reasonString
        });
      }
      
      // Prevent the error from showing in the console
      event.preventDefault();
      return true; // Prevent default
    }
    
    // Let other rejections propagate normally
    return false;
  };
  
  // Add the rejection handler
  window.addEventListener('unhandledrejection', rejectionHandler, true);
  
  // Return a function to remove the handler
  return () => window.removeEventListener('unhandledrejection', rejectionHandler, true);
}

/**
 * Installs all global error handlers
 * @param {boolean} suppressConsoleErrors - Whether to suppress console errors
 * @returns {Function} - Function to remove all handlers
 */
export function installAllErrorHandlers(suppressConsoleErrors = false) {
  const removeErrorHandler = installGlobalErrorHandler(suppressConsoleErrors);
  const removeRejectionHandler = installPromiseRejectionHandler(suppressConsoleErrors);
  
  return () => {
    removeErrorHandler();
    removeRejectionHandler();
  };
} 