# TeamUp Backend Server - Graduation Project Team Formation

This is the backend server for the TeamUp application, a specialized platform designed to help students find teammates for their graduation projects. It uses Express.js for the API and Supabase (PostgreSQL) for secure and scalable data storage.

> **Note**: For the complete project overview and setup instructions, please refer to the [root README](../README.md).

## Purpose

The backend server provides:
- RESTful API endpoints for team request management
- Secure data storage using Supabase
- Ownership verification for team requests
- Offline-first data synchronization support

## Setup

### Prerequisites
- Node.js v18+
- npm or bun
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Supabase Setup

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Run the migration script in `migrations/v1.sql` or create the following tables manually:

#### Requests Table
```sql
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text,
  description text,
  owner_fingerprint text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  skills text[],
  contact_email text,
  contact_discord text,
  group_size integer,
  user_name text,
  user_gender text,
  user_personal_phone text,
  user_abstract text
);
```

#### Team Members Table
```sql
CREATE TABLE IF NOT EXISTS public.team_members (
  id bigserial PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  tech_field text[],
  gender text,
  major text,
  planguage text[],
  already_know boolean
);
```

3. Enable Row Level Security and create appropriate policies (see `migrations/v1.sql` for details)
4. Get your Supabase URL and anon key from the API settings page

### Environment Variables

Create environment files for different environments:

```bash
# For development
cp .env.example .env.development

# For production
cp .env.example .env.production
```

Required environment variables:

```
PORT=8080
NODE_ENV=development|production
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
ADMIN_PASSWORD=your-admin-password
```

### Installation

```bash
npm install
```

### Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/requests | Get all team requests with their members |
| POST   | /api/requests | Create a new team request |
| PUT    | /api/requests/:id | Update an existing team request |
| DELETE | /api/requests/:id | Delete a team request |
| GET    | /health | Health check endpoint |
| GET    | / | API information |

### Authentication

Team request ownership is verified using browser fingerprinting. The owner's fingerprint is stored with each request and verified on update/delete operations.

## Offline Support

The server is designed to work with the frontend's offline-first approach:
- When online, data is stored in Supabase
- When offline, data is stored in IndexedDB and synchronized when connection is restored

## Deployment

For step-by-step deployment instructions, see the [Backend Deployment Guide](../docs/BACK_DEPLOYMENT.md).

The server is currently deployed on Vercel at: `https://teamup-server.vercel.app` 