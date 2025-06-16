/**
 * API client for communicating with the backend server
 */

// Production API URL - use environment variable if available, otherwise use default
export const API_URL = (() => {
  // Get the configured API URL from environment
  const configuredUrl = import.meta.env.VITE_API_URL;
  
  // If we have a configured URL, use it
  if (configuredUrl) {
    console.log(`Using configured API URL: ${configuredUrl}`);
    return configuredUrl;
  }
  
  // Otherwise use development or production fallbacks
  const isDev = import.meta.env.MODE === 'development';
  const defaultUrl = isDev ? 'http://localhost:8080/api' : 'https://teamup-server.vercel.app/api';
  
  console.log(`Using default ${isDev ? 'development' : 'production'} API URL: ${defaultUrl}`);
  return defaultUrl;
})();

// Log the API URL being used (helpful for debugging)
console.log(`API client initialized with URL: ${API_URL} (${import.meta.env.MODE} mode)`);

/**
 * Fetch with appropriate API URL based on environment
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchApi(endpoint, options = {}) {
  try {
    const timestamp = Date.now();
    const cacheBuster = endpoint.includes('?') ? `&_t=${timestamp}` : `?_t=${timestamp}`;
    
    // Always use the configured API URL
    const response = await fetch(`${API_URL}${endpoint}${cacheBuster}`, {
      ...options,
      // Add CORS mode to ensure proper cross-origin requests
      mode: 'cors',
      credentials: 'omit',
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        // Don't add additional headers that would trigger preflight unless needed
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
    console.log(`Fetching team requests from API: ${API_URL}/requests`);
    const startTime = Date.now();
    
    const response = await fetchApi('/requests');
    console.log(`API response received in ${Date.now() - startTime}ms`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    // Check if the response is valid JSON
    let data;
    try {
      data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('API returned non-array response:', data);
        return [];
      }
      
      console.log(`Successfully fetched ${data.length} team requests from API`);
      return data;
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      throw new Error('Invalid response format');
    }
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
      owner_fingerprint: teamData.ownerFingerprint || teamData.owner_fingerprint
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
    if (!id) {
      throw new Error('Team request ID is required for updates');
    }

    // Ensure we have a valid fingerprint - check both formats
    const ownerFingerprint = teamData.ownerFingerprint || teamData.owner_fingerprint;
    
    if (!ownerFingerprint) {
      throw new Error('Owner fingerprint is required for updates');
    }
    
    console.log(`Attempting to update team request ${id} with fingerprint: ${ownerFingerprint.substring(0, 10)}...`);
    
    // Extract common fields from teamData
    const { 
      user_name, userName, 
      user_gender, userGender,
      user_abstract, userAbstract,
      user_personal_phone, userPersonalPhone,
      // Remove fields that don't exist in the database schema
      contactEmail, contact_email,
      contactDiscord, contact_discord,
      groupSize, group_size,
      isAdminEdit, isAdmin, adminMode, 
      ...otherFields 
    } = teamData;
    
    // Format team data correctly - ensure both snake_case and camelCase for maximum compatibility
    const formattedData = { 
      // Include only known database fields
      id: id,
      
      // Handle user fields in both formats
      user_name: user_name || userName,
      user_gender: user_gender || userGender,
      user_abstract: user_abstract || userAbstract,
      user_personal_phone: user_personal_phone || userPersonalPhone,
      
      // Handle fingerprint in both formats
      ownerFingerprint: ownerFingerprint,
      owner_fingerprint: ownerFingerprint,
      
      // Include members if they exist
      members: otherFields.members
    };
    
    // Log the actual data being sent to the server
    console.log('Sending update with data:', { 
      id,
      user_name: formattedData.user_name,
      fields: Object.keys(formattedData)
    });
    
    // Add timestamp to URL to bypass browser cache
    const timestamp = Date.now();
    const url = `/requests/${id}?nocache=${timestamp}`;
    
    const response = await fetchApi(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedData),
    });
    
    // Verify the response before proceeding
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    const result = await response.json();
    
    // Verify response data contains the updated fields
    if (!result || typeof result !== 'object') {
      throw new Error('Received invalid response data from server');
    }
    
    // Log the update result for debugging
    console.log('Update successful:', {
      requestedName: formattedData.user_name,
      responseName: result.user_name,
      id: result.id
    });
    
    return result;
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