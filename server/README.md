# TeamUp Server

A robust Express.js backend for the TeamUp platform, providing API endpoints for team request management and data persistence.

## Features

- **RESTful API**: Endpoints for managing team requests
- **JSON Storage**: File-based data persistence
- **Ownership Verification**: Secure request management with fingerprint-based authentication
- **CORS Support**: Configured for cross-origin requests
- **Request Logging**: Detailed logging with Morgan

## Setup

```bash
# Install dependencies
npm install

# Start server in development mode
npm run dev

# Start server in production mode
npm start
```

## API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/requests` | Get all team requests | None |
| POST | `/api/requests` | Create a new team request | None |
| PUT | `/api/requests/:id` | Update an existing team request | Ownership verification |
| DELETE | `/api/requests/:id` | Delete a team request | Ownership verification |

## Authentication

The API uses a simple ownership verification system. When creating a team request, a fingerprint is stored with the request. For update and delete operations, this fingerprint must be provided to verify ownership.

## Data Storage

Data is stored in a JSON file (`data/requests.json`). This simple storage solution is suitable for demonstration purposes and small-scale deployments.

## Environment Variables

- `PORT`: The port the server listens on (default: 8080) 