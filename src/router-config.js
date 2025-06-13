/**
 * React Router configuration with future flags enabled
 */

// Set React Router future flags to avoid warnings
if (typeof window !== 'undefined') {
  window.ROUTER_FUTURE_v7_relativeSplatPath = true;
  window.ROUTER_FUTURE_v7_startTransition = true;
}

// Export a function to ensure the flags are set
export function ensureRouterFutureFlags() {
  // This function is just to ensure the file is imported and executed
  return true;
} 