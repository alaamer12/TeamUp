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

// Configure CORS - simplified for Vercel deployment
// In production on Vercel, we need a simpler CORS setup
app.use(cors({
  origin: '*', // Allow all origins in production for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Log CORS configuration
console.log('CORS configured to allow all origins');

// Add middleware to handle OPTIONS requests for CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

// Add manual CORS headers middleware for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

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
    version: '1.0.0',
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
      contactEmail, 
      contactDiscord, 
      groupSize,
      ...requestFields 
    } = req.body;
    
    // Create the main request with proper snake_case field names
    const newRequest = {
      id: uuidv4(),
      ...requestFields,
      // Handle both camelCase and snake_case versions
      owner_fingerprint: ownerFingerprint || requestFields.owner_fingerprint,
      contact_email: contactEmail || requestFields.contact_email,
      contact_discord: contactDiscord || requestFields.contact_discord,
      group_size: groupSize || requestFields.group_size,
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
    const { ownerFingerprint } = req.body;
    
    // First check if request exists and belongs to user
    const { data: request, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
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
    // Extract members, camelCase fields from the request
    const { 
      members, 
      ownerFingerprint, 
      contactEmail, 
      contactDiscord, 
      groupSize,
      ...updatedFields 
    } = req.body;
    
    // First check if request exists and belongs to user
    const { data: request, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Check ownership
    if (request.owner_fingerprint !== ownerFingerprint) {
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }
    
    // Update the request with proper snake_case field names
    const updatedRequest = {
      ...updatedFields,
      id: request.id,
      created_at: request.created_at,
      owner_fingerprint: request.owner_fingerprint,
      contact_email: contactEmail || updatedFields.contact_email,
      contact_discord: contactDiscord || updatedFields.contact_discord,
      group_size: groupSize || updatedFields.group_size,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('requests')
      .update(updatedRequest)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
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