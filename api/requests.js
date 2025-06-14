import { Redis } from '@upstash/redis';

// Initialize Redis from environment variables
const redis = new Redis({
  url: process.env.REDIS_URL || process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Key for storing team requests
const TEAM_REQUESTS_KEY = 'teamup-requests';

const { v4: uuidv4 } = require('uuid');

export default async function handler(req, res) {
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
      const requests = await redis.get(TEAM_REQUESTS_KEY) || [];
      return res.status(200).json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }
  }
  
  // POST - Create a new request
  if (req.method === 'POST') {
    try {
      // Get existing requests
      const requests = await redis.get(TEAM_REQUESTS_KEY) || [];
      
      // Create new request
      const newRequest = {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      // Add to requests and save
      requests.push(newRequest);
      await redis.set(TEAM_REQUESTS_KEY, requests);
      
      return res.status(201).json(newRequest);
    } catch (error) {
      console.error('Error creating request:', error);
      return res.status(500).json({ error: 'Failed to create request' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}