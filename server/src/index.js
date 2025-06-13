const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Data storage path
const DATA_DIR = path.join(__dirname, '../data');
const TEAM_REQUESTS_FILE = path.join(DATA_DIR, 'team-requests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize team requests file if it doesn't exist
if (!fs.existsSync(TEAM_REQUESTS_FILE)) {
  fs.writeFileSync(TEAM_REQUESTS_FILE, JSON.stringify([], null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Helper functions for data operations
const readTeamRequests = () => {
  try {
    const data = fs.readFileSync(TEAM_REQUESTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading team requests:', error);
    return [];
  }
};

const writeTeamRequests = (data) => {
  try {
    fs.writeFileSync(TEAM_REQUESTS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing team requests:', error);
    return false;
  }
};

// API Routes
app.get('/api/team-requests', (req, res) => {
  const teamRequests = readTeamRequests();
  res.json(teamRequests);
});

app.post('/api/team-requests', (req, res) => {
  try {
    const teamRequests = readTeamRequests();
    const newRequest = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    teamRequests.push(newRequest);
    writeTeamRequests(teamRequests);
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating team request:', error);
    res.status(500).json({ error: 'Failed to create team request' });
  }
});

app.put('/api/team-requests/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { ownerFingerprint } = req.body;
    let teamRequests = readTeamRequests();
    
    const requestIndex = teamRequests.findIndex(request => request.id === id);
    
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Team request not found' });
    }
    
    // Check ownership
    if (teamRequests[requestIndex].ownerFingerprint !== ownerFingerprint) {
      return res.status(403).json({ error: 'Not authorized to update this team request' });
    }
    
    // Update the request
    teamRequests[requestIndex] = {
      ...teamRequests[requestIndex],
      ...req.body,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    writeTeamRequests(teamRequests);
    res.json(teamRequests[requestIndex]);
  } catch (error) {
    console.error('Error updating team request:', error);
    res.status(500).json({ error: 'Failed to update team request' });
  }
});

app.delete('/api/team-requests/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { ownerFingerprint } = req.body;
    let teamRequests = readTeamRequests();
    
    const request = teamRequests.find(request => request.id === id);
    
    if (!request) {
      return res.status(404).json({ error: 'Team request not found' });
    }
    
    // Check ownership
    if (request.ownerFingerprint !== ownerFingerprint) {
      return res.status(403).json({ error: 'Not authorized to delete this team request' });
    }
    
    // Delete the request
    teamRequests = teamRequests.filter(request => request.id !== id);
    writeTeamRequests(teamRequests);
    
    res.json({ message: 'Team request deleted successfully' });
  } catch (error) {
    console.error('Error deleting team request:', error);
    res.status(500).json({ error: 'Failed to delete team request' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 