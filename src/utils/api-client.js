/**
 * API client for communicating with the backend server
 */

// Use relative API paths for production, with fallback for local development
const API_URL = '/api';

/**
 * Fetch from the API with proper error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchFromAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Fetch all team requests from the server
 * @returns {Promise<Array>} Array of team requests
 */
export async function fetchTeamRequests() {
  try {
    const response = await fetchFromAPI('/requests');
    return await response.json();
  } catch (error) {
    console.error('Error fetching team requests:', error);
    throw error;
  }
}

/**
 * Create a new team request on the server
 * @param {Object} teamData - Team request data
 * @returns {Promise<Object>} Created team request
 */
export async function createTeamRequest(teamData) {
  try {
    const response = await fetchFromAPI('/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error creating team request:', error);
    throw error;
  }
}

/**
 * Update an existing team request
 * @param {string} id - Team request ID
 * @param {Object} teamData - Updated team request data
 * @returns {Promise<Object>} Updated team request
 */
export async function updateTeamRequest(id, teamData) {
  try {
    const response = await fetchFromAPI(`/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error updating team request:', error);
    throw error;
  }
}

/**
 * Delete a team request
 * @param {string} id - Team request ID
 * @param {string} ownerFingerprint - Owner's fingerprint for verification
 * @returns {Promise<Object>} Success message
 */
export async function deleteTeamRequest(id, ownerFingerprint) {
  try {
    const response = await fetchFromAPI(`/requests/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ownerFingerprint }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting team request:', error);
    throw error;
  }
} 