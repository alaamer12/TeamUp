import { fetchTeamRequests, createTeamRequest, updateTeamRequest as apiUpdateTeamRequest, deleteTeamRequest as apiDeleteTeamRequest } from './api-client';

// Cache for team requests to reduce API calls
let teamRequestsCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

/**
 * Save a new team request to the server
 * @param {Object} teamData - Team request data
 * @returns {Promise<string>} - ID of the created team request
 */
export async function saveTeamRequest(teamData) {
  try {
    const response = await createTeamRequest(teamData);
    notifyListingsUpdate();
    invalidateCache();
    return response.id;
  } catch (error) {
    console.error('Failed to save team request:', error);
    throw error;
  }
}

/**
 * Get all team requests from the server
 * @param {boolean} forceRefresh - Whether to bypass the cache
 * @returns {Promise<Array>} - Array of team requests
 */
export async function getTeamRequests(forceRefresh = false) {
  const now = Date.now();
  
  // Use cache if available and not expired
  if (!forceRefresh && teamRequestsCache && (now - lastFetchTime < CACHE_TTL)) {
    return teamRequestsCache;
  }
  
  try {
    const teams = await fetchTeamRequests();
    
    // Update cache
    teamRequestsCache = teams;
    lastFetchTime = now;
    
    return teams;
  } catch (error) {
    console.error('Failed to fetch team requests:', error);
    // If we have a cache, return it even if expired
    if (teamRequestsCache) {
      return teamRequestsCache;
    }
    throw error;
  }
}

/**
 * Delete a team request
 * @param {string} id - Team request ID
 * @param {string} ownerFingerprint - Owner's fingerprint for verification
 * @returns {Promise<void>}
 */
export async function deleteTeamRequest(id, ownerFingerprint) {
  try {
    await apiDeleteTeamRequest(id, ownerFingerprint);
    notifyListingsUpdate();
    invalidateCache();
  } catch (error) {
    console.error('Failed to delete team request:', error);
    throw error;
  }
}

/**
 * Update a team request
 * @param {string} id - Team request ID
 * @param {Object} updatedData - Updated team data
 * @returns {Promise<Object>} - Updated team request
 */
export async function updateTeamRequest(id, updatedData) {
  try {
    const response = await apiUpdateTeamRequest(id, updatedData);
    notifyListingsUpdate();
    invalidateCache();
    return response;
  } catch (error) {
    console.error('Failed to update team request:', error);
    throw error;
  }
}

/**
 * Invalidate the cache to force a refresh on next fetch
 */
function invalidateCache() {
  teamRequestsCache = null;
  lastFetchTime = 0;
}

// BroadcastChannel for cross-tab sync
const channel = new BroadcastChannel('team-listings-sync');

/**
 * Notify other tabs that listings have been updated
 */
function notifyListingsUpdate() {
  channel.postMessage({ type: 'LISTINGS_UPDATED' });
}

/**
 * Subscribe to listings updates from other tabs
 * @param {Function} callback - Callback function to be called when listings are updated
 * @returns {Function} - Unsubscribe function
 */
export function subscribeToListingsUpdates(callback) {
  const handleMessage = (event) => {
    if (event.data?.type === 'LISTINGS_UPDATED') {
      // Invalidate cache when we receive an update
      invalidateCache();
      callback(event);
    }
  };
  
  channel.addEventListener('message', handleMessage);
  return () => channel.removeEventListener('message', handleMessage);
}
