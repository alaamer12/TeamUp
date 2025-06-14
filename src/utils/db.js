import { get, set, del } from 'idb-keyval';
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
    // If it has an ID, it's an update
    if (teamData.id) {
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
  if (!teamData.id) {
    throw new Error('Team request ID is required for updates');
  }
  
  try {
    // Try to update on the backend first
    const updatedRequest = await apiUpdateTeamRequest(teamData.id, teamData);
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
    const index = requests.findIndex(r => r.id === teamData.id);
    
    if (index === -1) {
      throw new Error('Team request not found');
    }
    
    // Check ownership
    if (requests[index].ownerFingerprint !== teamData.ownerFingerprint) {
      throw new Error('Not authorized to update this request');
    }
    
    // Update the request
    const updatedRequest = {
      ...teamData,
      updatedAt: new Date().toISOString()
    };
    
    requests[index] = updatedRequest;
    
    // Save back to IndexedDB
    await set(TEAM_REQUESTS_KEY, requests);
    notifyListingsUpdated();
    
    return updatedRequest;
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
      try {
        const requests = await fetchTeamRequests();
        console.log("Successfully fetched team requests from API:", requests.length);
        return requests;
      } catch (error) {
        console.error('Failed to fetch team requests from API:', error);
        isOfflineMode = true;
      }
    }
    
    // Fallback to local storage
    try {
      const localRequests = await get(TEAM_REQUESTS_KEY) || [];
      console.log("Using local team requests:", localRequests.length);
      return localRequests;
    } catch (error) {
      console.error('Failed to get local team requests:', error);
      return [];
    }
  } catch (error) {
    console.error('Unexpected error in getTeamRequests:', error);
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
