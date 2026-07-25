# Vercel Deployment Guide

This guide will help you deploy your Wrike Clone to Vercel for online distribution.

## 📋 Prerequisites

- GitHub repository (✅ already set up at https://github.com/Shivstic-hell/wrike-clone)
- Vercel account (sign up at https://vercel.com if you don't have one)
- Supabase database (✅ already configured)

## 🚀 Deployment Steps

### 1. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select **"Import GitHub Repository"**
5. Find and select **`Shivstic-hell/wrike-clone`**
6. Click **"Import"**

### 2. Configure Project Settings

Vercel will automatically detect your monorepo structure using the `vercel.json` file.

**Framework Preset:** Vite (for frontend)

**Root Directory:** Leave as default (Vercel will handle both frontend and backend)

### 3. Configure Environment Variables

Add these environment variables in Vercel project settings:

#### Backend Variables

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres.qmzxjfirlppveoxkynbt:*Cankidskidscan393@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
DB_SSL=true
DB_MAX_CONNECTIONS=10
DB_IDLE_TIMEOUT_MS=10000

# Application
NODE_ENV=production
APP_PORT=4000
API_PREFIX=/api/v1

# Auth
JWT_SECRET=your-production-jwt-secret-change-this
ACCESS_TOKEN_TTL_SEC=900
REFRESH_TOKEN_TTL_SEC=2592000

# Encryption
ENCRYPTION_KEY=change_this_to_a_64_hex_char_key_in_production

# CORS (Update with your Vercel frontend URL after deployment)
CORS_ORIGINS=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_TTL_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

#### Frontend Variables

```env
VITE_API_URL=https://your-app.vercel.app/api/v1
```

**Important:** After your first deployment, update `CORS_ORIGINS` and `VITE_API_URL` with your actual Vercel URL.

### 4. Deploy

Click **"Deploy"** and Vercel will:
- Install dependencies
- Build the frontend
- Build the backend
- Deploy both to serverless functions

⏱️ First deployment takes 2-5 minutes.

### 5. Post-Deployment Configuration

Once deployed, you'll get URLs like:
- **Frontend:** `https://wrike-clone-xxxx.vercel.app`
- **Backend API:** `https://wrike-clone-xxxx.vercel.app/api/v1`

#### Update Environment Variables

1. Go to **Project Settings → Environment Variables**
2. Update `CORS_ORIGINS` with your frontend URL:
   ```
   CORS_ORIGINS=https://wrike-clone-xxxx.vercel.app
   ```
3. Update `VITE_API_URL` with your backend URL:
   ```
   VITE_API_URL=https://wrike-clone-xxxx.vercel.app/api/v1
   ```
4. Click **"Redeploy"** to apply changes

### 6. Test Your Deployment

1. Visit your Vercel URL: `https://wrike-clone-xxxx.vercel.app`
2. Test the health endpoint: `https://wrike-clone-xxxx.vercel.app/api/v1/health`
3. Try logging in with test credentials

## 🔧 Vercel Configuration Explained

Your `vercel.json` file configures:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "packages/backend/src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/v1/(.*)",
      "dest": "packages/backend/src/main.ts"
    },
    {
      "src": "/(.*)",
      "dest": "packages/frontend/dist/$1"
    }
  ]
}
```

This tells Vercel to:
- Build the frontend as a static site
- Run the backend as serverless functions
- Route `/api/v1/*` to the backend
- Route everything else to the frontend

## 🔐 Security Considerations

### Production Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Change `ENCRYPTION_KEY` to a random 64-character hex string
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGINS` with your actual domain
- [ ] Enable Vercel's security features:
  - [ ] Vercel Firewall (if available)
  - [ ] DDoS protection (automatic)
  - [ ] SSL/TLS (automatic)

### Generate Secure Keys

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Encryption Key (64 hex characters)
openssl rand -hex 32
```

## 🌍 Custom Domain (Optional)

To use your own domain:

1. Go to **Project Settings → Domains**
2. Click **"Add Domain"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Update `CORS_ORIGINS` to include your custom domain

## 📊 Monitoring & Logs

### View Logs
1. Go to **Deployments** tab
2. Click on a deployment
3. Click **"View Function Logs"**

### Monitor Performance
- Vercel provides automatic monitoring
- View metrics in the **Analytics** tab
- Set up alerts in **Project Settings**

## 🐛 Troubleshooting

### Common Issues

**Issue:** "Cannot find module" errors
- **Solution:** Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Issue:** CORS errors
- **Solution:** Update `CORS_ORIGINS` environment variable
- Include your Vercel URL

**Issue:** Database connection timeout
- **Solution:** Use Supabase connection pooler (port 6543)
- Check `DB_MAX_CONNECTIONS` is set to 10 or less

**Issue:** API routes returning 404
- **Solution:** Verify `vercel.json` routes configuration
- Check API_PREFIX matches `/api/v1`

**Issue:** Build fails
- **Solution:** Check build logs in Vercel
- Ensure `packages/shared` builds first
- Verify all TypeScript errors are fixed

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Automatic preview deployments

### Manual Redeploy

1. Go to **Deployments** tab
2. Find the deployment to redeploy
3. Click **⋯** → **Redeploy**

## 📱 Preview Deployments

Every pull request and branch gets a preview URL:
- `https://wrike-clone-git-feature-branch.vercel.app`

Great for testing before merging!

## 💡 Performance Tips

1. **Enable Edge Caching:**
   - Add cache headers to static assets
   - Use Vercel Edge Network

2. **Optimize Database Queries:**
   - Use database indexes
   - Implement query result caching

3. **Reduce Bundle Size:**
   - Use code splitting
   - Lazy load routes
   - Optimize images

4. **Use Vercel Speed Insights:**
   - Enable in Project Settings
   - Monitor Core Web Vitals

## 🎯 Next Steps

After deployment:

1. ✅ Set up custom domain (optional)
2. ✅ Configure monitoring and alerts
3. ✅ Test all features in production
4. ✅ Share your app URL!
5. ✅ Set up CI/CD for automated testing

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Issues:** https://github.com/Shivstic-hell/wrike-clone/issues
- **Supabase Docs:** https://supabase.com/docs

---

**Happy Deploying! 🚀**
