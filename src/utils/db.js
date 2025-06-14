import { get, set, del } from 'idb-keyval';
import { createTeamRequest, fetchTeamRequests, deleteTeamRequest as apiDeleteTeamRequest } from './api-client';
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
    // Try to save to backend first
    const savedRequest = await createTeamRequest(teamData);
    notifyListingsUpdated();
    return savedRequest;
  } catch (error) {
    console.error('Failed to save team request:', error);
    
    // Fallback to local storage if backend fails
    isOfflineMode = true;
    
    // Generate an ID and add timestamp
    const newRequest = {
      ...teamData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    
    // Get existing requests
    let requests = [];
    try {
      requests = await get(TEAM_REQUESTS_KEY) || [];
    } catch (e) {
      // If get fails, start with empty array
      requests = [];
    }
    
    // Add new request
    requests.push(newRequest);
    
    // Save back to IndexedDB
    await set(TEAM_REQUESTS_KEY, requests);
    
    // Show offline mode notification
    console.log('Operating in offline mode - data saved locally');
    notifyListingsUpdated();
    
    return newRequest;
  }
}

/**
 * Get all team requests
 * @returns {Promise<Array>} Team requests
 */
export async function getTeamRequests() {
  try {
    // Try to fetch from backend first
    if (!isOfflineMode) {
      const requests = await fetchTeamRequests();
      return requests;
    }
  } catch (error) {
    console.error('Failed to fetch team requests:', error);
    isOfflineMode = true;
  }
  
  // Fallback to local storage
  try {
    const localRequests = await get(TEAM_REQUESTS_KEY) || [];
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
