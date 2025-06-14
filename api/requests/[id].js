import { Redis } from '@upstash/redis';

// Initialize Redis from environment variables
const redis = new Redis({
  url: process.env.REDIS_URL || process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Key for storing team requests
const TEAM_REQUESTS_KEY = 'teamup-requests';

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

  const { id } = req.query;
  
  // PUT - Update a request
  if (req.method === 'PUT') {
    try {
      const updatedData = req.body;
      let requests = await redis.get(TEAM_REQUESTS_KEY) || [];
      
      const requestIndex = requests.findIndex(request => request.id === id);
      
      if (requestIndex === -1) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      // Check ownership
      if (requests[requestIndex].ownerFingerprint !== updatedData.ownerFingerprint) {
        return res.status(403).json({ error: 'Not authorized to update this request' });
      }
      
      // Update the request while preserving id, createdAt and ownerFingerprint
      const updatedRequest = {
        ...updatedData,
        id: requests[requestIndex].id,
        createdAt: requests[requestIndex].createdAt,
        ownerFingerprint: requests[requestIndex].ownerFingerprint,
        updatedAt: new Date().toISOString()
      };
      
      requests[requestIndex] = updatedRequest;
      await redis.set(TEAM_REQUESTS_KEY, requests);
      
      return res.status(200).json(updatedRequest);
    } catch (error) {
      console.error('Error updating request:', error);
      return res.status(500).json({ error: 'Failed to update request' });
    }
  }
  
  // DELETE - Delete a request
  if (req.method === 'DELETE') {
    try {
      const { ownerFingerprint } = req.body;
      let requests = await redis.get(TEAM_REQUESTS_KEY) || [];
      
      const request = requests.find(request => request.id === id);
      
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      // Check ownership
      if (request.ownerFingerprint !== ownerFingerprint) {
        return res.status(403).json({ error: 'Not authorized to delete this request' });
      }
      
      // Delete the request
      requests = requests.filter(request => request.id !== id);
      await redis.set(TEAM_REQUESTS_KEY, requests);
      
      return res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
      console.error('Error deleting request:', error);
      return res.status(500).json({ error: 'Failed to delete request' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}