# Railway Deployment Guide

This guide will walk you through deploying the Wrike Clone backend to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository already set up (✓ Done: https://github.com/Shivstic-hell/wrike-clone.git)
- Supabase database (✓ Already configured)

## Step 1: Create a Railway Account

1. Go to https://railway.app
2. Click "Login" or "Start a New Project"
3. Sign in with your GitHub account (recommended)

## Step 2: Create a New Project

1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your repository: `Shivstic-hell/wrike-clone`
4. Railway will detect it's a Node.js project

## Step 3: Configure the Service

Railway should auto-detect the monorepo. Configure these settings:

### Build Settings
- **Root Directory**: Leave as `/` (root)
- **Build Command**: `npm install && npm run build -w @wrike-clone/shared && npm run build -w @wrike-clone/backend`
- **Start Command**: `cd packages/backend && npm run start:prod`

### Environment Variables

Add these environment variables in Railway (Settings → Variables):

```bash
NODE_ENV=production
PORT=4000

# Database (use your Supabase connection pooler)
DATABASE_URL=postgresql://postgres.qmzxjfirlppveoxkynbt:*Cankidskidscan393@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

# JWT Secrets (generate new ones for production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# API Configuration
API_PREFIX=api/v1

# CORS (add your frontend URL once deployed)
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.vercel.app
```

**Important**: Generate strong secrets for JWT_SECRET and JWT_REFRESH_SECRET. Use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Deploy

1. Click "Deploy" in Railway
2. Railway will:
   - Clone your repository
   - Install dependencies
   - Build shared package
   - Build backend package
   - Start the server
3. Wait for deployment to complete (2-5 minutes)

## Step 5: Get Your Backend URL

1. Go to "Settings" tab in your Railway service
2. Click "Generate Domain" under "Networking"
3. You'll get a URL like: `https://your-app.up.railway.app`
4. Test it: `https://your-app.up.railway.app/api/v1/health`

## Step 6: Update CORS Settings

Once you have your Railway URL:

1. Add it to the `CORS_ORIGINS` environment variable
2. Example: `http://localhost:5173,https://your-app.up.railway.app,https://your-frontend.vercel.app`

## Monitoring and Logs

- **View Logs**: Click on your service → "Deployments" → Click the deployment → "View Logs"
- **Metrics**: Railway provides CPU, Memory, and Network usage metrics
- **Health Check**: Railway automatically monitors your `/health` endpoint

## Troubleshooting

### Build Fails
- Check the build logs in Railway dashboard
- Ensure `railway.toml` is in the repository root
- Verify all dependencies are in package.json

### Database Connection Issues
- Ensure `DATABASE_URL` uses the Supabase **connection pooler** (port 6543)
- Check that Supabase allows connections from Railway IPs (usually auto-allowed)

### App Crashes on Start
- Check environment variables are set correctly
- View logs for error messages
- Ensure database migrations have been run

## Cost

Railway offers:
- **$5 free credits per month** (plenty for development/testing)
- Pay-as-you-go after free credits
- Typical usage for this app: $3-10/month depending on traffic

## Next Steps

1. Deploy frontend to Vercel (separate project)
2. Update frontend API URL to point to Railway backend
3. Set up custom domain (optional)
4. Configure monitoring and alerts

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/Shivstic-hell/wrike-clone/issues
