# TeamUp

A platform for connecting talented developers, designers, and innovators to create teams for hackathons, projects, and startups.

## Features

- Create detailed team requests specifying required skills and expertise
- Browse and search for team requests
- Contact team creators via WhatsApp
- Ownership verification using browser fingerprinting
- Cross-tab synchronization

## Project Structure

- `src/` - Frontend React application
- `server/` - Backend Express.js server for data sharing

## Setup

### Quick Start

Run both the backend and frontend with a single command:

```bash
# Using npm script
npm run dev:all

# OR using the provided batch file (Windows)
start-dev.bat

# OR using the Node.js script (cross-platform)
node start-dev.js
```

### Manual Setup

#### Backend Server

1. Navigate to the server directory:
```
cd server
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
npm start
```

Alternatively, on Windows, you can run the `server/start-server.bat` script.

#### Frontend Application

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```

## How It Works

1. The frontend React application communicates with the backend Express.js server via REST API
2. Team requests are stored in a JSON file on the server
3. Browser fingerprinting is used for ownership verification
4. BroadcastChannel API is used for cross-tab synchronization

## Technologies Used

- React
- TypeScript
- Vite
- Express.js
- ShadCN UI
- Framer Motion 
