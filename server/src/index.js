const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Data storage path
const DATA_DIR = path.join(__dirname, '../data');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize requests file if it doesn't exist
if (!fs.existsSync(REQUESTS_FILE)) {
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Helper functions for data operations
const readRequests = () => {
  try {
    const data = fs.readFileSync(REQUESTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading requests:', error);
    return [];
  }
};

const writeRequests = (data) => {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing requests:', error);
    return false;
  }
};

// API Routes
app.get('/api/requests', (req, res) => {
  const requests = readRequests();
  res.json(requests);
});

app.post('/api/requests', (req, res) => {
  try {
    const requests = readRequests();
    const newRequest = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    writeRequests(requests);
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

app.delete('/api/requests/:id', (req, res) => {
  try {
    const { id } = req.params;
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
    
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 