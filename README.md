# TeamUp

<div align="center">
  <img src="public/teamup-banner.svg" alt="TeamUp Banner" width="800">
</div>

TeamUp is a professional platform designed to connect developers, designers, and innovators to collaborate on exciting projects. Whether you're looking for a team to join or seeking talented individuals to complete your project, TeamUp provides the tools to make meaningful connections.

## Features

- **Team Discovery**: Browse through a diverse range of teams and projects looking for collaborators.
- **Advanced Search**: Filter teams by skills, project type, and availability to find the perfect match.
- **Team Requests**: Send and manage requests to join teams you're interested in.
- **Direct Communication**: Connect with team leaders and members to discuss project details.
- **Profile Management**: Showcase your skills, experience, and portfolio to attract potential collaborators.
- **Team Request Creation**: Create detailed team requests specifying the skills and qualifications you're looking for.
- **Team Request Management**: Edit or delete your team requests as your needs change.
- **Advanced Search**: Find potential teammates based on skills, major, and technical fields.
- **Direct Communication**: Connect directly with team creators via WhatsApp integration.
- **Offline Support**: Continue using the application even when offline, with data syncing when connection is restored.

## Project Architecture

The project is structured as follows:

- **Frontend**: Built with React and TypeScript, providing a responsive and intuitive user interface.
- **Backend**: Express.js server handling API requests and data management.
- **Data Storage**: JSON-based storage for demonstration purposes.

## Technology Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- React Router for navigation
- Tailwind CSS for styling

### Backend
- Express.js
- Node.js
- Morgan for request logging
- CORS support

## Getting Started

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/teamup.git
cd teamup

# Install dependencies
npm install

# Start both frontend and backend
npm run dev
```

### Manual Setup

1. **Setup Frontend**

```bash
# Install frontend dependencies
npm install

# Start frontend development server
npm run dev:frontend
```

2. **Setup Backend**

```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Start backend server
npm run dev
```

## How It Works

1. **Browse Teams**: Explore available teams and projects on the Listings page.
2. **Send Request**: When you find a team you'd like to join, send a request with your information.
3. **Manage Requests**: Track the status of your requests in the Dashboard.
4. **Connect**: Once accepted, connect with your new team and start collaborating!

## API Documentation

TeamUp provides a RESTful API for team request management:

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/requests` | Get all team requests | None |
| POST | `/api/requests` | Create a new team request | None |
| PUT | `/api/requests/:id` | Update an existing team request | Ownership verification |
| DELETE | `/api/requests/:id` | Delete a team request | Ownership verification |

For more details, see the [Server README](./server/README.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
