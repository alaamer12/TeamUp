# TeamUp Backend Deployment Guide

This document provides instructions for deploying the TeamUp backend to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for local testing)
- A [Supabase](https://supabase.com) account with the database set up

## Environment Variables

The following environment variables need to be set in your Vercel project:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `NODE_ENV` | Set to `production` for production deployments |
| `ADMIN_PASSWORD` | Secret password for admin access (should match frontend) |

## Deployment Steps

### Using Vercel Dashboard

1. Log in to your Vercel account
2. Click "New Project"
3. Import your repository
4. Configure the project:
   - Set the root directory to `server`
   - Set the build command to `npm install`
   - Set the output directory to `dist` (if applicable)
   - Set the development command to `npm run dev`
5. Add the environment variables listed above
6. Click "Deploy"

### Using Vercel CLI

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a `vercel.json` file with the following configuration:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.js",
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project
5. To deploy to production:
   ```bash
   vercel --prod
   ```

## Database Setup

Make sure to run the Supabase migration script to set up the database tables:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Paste the contents of `server/migrations/v1.sql`
4. Run the script

The migration script will:
- Create the `requests` table for storing team requests
- Create the `team_members` table for storing team member requirements
- Set up appropriate Row Level Security (RLS) policies

## Verifying the Deployment

After deployment, you can verify that the API is working by visiting:

```
https://your-vercel-app-url/health
```

You should see a response like:

```json
{
  "status": "ok",
  "environment": "production"
}
```

You can also check the API information at the root endpoint:

```
https://your-vercel-app-url/
```

## Connecting the Frontend

Update your frontend environment variables to point to the deployed backend:

```
VITE_API_URL=https://your-vercel-app-url/api
```

## Troubleshooting

- **CORS Issues**: The server is configured to allow all origins in production, but you might need to adjust this for security
- **Database Connection Issues**: Verify that the Supabase URL and key are correct
- **Function Timeout**: If you experience timeouts, consider optimizing your database queries or increasing the function timeout in Vercel settings
- **Admin Authentication**: Make sure the `ADMIN_PASSWORD` matches between frontend and backend
- **TypeScript Errors**: If you encounter TypeScript compilation errors, make sure all dependencies are correctly installed 