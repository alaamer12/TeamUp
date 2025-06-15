# TeamUp Backend Server with Supabase

This is the backend server for the TeamUp application. It uses Express.js for the API and Supabase for data storage.

## Setup

### Prerequisites
- Node.js v18+
- npm or bun
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Supabase Setup

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Create a new table called `requests` with the following schema:

```sql
create table public.requests (
  id uuid not null primary key,
  title text,
  description text,
  ownerFingerprint text not null,
  status text default 'open',
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  skills text[],
  contactEmail text,
  contactDiscord text,
  groupSize int,
  members jsonb,
  user_name text,
  user_gender text,
  user_personal_phone text,
  user_abstract text
);
```

3. Set up Row Level Security (RLS) policies as needed
4. Get your Supabase URL and anon key from the API settings page

### Environment Variables

Copy the `.env` file and update with your Supabase credentials:

```
PORT=8080
NODE_ENV=development
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
CORS_ORIGIN=http://localhost:5173
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
| GET    | /api/requests | Get all requests |
| POST   | /api/requests | Create a new request |
| PUT    | /api/requests/:id | Update a request |
| DELETE | /api/requests/:id | Delete a request |

## Deployment

This server can be deployed to any Node.js hosting platform like:
- Vercel
- Render
- Railway
- Fly.io
- Heroku 