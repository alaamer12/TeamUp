# MongoDB Migration Guide

This guide explains in detail how to set up MongoDB Atlas for the TeamUp application and migrate data from the JSON file storage.

## MongoDB Atlas Setup

### 1. Create a MongoDB Atlas Account

1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. After registration, you'll be prompted to create your first project:
   - Enter "TeamUp" as your project name
   - Click "Next"
3. On the "Create a deployment" screen:
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider (AWS, Google Cloud, or Azure)
   - Choose the region closest to your users
   - Click "Create"
   
### 2. Configure Database Access

1. In the left sidebar, click on "Database Access"
2. Click the green "Add New Database User" button
3. In the "Password" authentication method:
   - Enter a username (e.g., "teamup_admin")
   - Either click "Autogenerate Secure Password" or enter your own password
   - **Important:** Save this password securely; you'll need it for the connection string
4. Under "Database User Privileges":
   - Select "Read and write to any database"
5. Click "Add User" to create the database user

### 3. Configure Network Access

1. In the left sidebar, click on "Network Access"
2. Click the green "Add IP Address" button
3. For development:
   - Select "Add Current IP Address" to add your current IP
   - Or click "Allow Access from Anywhere" (0.0.0.0/0) for testing purposes
4. For production:
   - Add the specific IP address of your Render deployment
   - If you don't know the IP yet, you can temporarily allow access from anywhere
5. Click "Confirm" to save your IP whitelist settings

### 4. Get Your Connection String

1. In the left sidebar, click on "Databases"
2. For your cluster (named "Cluster0" by default), click the "Connect" button
3. Select "Drivers" from the connection methods
4. Choose "Node.js" as your driver and the latest version
5. Copy the provided connection string which looks like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace the placeholders:
   - Replace `<username>` with the database username you created
   - Replace `<password>` with the user's password
   - Add your database name: change `/?retryWrites=true` to `/teamup?retryWrites=true`

Your final connection string should look like:
```
mongodb+srv://teamup_admin:your_password@cluster0.xxxxx.mongodb.net/teamup?retryWrites=true&w=majority
```

## Environment Setup

### Development Environment

1. Create a `.env` file in the server directory:
   ```bash
   cd server
   touch .env
   ```

2. Open the `.env` file and add the following configuration:
   ```
   PORT=8080
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://teamup_admin:your_password@cluster0.xxxxx.mongodb.net/teamup?retryWrites=true&w=majority
   CORS_ORIGIN=http://localhost:3000
   ```

3. Test your MongoDB connection:
   ```bash
   cd server
   node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected to MongoDB!')).catch(err => console.error('Connection error:', err))"
   ```
   If successful, you'll see "Connected to MongoDB!" in the console.

### Production Environment

For production deployment on Render:

1. In the Render dashboard, navigate to your service
2. Go to "Environment" tab
3. Add the following environment variables:
   - `PORT`: `8080`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://teamup-frontend.vercel.app`)

## Data Migration

### Preparing for Migration

1. Ensure your MongoDB connection is configured in `.env` as described above
2. Make sure your JSON data file exists at `server/data/requests.json`
3. Install all dependencies:
   ```bash
   cd server
   npm install
   ```

### Running the Migration

1. Run the migration script:
   ```bash
   cd server
   npm run migrate
   ```

2. The script will output detailed information about the migration process:
   - Number of records found in the JSON file
   - Number of records being migrated
   - Confirmation when migration is complete
   - Path to the backup of your original JSON file

### Verifying the Migration

1. Log in to MongoDB Atlas
2. In the left sidebar, click on "Databases"
3. Click "Browse Collections"
4. Select the "teamup" database from the dropdown
5. Select the "teamrequests" collection
6. You should see all your team requests listed with their properties
7. Verify that the data matches what was in your JSON file

## Troubleshooting

### Connection Issues

- **Error: "MongoNetworkError: failed to connect to server"**
  - Check that your IP address is whitelisted in Network Access
  - Try adding 0.0.0.0/0 temporarily to verify if it's an IP restriction issue
  
- **Error: "MongoServerError: Authentication failed"**
  - Verify your username and password in the connection string
  - Ensure there are no special characters in the password that need URL encoding
  - Try creating a new database user with a simple password for testing

- **Error: "Invalid connection string"**
  - Make sure the connection string format is correct
  - Check for typos or missing parts in the connection string

### Migration Errors

- **Error: "Cannot find module 'mongoose'"**
  - Run `npm install` to ensure all dependencies are installed

- **Error: "No JSON file found"**
  - Check that your data file exists at `server/data/requests.json`
  - Verify the file permissions allow reading

- **Error: "SyntaxError: Unexpected token in JSON"**
  - Your JSON file may be malformed
  - Validate the JSON structure using a tool like [JSONLint](https://jsonlint.com/)

## Switching Between Storage Solutions

### Switching Back to JSON Storage

If you need to switch back to JSON storage:

1. In `server/src/index.js`, comment out the MongoDB code:
   ```javascript
   // Comment out MongoDB connection
   // connectToDatabase();
   
   // Uncomment JSON file storage code
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
   ```

2. Replace the MongoDB route handlers with the original JSON file handlers

3. Restart the server:
   ```bash
   npm run dev
   ```

## Database Backup and Maintenance

### Regular Backups

MongoDB Atlas provides automated backups for M10+ clusters. For the free tier:

1. **Manual Export**:
   - In MongoDB Atlas, go to your cluster
   - Click "..." (ellipsis) and select "Download Data"
   - Choose JSON format and select the collections to export

2. **Scheduled Backups with `mongodump`**:
   - Install MongoDB Database Tools: [Download Link](https://www.mongodb.com/try/download/database-tools)
   - Create a backup script:
     ```bash
     #!/bin/bash
     TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
     BACKUP_DIR="./backups/$TIMESTAMP"
     mkdir -p $BACKUP_DIR
     mongodump --uri="your_connection_string" --out=$BACKUP_DIR
     ```
   - Schedule this script to run regularly using cron or a similar scheduler

### Database Monitoring

1. **Atlas Monitoring**:
   - On your cluster page, click the "Metrics" tab
   - Monitor key metrics like operations, connections, and memory usage

2. **Set Up Alerts**:
   - In MongoDB Atlas, go to "Alerts"
   - Click "New Alert"
   - Configure alerts for metrics like high CPU usage or connection counts 