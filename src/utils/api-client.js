/**
 * API client for communicating with the backend server
 */

// Production API URL - use environment variable if available, otherwise use default
const API_URL = import.meta.env.VITE_API_URL || 'https://teamup-server.vercel.app/api';

// Log the API URL being used (helpful for debugging)
console.log(`Using API URL: ${API_URL} (${import.meta.env.MODE} mode)`);

/**
 * Fetch with appropriate API URL based on environment
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchApi(endpoint, options = {}) {
  try {
    // Always use the configured API URL
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      // Add CORS mode to ensure proper cross-origin requests
      mode: 'cors',
      credentials: 'omit',
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Attempt to fetch from multiple API URLs in development
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithFallback(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (response.ok) {
      return response;
    }
    throw new Error(`HTTP error ${response.status}`);
  } catch (error) {
    console.error('Failed to connect to the API endpoint:', error);
    throw error;
  }
}

/**
 * Fetch all team requests from the server
 * @returns {Promise<Array>} Array of team requests
 */
export async function fetchTeamRequests() {
  try {
    const response = await fetchApi('/requests');
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
    // Format team data correctly
    const formattedData = { 
      ...teamData,
      // Ensure correct property names match the database schema
      owner_fingerprint: teamData.ownerFingerprint || teamData.owner_fingerprint,
      contact_email: teamData.contactEmail || teamData.contact_email,
      contact_discord: teamData.contactDiscord || teamData.contact_discord,
      group_size: teamData.groupSize || teamData.group_size
    };
    
    const response = await fetchApi('/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
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
    // Ensure we have a valid fingerprint
    const ownerFingerprint = teamData.ownerFingerprint || teamData.owner_fingerprint;
    
    if (!ownerFingerprint) {
      throw new Error('Owner fingerprint is required for updates');
    }
    
    console.log(`Attempting to update team request ${id} with fingerprint: ${ownerFingerprint.substring(0, 10)}...`);
    
    // Format team data correctly
    const formattedData = { 
      ...teamData,
      // Ensure correct property names match the database schema
      ownerFingerprint: ownerFingerprint,
      owner_fingerprint: ownerFingerprint, // Include both formats for backward compatibility
      contact_email: teamData.contactEmail || teamData.contact_email,
      contact_discord: teamData.contactDiscord || teamData.contact_discord,
      group_size: teamData.groupSize || teamData.group_size
    };
    
    const response = await fetchApi(`/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
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
    // Ensure we have a valid fingerprint
    if (!ownerFingerprint) {
      throw new Error('Owner fingerprint is required for deletion');
    }
    
    console.log(`Attempting to delete team request ${id} with fingerprint: ${ownerFingerprint.substring(0, 10)}...`);
    
    const response = await fetchApi(`/requests/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        ownerFingerprint,
        // Include both formats for backward compatibility
        owner_fingerprint: ownerFingerprint
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting team request:', error);
    throw error;
  }
} 