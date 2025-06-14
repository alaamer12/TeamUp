#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Print a colored header
function printHeader(text) {
  console.log(`\n${colors.bright}${colors.cyan}=== ${text} ===${colors.reset}\n`);
}

// Execute a command and return its output
function exec(command) {
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    return false;
  }
}

// Ask a question and get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question}${colors.reset}`, (answer) => {
      resolve(answer);
    });
  });
}

// Create a file with content
function createFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`${colors.green}Created ${filePath}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to create ${filePath}: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main deployment function
async function deploy() {
  printHeader('TeamUp Deployment Script');
  
  // Step 1: Get MongoDB connection string
  const mongoDbUri = await askQuestion('Enter your MongoDB connection string: ');
  if (!mongoDbUri || !mongoDbUri.startsWith('mongodb')) {
    console.error(`${colors.red}Invalid MongoDB connection string. Exiting.${colors.reset}`);
    process.exit(1);
  }
  
  // Step 2: Get frontend and backend URLs
  const frontendUrl = await askQuestion('Enter your frontend URL (e.g., https://teamup.vercel.app): ');
  const backendUrl = await askQuestion('Enter your backend URL (e.g., https://teamup-backend.onrender.com): ');
  
  // Step 3: Create environment files
  printHeader('Creating Environment Files');
  
  // Backend .env
  const serverEnv = `# Server Configuration
PORT=8080
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=${mongoDbUri}

# CORS Settings
CORS_ORIGIN=${frontendUrl}
`;
  createFile('server/.env', serverEnv);
  
  // Frontend .env
  const frontendEnv = `# API URL for production
VITE_API_URL=${backendUrl}/api
`;
  createFile('.env', frontendEnv);
  
  // Step 4: Install dependencies
  printHeader('Installing Dependencies');
  exec('npm install');
  exec('cd server && npm install');
  
  // Step 5: Migrate data if needed
  const migrationNeeded = await askQuestion('Do you want to migrate existing JSON data to MongoDB? (y/n): ');
  if (migrationNeeded.toLowerCase() === 'y') {
    printHeader('Migrating Data to MongoDB');
    exec('cd server && npm run migrate');
  }
  
  // Step 6: Build frontend
  printHeader('Building Frontend');
  exec('npm run build');
  
  // Step 7: Deployment instructions
  printHeader('Deployment Instructions');
  
  console.log(`${colors.green}Your project is ready for deployment!${colors.reset}`);
  console.log('\nFrontend Deployment (Vercel):');
  console.log('1. Install Vercel CLI: npm install -g vercel');
  console.log('2. Run: vercel --prod');
  console.log('\nBackend Deployment (Render):');
  console.log('1. Create a new Web Service on Render');
  console.log('2. Connect your GitHub repository');
  console.log('3. Configure:');
  console.log('   - Build Command: cd server && npm install');
  console.log('   - Start Command: cd server && npm start');
  console.log('4. Add environment variables from server/.env');
  
  // Ask if user wants to deploy with Vercel CLI
  const deployFrontend = await askQuestion('\nDo you want to deploy the frontend with Vercel CLI now? (y/n): ');
  if (deployFrontend.toLowerCase() === 'y') {
    printHeader('Deploying Frontend to Vercel');
    exec('npx vercel --prod');
  }
  
  printHeader('Deployment Process Completed');
  console.log('Thank you for using TeamUp!');
  
  rl.close();
}

// Run the deployment script
deploy().catch(error => {
  console.error(`${colors.red}Deployment failed: ${error.message}${colors.reset}`);
  rl.close();
  process.exit(1);
}); 