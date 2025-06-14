/**
 * API client for communicating with the backend server
 */

// Try port 8080 first, then fall back to 3000 if needed
const API_URLS = [
  'http://localhost:8080/api',
  'http://localhost:3000/api'
];

/**
 * Attempt to fetch from multiple API URLs
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithFallback(endpoint, options = {}) {
  let lastError;
  
  for (const baseUrl of API_URLS) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, options);
      if (response.ok) {
        return response;
      }
      lastError = new Error(`HTTP error ${response.status}`);
    } catch (error) {
      lastError = error;
      // Continue to next URL
    }
  }
  
  throw lastError || new Error('Failed to connect to any API endpoint');
}

/**
 * Fetch all team requests from the server
 * @returns {Promise<Array>} Array of team requests
 */
export async function fetchTeamRequests() {
  try {
    const response = await fetchWithFallback('/requests');
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
    const response = await fetchWithFallback('/requests', {
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
    const response = await fetchWithFallback(`/requests/${id}`, {
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
    const response = await fetchWithFallback(`/requests/${id}`, {
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