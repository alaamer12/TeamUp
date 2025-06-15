# Deploying TeamUp Frontend to Vercel

This guide provides instructions for deploying the TeamUp frontend to Vercel with Supabase backend integration.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Supabase account with properly configured database (see server/README.md)
- Your codebase pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Setup Environment Variables in Vercel

When deploying to Vercel, you need to set up the following environment variables:

1. `VITE_SUPABASE_URL`: Your Supabase project URL
2. `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

These variables will be used by the frontend Supabase client for direct database access.

## Deployment Steps

1. **Connect your Git repository to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New" > "Project"
   - Select your Git repository containing the TeamUp code
   - Vercel will automatically detect the Vite project

2. **Configure the project settings**
   - Framework preset: Vite
   - Root directory: `./` (if the package.json is in the root)
   - Build command: `npm run build` (Vercel will use this automatically)
   - Output directory: `dist` (Vercel will use this automatically)

3. **Add environment variables**
   - In the project settings, go to "Environment Variables"
   - Add:
     - Name: `VITE_SUPABASE_URL`, Value: Your Supabase URL
     - Name: `VITE_SUPABASE_ANON_KEY`, Value: Your Supabase anon key

4. **Deploy**
   - Click "Deploy"
   - Wait for the build and deployment to complete

## Vercel Configuration File

The repository includes a `vercel.json` configuration file that:

- Ensures proper SPA routing
- Sets appropriate security headers
- Configures caching rules for static assets

## Post-Deployment

After deployment, you'll need to update your API endpoints with the correct production URLs. Make sure:

1. In `src/utils/api-client.js`, update the `PROD_API_URL` to your actual backend URL
2. In Supabase, configure CORS to allow requests from your Vercel domain

## Troubleshooting

- **404 errors on routes**: Make sure the `rewrites` in `vercel.json` are properly configured
- **API connection issues**: Check that your backend is deployed and accessible
- **CORS errors**: Verify CORS settings on your Supabase project 