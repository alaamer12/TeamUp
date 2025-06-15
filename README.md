# TeamUp - Graduation Project Team Formation Platform

<div align="center">
  <img src="public/teamup-banner.svg" alt="TeamUp Banner" width="800">
</div>

TeamUp is a specialized platform designed to help students find teammates for their graduation projects. It connects developers, designers, and innovators based on skills, interests, and project requirements, making team formation easier and more efficient.

## Project Purpose

Finding the right teammates for graduation projects can be challenging. TeamUp solves this problem by:

- Allowing students to create team requests specifying exactly what skills they need
- Enabling students to browse existing teams looking for specific roles
- Facilitating direct communication between potential teammates
- Providing a structured way to form balanced, complementary teams

## Project Structure

This repository is organized as a full-stack application:

- **Frontend**: React application with TypeScript, Vite, and Tailwind CSS
- **Backend**: Express.js API server with Supabase integration for data storage

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Prerequisites

- Node.js (v18 or newer)
- npm or bun
- Supabase account (for database access)

## Features

- **Team Discovery**: Browse through available team requests filtered by skills and requirements
- **Advanced Search**: Find potential teammates based on technical skills, major, and programming languages
- **Team Requests**: Create detailed team requests specifying exactly what skills you need
- **Team Management**: Edit or delete your team requests as your requirements change
- **Direct Communication**: Connect directly with team creators via WhatsApp integration
- **Offline Support**: Continue using the application even when offline, with data syncing when connection is restored
- **Browser Fingerprinting**: Secure ownership of team requests without requiring account creation

## Architecture

The application follows a modern web architecture:

- **Frontend**: React with TypeScript, using Shadcn UI components and Tailwind CSS
- **Backend**: Express.js server handling API requests and business logic
- **Database**: Supabase (PostgreSQL) for secure and scalable data storage
- **State Management**: Context API and custom hooks for frontend state
- **Offline Support**: IndexedDB for local data persistence

## Documentation

Comprehensive documentation is available in the docs directory:

- [Frontend Documentation](./README_FRONTEND.md) - Details about the frontend architecture and components
- [Deployment Guides](./docs/) - Step-by-step deployment instructions
  - [Frontend Deployment](./docs/FRONT_DEPLOYMENT.md)
  - [Backend Deployment](./docs/BACK_DEPLOYMENT.md)
- [Changelog](./docs/CHANGELOG.md) - Version history and updates

## Security Features

- **Browser Fingerprinting**: Secure ownership verification without user accounts
- **Admin Mode**: Hidden admin functionality for moderation (Ctrl+Shift+A)
- **Data Protection**: Minimal personal data collection and secure storage

## License

This project is licensed under the MIT License - see the LICENSE file for details. 