const { v4: uuidv4 } = require('uuid');
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
  
  // GET - Fetch all requests
  if (req.method === 'GET') {
    const requests = readRequests();
    return res.status(200).json(requests);
  }
  
  // POST - Create a new request
  if (req.method === 'POST') {
    try {
      const requests = readRequests();
      const newRequest = {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      requests.push(newRequest);
      writeRequests(requests);
      
      return res.status(201).json(newRequest);
    } catch (error) {
      console.error('Error creating request:', error);
      return res.status(500).json({ error: 'Failed to create request' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
} 