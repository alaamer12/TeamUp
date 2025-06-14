import { Redis } from '@upstash/redis';

// Initialize Redis with explicit configuration
const redis = new Redis({
  url: process.env.REDIS_URL || process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Key for storing team requests
const TEAM_REQUESTS_KEY = 'teamup-requests';

const { v4: uuidv4 } = require('uuid');

export default async function handler(req, res) {
  // Add debugging
  console.log(`API Route: /api/requests, Method: ${req.method}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET - Fetch all requests
  if (req.method === 'GET') {
    try {
      // Get requests from Redis
      console.log('Fetching team requests from Redis...');
      let requests = await redis.get(TEAM_REQUESTS_KEY);
      
      // Ensure we always return an array
      if (!requests || !Array.isArray(requests)) {
        console.log('No requests found or invalid data, initializing empty array');
        requests = [];
        // Initialize the key with an empty array
        await redis.set(TEAM_REQUESTS_KEY, []);
      }
      
      console.log(`Found ${requests.length} team requests`);
      return res.status(200).json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      return res.status(500).json({ error: 'Failed to fetch requests', details: error.message });
    }
  }
  
  // POST - Create a new request
  if (req.method === 'POST') {
    try {
      // Get existing requests
      console.log('Creating new team request...');
      let requests = await redis.get(TEAM_REQUESTS_KEY);
      
      // Ensure we have an array
      if (!requests || !Array.isArray(requests)) {
        requests = [];
      }
      
      // Create new request
      const newRequest = {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      console.log('New request created with ID:', newRequest.id);
      
      // Add to requests and save
      requests.push(newRequest);
      await redis.set(TEAM_REQUESTS_KEY, requests);
      
      console.log('Team request saved successfully');
      return res.status(201).json(newRequest);
    } catch (error) {
      console.error('Error creating request:', error);
      return res.status(500).json({ error: 'Failed to create request', details: error.message });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}