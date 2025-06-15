# TeamUp Frontend Deployment Guide

This document provides instructions for deploying the TeamUp frontend to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for local testing)
- The backend already deployed (see `server/DEPLOYMENT.md`)

## Environment Variables

The following environment variables need to be set in your Vercel project:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_API_URL` | Your deployed backend API URL (e.g., `https://teamup-backend.vercel.app/api`) |

## Deployment Steps

### Using Vercel Dashboard

1. Log in to your Vercel account
2. Click "New Project"
3. Import your repository
4. Configure the project:
   - Set the root directory to the project root (where the `index.html` file is located)
   - The framework preset should be automatically detected as "Vite"
   - Set the build command to `npm run build`
   - Set the output directory to `dist`
   - Set the development command to `npm run dev`
5. Add the environment variables listed above
6. Click "Deploy"

### Using Vercel CLI

1. Navigate to the project root:
   ```bash
   cd /path/to/teamup
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. Follow the prompts to configure your project
4. To deploy to production:
   ```bash
   vercel --prod
   ```

## Verifying the Deployment

After deployment, you can verify that the frontend is working by visiting your Vercel deployment URL.

## Connecting to the Backend

Make sure the backend is properly deployed and that the `VITE_API_URL` environment variable is set correctly to point to your backend API.

## Troubleshooting

- **API Connection Issues**: Verify that the `VITE_API_URL` is correct and that the backend is running
- **Supabase Connection Issues**: Verify that the Supabase URL and key are correct
- **CORS Issues**: Make sure your frontend URL is included in the `ALLOWED_ORIGINS` environment variable in the backend deployment
- **Build Errors**: Check the build logs in the Vercel dashboard for any errors during the build process
- **Routing Issues**: If you encounter 404 errors on page refresh, make sure the Vercel configuration has the proper rewrites/redirects to handle client-side routing 