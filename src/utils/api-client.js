/**
 * API client for communicating with the backend server
 */

// Development API URLs (local)
const DEV_API_URLS = [
  'http://localhost:8080/api',
  'http://localhost:3000/api'
];

// Production API URL 
const PROD_API_URL = 'https://teamup-backend.vercel.app/api';

// Use production URL in production, fallback to dev URLs in development
const API_URL = import.meta.env.PROD ? PROD_API_URL : DEV_API_URLS[0];

/**
 * Fetch with appropriate API URL based on environment
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchApi(endpoint, options = {}) {
  try {
    // Use production URL in production
    if (import.meta.env.PROD) {
      const response = await fetch(`${API_URL}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response;
    }
    
    // Try development URLs with fallback in development
    return await fetchWithFallback(endpoint, options);
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
  let lastError;
  
  for (const baseUrl of DEV_API_URLS) {
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
    // Format team data correctly
    const formattedData = { 
      ...teamData,
      // Ensure correct property names match the database schema
      owner_fingerprint: teamData.ownerFingerprint || teamData.owner_fingerprint,
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
    const response = await fetchApi(`/requests/${id}`, {
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