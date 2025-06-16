/**
 * Supabase client utility for direct database access
 * Only use for frontend-specific operations when needed
 */
import { createClient } from '@supabase/supabase-js';

// Public Supabase URL and anon key (these are safe to expose in browser code)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single Supabase client for the whole app
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get all team requests with their members
 * @returns {Promise<Array>} - Array of team requests with members
 */
export const getRequests = async () => {
  try {
    // Get all requests
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (requestsError) {
      console.error('Error fetching requests:', requestsError);
      throw requestsError;
    }
    
    // For each request, get the team members
    const requestsWithMembers = await Promise.all(
      requests.map(async (request) => {
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('*')
          .eq('request_id', request.id);
        
        if (membersError) {
          console.error(`Error fetching members for request ${request.id}:`, membersError);
          return { ...request, members: [] };
        }
        
        return { ...request, members: members || [] };
      })
    );
    
    return requestsWithMembers;
  } catch (error) {
    console.error('Error fetching requests with members:', error);
    throw error;
  }
};

/**
 * Get a single team request by ID with its members
 * @param {string} id - Request ID
 * @returns {Promise<Object>} - Team request object with members
 */
export const getRequestById = async (id) => {
  try {
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (requestError) {
      console.error('Error fetching request:', requestError);
      throw requestError;
    }
    
    // Get the team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('request_id', id);
    
    if (membersError) {
      console.error(`Error fetching members for request ${id}:`, membersError);
      return { ...request, members: [] };
    }
    
    return { ...request, members: members || [] };
  } catch (error) {
    console.error('Error fetching request with members:', error);
    throw error;
  }
};

/**
 * Create a new team request with members if provided
 * @param {Object} requestData - Team request data
 * @returns {Promise<Object>} - Created team request with members
 */
export const createRequest = async (requestData) => {
  try {
    // Extract members from request data if present
    const { members, ...requestFields } = requestData;
    
    // Ensure correct property names match the database schema
    const formattedRequest = {
      ...requestFields,
      owner_fingerprint: requestFields.ownerFingerprint || requestFields.owner_fingerprint
    };
    
    // Insert the request
    const { data: createdRequest, error: requestError } = await supabase
      .from('requests')
      .insert([formattedRequest])
      .select();
    
    if (requestError) {
      console.error('Error creating request:', requestError);
      throw requestError;
    }
    
    const newRequest = createdRequest[0];
    
    // If members are provided, add them to the team_members table
    let createdMembers = [];
    if (members && Array.isArray(members) && members.length > 0) {
      const teamMembers = members.map(member => ({
        request_id: newRequest.id,
        tech_field: member.tech_field || null,
        gender: member.gender || null, 
        major: member.major || null,
        planguage: member.planguage || null,
        already_know: member.already_know || false
      }));
      
      const { data: insertedMembers, error: membersError } = await supabase
        .from('team_members')
        .insert(teamMembers)
        .select();
      
      if (membersError) {
        console.error('Error adding team members:', membersError);
      } else {
        createdMembers = insertedMembers;
      }
    }
    
    // Return the created request with members
    return { ...newRequest, members: createdMembers };
  } catch (error) {
    console.error('Error creating request with members:', error);
    throw error;
  }
};

export default supabase; 