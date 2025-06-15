# TeamUp Deployment Guide

This document provides an overview of deploying the TeamUp application. For detailed instructions, please refer to the specific deployment guides for the frontend and backend components.

## Deployment Overview

TeamUp consists of two main components:
1. **Frontend**: A React application with TypeScript and Vite
2. **Backend**: An Express.js API server with Supabase integration

Both components are designed to be deployed on Vercel, with Supabase providing the database services.

## Prerequisites

Before deployment, ensure you have:

- A [Vercel](https://vercel.com) account for hosting both frontend and backend
- A [Supabase](https://supabase.com) account with a project set up
- Your codebase pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Node.js v18+ installed locally for testing

## Environment Configuration

The application requires several environment variables to be set up:

### Frontend Environment Variables
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_API_URL` | Your deployed backend API URL |
| `VITE_ADMIN_PASSWORD` | Secret password for admin access |

### Backend Environment Variables
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `NODE_ENV` | Set to `production` for production deployments |
| `ADMIN_PASSWORD` | Secret password for admin access (should match frontend) |

## Deployment Steps Summary

1. **Set up Supabase**:
   - Create a new Supabase project
   - Run the migration script from `server/migrations/v1.sql`
   - Get your Supabase URL and anon key

2. **Deploy the Backend**:
   - Deploy the server to Vercel
   - Configure environment variables
   - Test the API endpoints

3. **Deploy the Frontend**:
   - Update the API URL to point to your deployed backend
   - Deploy the frontend to Vercel
   - Configure environment variables

## Detailed Deployment Guides

For step-by-step instructions, please refer to:

- [Backend Deployment Guide](./BACK_DEPLOYMENT.md) - Detailed instructions for deploying the backend server
- [Frontend Deployment Guide](./FRONT_DEPLOYMENT.md) - Detailed instructions for deploying the frontend application

## Post-Deployment Verification

After deploying both components, verify that:

1. The backend health check endpoint returns a success response:
   ```
   https://your-backend-url/health
   ```

2. The frontend loads correctly and can connect to the backend API
3. Team requests can be created, viewed, edited, and deleted
4. Admin functionality works by pressing Ctrl+Shift+A and entering the admin password

## Troubleshooting

If you encounter issues during deployment, please refer to the troubleshooting sections in the specific deployment guides:

- [Backend Troubleshooting](./BACK_DEPLOYMENT.md#troubleshooting)
- [Frontend Troubleshooting](./FRONT_DEPLOYMENT.md#troubleshooting)

For additional help, please open an issue in the project repository. 