import { get, set, del } from 'idb-keyval';
import { createTeamRequest, fetchTeamRequests, deleteTeamRequest as apiDeleteTeamRequest, updateTeamRequest as apiUpdateTeamRequest } from './api-client';
import { v4 as uuidv4 } from 'uuid';

// Key for storing team requests in IndexedDB
const TEAM_REQUESTS_KEY = 'teamup-team-requests';
const OFFLINE_CHANGES_KEY = 'teamup-offline-changes';

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
    if (teamData.id || teamData._id) {
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
      id: teamData.id || teamData._id || uuidv4(),
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
    if (teamData.id || teamData._id) {
      const id = teamData.id || teamData._id;
      const index = requests.findIndex(r => r.id === id || r._id === id);
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
    
    // Track offline changes for future sync
    await trackOfflineChange('create', newRequest);
    
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
  const id = teamData.id || teamData._id;
  
  if (!id) {
    throw new Error('Team request ID is required for updates');
  }
  
  try {
    // Try to update on the backend first
    const updatedRequest = await apiUpdateTeamRequest(id, teamData);
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
    const index = requests.findIndex(r => r.id === id || r._id === id);
    
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
    
    // Track offline changes for future sync
    await trackOfflineChange('update', updatedRequest);
    
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
      const requests = await fetchTeamRequests();
      
      // Update local cache with the latest data
      await set(TEAM_REQUESTS_KEY, requests);
      
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
    const request = requests.find(r => r.id === id || r._id === id);
    
    // Check ownership
    if (!request || request.ownerFingerprint !== ownerFingerprint) {
      throw new Error('Not authorized to delete this request');
    }
    
    // Filter out the request
    requests = requests.filter(r => r.id !== id && r._id !== id);
    
    // Save back to IndexedDB
    await set(TEAM_REQUESTS_KEY, requests);
    
    // Track offline changes for future sync
    await trackOfflineChange('delete', { id, ownerFingerprint });
    
    notifyListingsUpdated();
  } catch (error) {
    console.error('Failed to delete local team request:', error);
    throw error;
  }
}

/**
 * Track changes made while offline for future synchronization
 * @param {string} action - The action performed (create, update, delete)
 * @param {Object} data - The data associated with the action
 */
async function trackOfflineChange(action, data) {
  try {
    const changes = await get(OFFLINE_CHANGES_KEY) || [];
    changes.push({
      action,
      data,
      timestamp: new Date().toISOString()
    });
    await set(OFFLINE_CHANGES_KEY, changes);
  } catch (error) {
    console.error('Failed to track offline change:', error);
  }
}

/**
 * Synchronize offline changes with the server when back online
 * @returns {Promise<boolean>} Whether sync was successful
 */
export async function syncOfflineChanges() {
  try {
    const changes = await get(OFFLINE_CHANGES_KEY) || [];
    
    if (changes.length === 0) {
      return true; // Nothing to sync
    }
    
    console.log(`Syncing ${changes.length} offline changes...`);
    
    // Sort changes by timestamp
    changes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const failedChanges = [];
    
    // Process each change
    for (const change of changes) {
      try {
        switch (change.action) {
          case 'create':
            await createTeamRequest(change.data);
            break;
          case 'update':
            const id = change.data.id || change.data._id;
            await apiUpdateTeamRequest(id, change.data);
            break;
          case 'delete':
            await apiDeleteTeamRequest(change.data.id, change.data.ownerFingerprint);
            break;
        }
      } catch (error) {
        console.error(`Failed to sync ${change.action} operation:`, error);
        failedChanges.push(change);
      }
    }
    
    // Update the offline changes to only include failed ones
    await set(OFFLINE_CHANGES_KEY, failedChanges);
    
    // Reset offline mode if all changes were synced
    if (failedChanges.length === 0) {
      isOfflineMode = false;
      console.log('All offline changes synced successfully');
      return true;
    } else {
      console.log(`${failedChanges.length} changes failed to sync`);
      return false;
    }
  } catch (error) {
    console.error('Failed to sync offline changes:', error);
    return false;
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
 * Check if we're online and try to sync offline changes
 */
export function setupOnlineSync() {
  // Check if we're online when the app loads
  if (navigator.onLine && isOfflineMode) {
    syncOfflineChanges();
  }
  
  // Listen for online events
  window.addEventListener('online', () => {
    console.log('Back online, attempting to sync changes...');
    syncOfflineChanges();
  });
  
  // Listen for offline events
  window.addEventListener('offline', () => {
    console.log('Gone offline, changes will be saved locally');
    isOfflineMode = true;
  });
}
