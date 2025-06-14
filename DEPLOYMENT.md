# TeamUp Deployment Guide

This guide provides instructions for deploying the TeamUp application using Vercel for the frontend and Render for the backend with MongoDB database.

## Prerequisites

1. **MongoDB Atlas Account**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier is sufficient)
   - Create a database user with read/write permissions
   - Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/teamup`)

2. **Vercel Account** (for frontend)
   - Sign up at [Vercel](https://vercel.com)
   - Install Vercel CLI: `npm install -g vercel`

3. **Render Account** (for backend)
   - Sign up at [Render](https://render.com)

## Quick Deployment

We've provided deployment scripts that automate most of the process:

### Using the Deployment Script (Unix/Linux/Mac)

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script with your MongoDB connection string
./deploy.sh "mongodb+srv://username:password@cluster.mongodb.net/teamup"

# If you have Vercel and Render tokens, you can pass them as well
./deploy.sh "mongodb+srv://username:password@cluster.mongodb.net/teamup" "vercel_token" "render_token"
```

### Using the Deployment Script (Windows)

```cmd
# Run the deployment script with your MongoDB connection string
deploy.bat "mongodb+srv://username:password@cluster.mongodb.net/teamup"
```

## Manual Deployment

If you prefer to deploy manually, follow these steps:

### Step 1: Set Up Environment Files

1. **Create `.env` in the root directory**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

2. **Create `server/.env`**:
   ```
   PORT=8080
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/teamup
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

### Step 2: Frontend Deployment (Vercel)

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

   Or connect your GitHub repository to Vercel and configure:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables: Add `VITE_API_URL` pointing to your backend

### Step 3: Backend Deployment (Render)

1. **Deploy to Render**:
   - Connect your GitHub repository
   - Create a new Web Service
   - Configure:
     - Build Command: `cd server && npm install`
     - Start Command: `cd server && npm start`
   - Add environment variables from `server/.env`

## Data Migration

If you're migrating from JSON files to MongoDB, you can use this script to import your existing data:

1. Create a file called `migrate-data.js` in the server directory:

```javascript
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the TeamRequest model
const TeamRequest = require('./src/models/TeamRequest');

// Path to the JSON file
const DATA_FILE = path.join(__dirname, 'data', 'requests.json');

async function migrateData() {
  try {
    // Read the JSON file
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    // Convert dates from strings to Date objects
    const formattedData = data.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
    }));
    
    // Insert the data into MongoDB
    await TeamRequest.insertMany(formattedData);
    
    console.log(`Successfully migrated ${formattedData.length} team requests`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
```

2. Run the migration script:

```bash
cd server
node migrate-data.js
```

## Monitoring and Maintenance

1. **Check application health**:
   - Backend: Visit `https://your-backend-url.onrender.com/health`
   - Frontend: Test the application functionality

2. **Monitor MongoDB**:
   - Use MongoDB Atlas dashboard to monitor database performance
   - Set up alerts for high usage

3. **Backup strategy**:
   - MongoDB Atlas provides automated backups
   - Enable point-in-time recovery for production databases

## Troubleshooting

1. **CORS issues**:
   - Verify the `CORS_ORIGIN` environment variable is set correctly
   - Check that the backend is properly configured to accept requests from the frontend

2. **Database connection issues**:
   - Ensure your IP address is whitelisted in MongoDB Atlas
   - Verify the connection string is correct

3. **API not found**:
   - Check that the `VITE_API_URL` is correctly set and includes `/api` at the end

## Scaling Considerations

As your application grows:

1. **Upgrade MongoDB Atlas tier** for increased storage and performance
2. **Implement caching** with Redis or similar for frequently accessed data
3. **Consider serverless functions** for specific high-load endpoints 