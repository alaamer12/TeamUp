# TeamUp Frontend - Graduation Project Team Formation

<div align="center">
  <img src="public/teamup-banner.svg" alt="TeamUp Banner" width="800">
</div>

This is the frontend component of TeamUp, a specialized platform designed to help students find teammates for their graduation projects. It connects developers, designers, and innovators based on skills, interests, and project requirements, making team formation easier and more efficient.

> **Note**: For the complete project overview and setup instructions, please refer to the [root README](./README.md).

## Purpose

The frontend provides an intuitive and responsive user interface for students to:

- Create and manage team requests for graduation projects
- Browse existing team requests filtered by skills and requirements
- Connect directly with potential teammates
- Manage their team formation process effectively

## Features

- **Team Discovery**: Browse through available team requests filtered by skills and requirements
- **Advanced Search**: Find potential teammates based on technical skills, major, and programming languages
- **Team Requests**: Create detailed team requests specifying exactly what skills you need
- **Team Management**: Edit or delete your team requests as your requirements change
- **Direct Communication**: Connect directly with team creators via WhatsApp integration
- **Offline Support**: Continue using the application even when offline, with data syncing when connection is restored
- **Browser Fingerprinting**: Secure ownership of team requests without requiring account creation
- **Admin Mode**: Hidden admin functionality for moderation (Ctrl+Shift+A)

## Technology Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router v6 for navigation
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React Context API and custom hooks
- **Data Fetching**: Custom API client with fetch API
- **Database**: Supabase (PostgreSQL) integration for cloud storage
- **Offline Support**: IndexedDB for local data persistence
- **Animations**: Framer Motion for smooth UI transitions

## Getting Started

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

The application requires environment variables for connecting to Supabase and the backend API. Copy the example environment files and update them with your credentials:

```bash
# Development environment
cp .env.example .env.development

# Production environment
cp .env.example .env.production
```

Required environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_API_URL`: Backend API URL
- `VITE_ADMIN_PASSWORD`: Admin access password

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## API Integration

This frontend connects to the Express.js backend with Supabase integration. The connection is configured to work with:
- Development: `http://localhost:8080/api`
- Production: `https://teamup-server.vercel.app/api`

## Folder Structure

- `src/` - Application source code
  - `components/` - Reusable UI components
  - `pages/` - Page components for different routes
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions and API clients
  - `styles/` - Global styles and theme configuration
  - `lib/` - Shared libraries and configurations

## Documentation

For more detailed information, refer to:
- [Deployment Guide](./docs/FRONT_DEPLOYMENT.md) - Step-by-step deployment instructions
- [Changelog](./docs/CHANGELOG.md) - Version history and updates

## License

This project is licensed under the MIT License - see the LICENSE file for details. 