import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(__dirname, `../.env.${nodeEnv}`),
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get allowed origins from environment
const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS || '';
  const configuredOrigins = origins.split(',').map(origin => origin.trim()).filter(Boolean);
  
  // Always include these origins for development and backward compatibility
  const defaultOrigins = [
    'http://localhost:8081', 
    'http://localhost:8080', 
    'http://localhost:3000', 
    'https://teamup-app.vercel.app',
    'https://teamup-frontend-nine.vercel.app'  // Add the current frontend URL
  ];
  
  // Combine and deduplicate origins
  return [...new Set([...configuredOrigins, ...defaultOrigins])];
};

const allowedOrigins = getAllowedOrigins();
// Log the origins for debugging purposes, especially in production
console.log(`CORS: Allowed origins: [${allowedOrigins.join(', ')}]`);

const corsOptions = {
  origin: (origin, callback) => {
    // Log the incoming origin for every request
    console.log(`CORS: Incoming request from origin: ${origin || 'no origin'}`);

    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      console.log('CORS: Allowing request with no origin.');
      return callback(null, true);
    }
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.some(allowedOrigin => 
        origin === allowedOrigin || 
        origin.includes(allowedOrigin) || 
        allowedOrigin.includes(origin))) {
      console.log(`CORS: Origin ${origin} is allowed.`);
      return callback(null, true);
    } else {
      const msg = `CORS: The origin ${origin} is not allowed. Allowed origins: [${allowedOrigins.join(', ')}]`;
      console.warn(msg);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // Enable CORS preflight cache for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Configure CORS using the options
app.use(cors(corsOptions));

// Add OPTIONS handler for all routes to handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// Root route handler
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'TeamUp API',
    api_version: '1.0.4',
    app_version: '1.3.1',
    status: 'running',
    endpoints: {
      health: '/health',
      requests: '/api/requests'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.get('/api/requests', async (req, res) => {
  try {
    // Get all requests
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*');
    
    if (requestsError) throw requestsError;
    
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
    
    res.json(requestsWithMembers);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    // Extract team members and camelCase fields from request data
    const { 
      members, 
      ownerFingerprint,
      ...requestFields 
    } = req.body;
    
    // Create the main request with proper snake_case field names
    const newRequest = {
      id: uuidv4(),
      ...requestFields,
      // Handle both camelCase and snake_case versions
      owner_fingerprint: ownerFingerprint || requestFields.owner_fingerprint,
      created_at: new Date().toISOString()
    };
    
    // Insert the request
    const { data: createdRequest, error: requestError } = await supabase
      .from('requests')
      .insert([newRequest])
      .select();
    
    if (requestError) throw requestError;
    
    // If members are provided, add them to the team_members table
    if (members && Array.isArray(members) && members.length > 0) {
      const teamMembers = members.map(member => ({
        request_id: newRequest.id,
        tech_field: member.tech_field || null,
        gender: member.gender || null,
        major: member.major || null, 
        planguage: member.planguage || null,
        already_know: member.already_know || false
      }));
      
      const { error: membersError } = await supabase
        .from('team_members')
        .insert(teamMembers);
      
      if (membersError) {
        console.error('Error adding team members:', membersError);
        // Continue despite error with members
      }
    }
    
    // Return the created request
    res.status(201).json(createdRequest[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Accept both camelCase and snake_case versions for backward compatibility
    const ownerFingerprint = req.body.ownerFingerprint || req.body.owner_fingerprint;
    
    // Log the fingerprint being used (for debugging)
    console.log(`Delete request for ${id} with fingerprint: ${ownerFingerprint ? ownerFingerprint.substring(0, 10) + '...' : 'undefined'}`);
    
    if (!ownerFingerprint) {
      return res.status(400).json({ error: 'Owner fingerprint is required' });
    }
    
    // First check if request exists and belongs to user
    const { data: request, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Log the comparison (for debugging)
    console.log('Ownership check:', {
      provided: ownerFingerprint,
      stored: request.owner_fingerprint,
      match: request.owner_fingerprint === ownerFingerprint
    });
    
    // Check ownership
    if (request.owner_fingerprint !== ownerFingerprint) {
      return res.status(403).json({ error: 'Not authorized to delete this request' });
    }
    
    // Delete the request - this will cascade delete the team members due to the foreign key constraint
    const { error: deleteError } = await supabase
      .from('requests')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Make sure the ID from URL is used and properly logged
    console.log(`Processing update for request ID: ${id}`);
    
    // Extract members, camelCase fields from the request
    const { 
      members, 
      ownerFingerprint: reqOwnerFingerprint, 
      owner_fingerprint: reqOwnerFingerprintSnake,
      // Extract but don't use fields that might not exist in DB
      isAdminEdit, isAdmin, adminMode,
      // Other fields
      ...requestFields 
    } = req.body;
    
    // Use either camelCase or snake_case version
    const ownerFingerprint = reqOwnerFingerprint || reqOwnerFingerprintSnake;
    
    // Log the fingerprint being used (for debugging)
    console.log(`Update request for ${id} with fingerprint: ${ownerFingerprint ? ownerFingerprint.substring(0, 10) + '...' : 'undefined'}`);
    
    if (!ownerFingerprint) {
      return res.status(400).json({ error: 'Owner fingerprint is required' });
    }
    
    // First check if request exists and belongs to user
    const { data: request, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`Request not found for ID: ${id}`, fetchError);
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Log the comparison (for debugging)
    console.log('Ownership check for update:', {
      provided: ownerFingerprint,
      stored: request.owner_fingerprint,
      match: request.owner_fingerprint === ownerFingerprint
    });
    
    // Check ownership
    if (request.owner_fingerprint !== ownerFingerprint) {
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }
    
    // Create a filtered update object with only valid DB columns
    const validDbColumns = [
      'id', 'user_name', 'user_gender', 'user_abstract', 'user_personal_phone',
      'owner_fingerprint', 'status', 'created_at', 'updated_at'
    ];
    
    // Filter request fields to only include valid columns
    const filteredFields = {};
    Object.keys(requestFields).forEach(key => {
      if (validDbColumns.includes(key)) {
        filteredFields[key] = requestFields[key];
      }
    });
    
    // Update the request with proper snake_case field names
    // IMPORTANT: Preserve the original ID to prevent creating a new record
    const updatedRequest = {
      ...filteredFields,
      // Explicitly handle common fields
      user_name: requestFields.user_name || request.user_name,
      user_gender: requestFields.user_gender || request.user_gender,
      user_abstract: requestFields.user_abstract || request.user_abstract,
      user_personal_phone: requestFields.user_personal_phone || request.user_personal_phone,
      
      id: id, // Explicitly use the ID from the URL parameter
      created_at: request.created_at, // Preserve original creation date
      owner_fingerprint: request.owner_fingerprint, // Preserve original ownership
      updated_at: new Date().toISOString()
    };
    
    // Only update status if explicitly provided, otherwise preserve existing status
    updatedRequest.status = requestFields.status !== undefined ? requestFields.status : request.status;
    
    // Debug the update data
    console.log(`Updating request with ID: ${id}`, {
      originalUserName: request.user_name,
      newUserName: updatedRequest.user_name,
      fieldsChanged: Object.keys(filteredFields),
    });
    
    const { data, error } = await supabase
      .from('requests')
      .update(updatedRequest)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Error during update operation for ID: ${id}`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error(`Update operation did not return data for ID: ${id}`);
      return res.status(500).json({ error: 'Update operation failed' });
    }
    
    // Handle team members if provided
    if (members && Array.isArray(members)) {
      // First delete existing members
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('request_id', id);
      
      if (deleteError) {
        console.error('Error deleting team members:', deleteError);
      }
      
      // Then add new members if any
      if (members.length > 0) {
        const teamMembers = members.map(member => ({
          request_id: id,
          tech_field: member.tech_field || null,
          gender: member.gender || null,
          major: member.major || null,
          planguage: member.planguage || null,
          already_know: member.already_know || false
        }));
        
        const { error: membersError } = await supabase
          .from('team_members')
          .insert(teamMembers);
        
        if (membersError) {
          console.error('Error updating team members:', membersError);
        }
      }
    }
    
    // Get updated team members
    const { data: updatedMembers } = await supabase
      .from('team_members')
      .select('*')
      .eq('request_id', id);
    
    console.log(`Update completed successfully for ID: ${id}`);
    
    // Return the updated request with members
    res.json({ ...data[0], members: updatedMembers || [] });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});