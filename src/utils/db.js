import { get, set } from 'idb-keyval';
import { createTeamRequest, fetchTeamRequests, deleteTeamRequest as apiDeleteTeamRequest, updateTeamRequest as apiUpdateTeamRequest } from './api-client';
import { v4 as uuidv4 } from 'uuid';

// Key for storing team requests in IndexedDB
const TEAM_REQUESTS_KEY = 'teamup-team-requests';

// Flag to track if we're in offline mode
let isOfflineMode = false;

/**
 * Save a team request
 * @param {Object} teamData - Team request data
 * @returns {Promise<Object>} Saved team request
 */
export async function saveTeamRequest(teamData) {
  try {
    // Check if this is an update operation more reliably
    // Check both id and ID (for case inconsistencies) and ensure it's defined
    const isUpdate = !!(teamData.id || teamData.ID);
    
    // Ensure id is always available in the correct case
    if (teamData.ID && !teamData.id) {
      teamData.id = teamData.ID;
    }
    
    if (isUpdate) {
      console.log(`Update operation detected for ID: ${teamData.id}`);
      return await updateTeamRequest(teamData);
    }
    
    // Otherwise it's a new request
    const savedRequest = await createTeamRequest(teamData);
    notifyListingsUpdated();
    return savedRequest;
  } catch (error) {
    console.error('Failed to save team request:', error);
    
    // Fallback to local storage if backend fails
    isOfflineMode = true;
    
    // Generate an ID and add timestamp if it's a new request
    const newRequest = {
      ...teamData,
      id: teamData.id || uuidv4(),
      createdAt: teamData.createdAt || new Date().toISOString()
    };
    
    // Get existing requests
    let requests = [];
    try {
      requests = await get(TEAM_REQUESTS_KEY) || [];
    } catch (e) {
      // If get fails, start with empty array
      requests = [];
    }
    
    // If it has an ID, update existing request
    if (teamData.id) {
      const index = requests.findIndex(r => r.id === teamData.id);
      if (index !== -1) {
        requests[index] = {
          ...newRequest,
          updatedAt: new Date().toISOString()
        };
      } else {
        // If not found, add as new
        requests.push(newRequest);
      }
    } else {
      // Add new request
      requests.push(newRequest);
    }
    
    // Save back to IndexedDB
    await set(TEAM_REQUESTS_KEY, requests);
    
    // Show offline mode notification
    console.log('Operating in offline mode - data saved locally');
    notifyListingsUpdated();
    
    return newRequest;
  }
}

/**
 * Update a team request
 * @param {Object} teamData - Team request data with ID
 * @returns {Promise<Object>} Updated team request
 */
export async function updateTeamRequest(teamData) {
  // Make sure we have an ID - normalize it if necessary
  const id = teamData.id || teamData.ID;
  
  if (!id) {
    throw new Error('Team request ID is required for updates');
  }
  
  // Normalize the ID in teamData
  teamData.id = id;
  
  // Ensure we have the owner fingerprint in both formats for consistency
  if (teamData.ownerFingerprint && !teamData.owner_fingerprint) {
    teamData.owner_fingerprint = teamData.ownerFingerprint;
  } else if (teamData.owner_fingerprint && !teamData.ownerFingerprint) {
    teamData.ownerFingerprint = teamData.owner_fingerprint;
  }
  
  try {
    // Try to update on the backend first
    console.log(`Sending update request for ID: ${id}, fingerprint: ${teamData.ownerFingerprint?.substring(0, 10) || 'undefined'}...`);
    
    // Clear any cached data that could interfere with the update
    await clearCachedRequest(id);
    
    const updatedRequest = await apiUpdateTeamRequest(id, teamData);
    
    // Force a complete refresh of the listings data
    await invalidateCache();
    notifyListingsUpdated();
    
    return updatedRequest;
  } catch (error) {
    console.error('Failed to update team request:', error);
    
    // Fallback to local storage
    isOfflineMode = true;
    
    // Get existing requests
    let requests = [];
    try {
      requests = await get(TEAM_REQUESTS_KEY) || [];
    } catch (e) {
      requests = [];
    }
    
    // Find and update the request
    const index = requests.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('Team request not found');
    }
    
    // Check ownership - use either format of the fingerprint
    const ownerFingerprint = teamData.ownerFingerprint || teamData.owner_fingerprint;
    const storedFingerprint = requests[index].ownerFingerprint || requests[index].owner_fingerprint;
    
    if (storedFingerprint && ownerFingerprint && storedFingerprint !== ownerFingerprint) {
      throw new Error('Not authorized to update this request');
    }
    
    // Update the request
    const updatedRequest = {
      ...requests[index],
      ...teamData,
      id: id, // Ensure ID is preserved
      updatedAt: new Date().toISOString(),
      // Ensure status is preserved if not explicitly provided
      status: teamData.status !== undefined ? teamData.status : requests[index].status
    };
    
    requests[index] = updatedRequest;
    
    // Save back to IndexedDB
    await set(TEAM_REQUESTS_KEY, requests);
    notifyListingsUpdated();
    
    return updatedRequest;
  }
}

/**
 * Clear a cached request by ID
 * @param {string} id - Request ID to clear from cache
 * @returns {Promise<void>}
 */
export async function clearCachedRequest(id) {
  try {
    const requests = await get(TEAM_REQUESTS_KEY) || [];
    const filtered = requests.filter(r => r.id !== id);
    
    // Only update if there was a change
    if (filtered.length !== requests.length) {
      await set(TEAM_REQUESTS_KEY, filtered);
    }
  } catch (error) {
    console.error('Failed to clear cached request:', error);
  }
}

/**
 * Invalidate all cached data to force fetch from server
 */
export async function invalidateCache() {
  try {
    isOfflineMode = false;
    await set(TEAM_REQUESTS_KEY, null);
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
  }
}

/**
 * Get all team requests
 * @returns {Promise<Array>} Team requests
 */
export async function getTeamRequests() {
  console.log('Getting team requests. Offline mode:', isOfflineMode);
  
  try {
    // Try to fetch from backend first
    if (!isOfflineMode) {
      console.log('Fetching team requests from server...');
      
      try {
        const requests = await fetchTeamRequests();
        console.log(`Fetched ${requests?.length || 0} team requests from server:`, requests);
        
        // Save to local cache for offline use
        try {
          await set(TEAM_REQUESTS_KEY, requests);
          console.log('Saved team requests to local cache');
        } catch (cacheError) {
          console.warn('Failed to update local cache:', cacheError);
        }
        
        if (!requests || requests.length === 0) {
          console.warn('Server returned empty team requests array!');
        }
        
        return requests;
      } catch (fetchError) {
        console.error('Error during server fetch:', fetchError);
        isOfflineMode = true;
        throw fetchError;
      }
    } else {
      console.log('Using offline mode for team requests');
    }
  } catch (error) {
    console.error('Failed to fetch team requests:', error);
    isOfflineMode = true;
  }
  
  // Fallback to local storage
  try {
    console.log('Falling back to local cache for team requests');
    const localRequests = await get(TEAM_REQUESTS_KEY) || [];
    console.log(`Retrieved ${localRequests.length} team requests from local cache`);
    return localRequests;
  } catch (error) {
    console.error('Failed to get local team requests:', error);
    return [];
  }
}

/**
 * Delete a team request
 * @param {string} id - Team request ID
 * @param {string} ownerFingerprint - Owner's fingerprint
 * @returns {Promise<void>}
 */
export async function deleteTeamRequest(id, ownerFingerprint) {
  try {
    // Try to delete from backend first
    if (!isOfflineMode) {
      await apiDeleteTeamRequest(id, ownerFingerprint);
      notifyListingsUpdated();
      return;
    }
  } catch (error) {
    console.error('Failed to delete team request:', error);
    isOfflineMode = true;
  }
  
  // Fallback to local storage
  try {
    let requests = await get(TEAM_REQUESTS_KEY) || [];
    
    // Find the request
    const request = requests.find(r => r.id === id);
    
    // Check ownership
    if (!request || request.ownerFingerprint !== ownerFingerprint) {
      throw new Error('Not authorized to delete this request');
    }
    
    // Filter out the request
    requests = requests.filter(r => r.id !== id);
    
    // Save back to IndexedDB
    await set(TEAM_REQUESTS_KEY, requests);
    notifyListingsUpdated();
  } catch (error) {
    console.error('Failed to delete local team request:', error);
    throw error;
  }
}

/**
 * Subscribe to listings updates
 * @param {Function} callback - Callback to run when listings are updated
 * @returns {Function} Unsubscribe function
 */
export function subscribeToListingsUpdates(callback) {
  const channel = new BroadcastChannel('teamup-listings');
  
  channel.addEventListener('message', callback);
  
  return () => {
    channel.removeEventListener('message', callback);
    channel.close();
  };
}

/**
 * Notify other tabs that listings have been updated
 */
export function notifyListingsUpdated() {
  const channel = new BroadcastChannel('teamup-listings');
  channel.postMessage({ type: 'LISTINGS_UPDATED' });
}

/**
 * Force refresh team requests from the server
 * Use this when you need to ensure you have the latest data
 * @returns {Promise<Array>} Team requests
 */
export async function forceRefreshTeamRequests() {
  try {
    console.log('Force refreshing team requests from server...');
    
    // Clear local cache first
    await invalidateCache();
    
    // Then fetch from server
    const requests = await fetchTeamRequests();
    
    // Save to local cache for offline use
    try {
      await set(TEAM_REQUESTS_KEY, requests);
    } catch (cacheError) {
      console.warn('Failed to update local cache:', cacheError);
    }
    
    // Notify any listeners
    notifyListingsUpdated();
    
    return requests;
  } catch (error) {
    console.error('Failed to force refresh team requests:', error);
    throw error;
  }
}

/**
 * Recovery function to reset the app state and fetch fresh data
 * Call this function when cards are not showing but you know data exists
 * @returns {Promise<Array>} Team requests
 */
export async function recoverAppState() {
  console.log('%c🚑 Starting recovery process...', 'font-weight: bold; color: orange');
  
  try {
    // 1. Reset offline mode flag
    isOfflineMode = false;
    console.log('Reset offline mode flag');
    
    // 2. Clear any existing cache
    await set(TEAM_REQUESTS_KEY, null);
    console.log('Cleared local cache');
    
    // 3. Try direct fetch with no caching
    console.log('Attempting direct API fetch...');
    
    // Import dynamically to avoid circular imports
    const { API_URL } = await import('./api-client.js');
    
    // Add timestamp to URL to bypass browser cache
    const timestamp = Date.now();
    const url = `${API_URL}/requests?nocache=${timestamp}`;
    console.log(`Fetching from: ${url}`);
    
    // Direct fetch with minimal headers to avoid CORS issues
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Parse the response
    const freshData = await response.json();
    console.log(`Received ${freshData.length} records directly from API`);
    
    // 4. Save the data to cache
    await set(TEAM_REQUESTS_KEY, freshData);
    console.log('Saved fresh data to local cache');
    
    // 5. Notify about the update
    notifyListingsUpdated();
    console.log('%c✅ Recovery process completed successfully', 'font-weight: bold; color: green');
    
    return freshData;
  } catch (error) {
    console.error('Recovery process failed:', error);
    throw error;
  }
}

// Expose recovery function to browser console for easy access
if (typeof window !== 'undefined') {
  window.recoverAppState = recoverAppState;
}
