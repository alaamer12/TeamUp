const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamup';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import the TeamRequest model
const TeamRequest = require('./src/models/TeamRequest');

// Path to the JSON file
const DATA_DIR = path.join(__dirname, 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

async function migrateData() {
  try {
    // Check if the file exists
    if (!fs.existsSync(REQUESTS_FILE)) {
      console.log('No JSON file found at:', REQUESTS_FILE);
      process.exit(0);
    }

    // Read the JSON file
    console.log('Reading data from:', REQUESTS_FILE);
    const data = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
    
    if (!data || !data.length) {
      console.log('No data found in the JSON file');
      process.exit(0);
    }
    
    console.log(`Found ${data.length} team requests to migrate`);
    
    // Convert dates from strings to Date objects and prepare for MongoDB
    const formattedData = data.map(item => {
      // MongoDB expects _id instead of id
      const { id, ...rest } = item;
      
      return {
        ...rest,
        _id: id, // Use the existing ID as MongoDB _id
        createdAt: new Date(item.createdAt),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
      };
    });
    
    // Check if any of the documents already exist in MongoDB
    const existingIds = formattedData.map(item => item._id);
    const existingDocs = await TeamRequest.find({ _id: { $in: existingIds } });
    
    if (existingDocs.length > 0) {
      console.log(`Found ${existingDocs.length} documents that already exist in MongoDB`);
      
      // Filter out documents that already exist
      const newData = formattedData.filter(item => 
        !existingDocs.some(doc => doc._id.toString() === item._id)
      );
      
      if (newData.length === 0) {
        console.log('All documents already exist in MongoDB. Nothing to migrate.');
        process.exit(0);
      }
      
      console.log(`Migrating ${newData.length} new documents`);
      await TeamRequest.insertMany(newData);
    } else {
      // Insert all data
      console.log(`Migrating all ${formattedData.length} documents`);
      await TeamRequest.insertMany(formattedData);
    }
    
    console.log('Migration completed successfully!');
    
    // Create a backup of the JSON file
    const backupFile = `${REQUESTS_FILE}.bak.${Date.now()}`;
    fs.copyFileSync(REQUESTS_FILE, backupFile);
    console.log(`Created backup of original data at: ${backupFile}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData(); 