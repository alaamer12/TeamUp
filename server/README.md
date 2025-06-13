# TeamUp Server

A simple Express.js backend for the TeamUp application to enable data sharing between users.

## Setup

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```

For development with auto-restart:
```
npm run dev
```

## API Endpoints

### GET /api/team-requests
Get all team requests

### POST /api/team-requests
Create a new team request

### PUT /api/team-requests/:id
Update a team request (requires ownership verification)

### DELETE /api/team-requests/:id
Delete a team request (requires ownership verification)

## Data Storage

Team requests are stored in a JSON file at `data/team-requests.json`. 