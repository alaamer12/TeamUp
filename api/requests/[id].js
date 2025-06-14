const fs = require('fs');
const path = require('path');

// Data storage path
const DATA_DIR = path.join(process.cwd(), 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

// Helper functions for data operations
const readRequests = () => {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Initialize requests file if it doesn't exist
    if (!fs.existsSync(REQUESTS_FILE)) {
      fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2));
      return [];
    }

    const data = fs.readFileSync(REQUESTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading requests:', error);
    return [];
  }
};

const writeRequests = (data) => {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing requests:', error);
    return false;
  }
};

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
      let requests = readRequests();
      
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
      writeRequests(requests);
      
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
      let requests = readRequests();
      
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
      writeRequests(requests);
      
      return res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
      console.error('Error deleting request:', error);
      return res.status(500).json({ error: 'Failed to delete request' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
} 