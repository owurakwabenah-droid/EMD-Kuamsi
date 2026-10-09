# EMD Secretary Desk - Vercel + Postgres Deployment

## ✅ Complete Deployment Guide

### Step 1: Create a Postgres Database (Neon)

1. Go to [neon.tech](https://neon.tech)
2. Click **Sign Up** (or sign in with GitHub)
3. Create a new project:
   - Project name: `emd-secretary-desk`
   - Region: closest to you
4. Click **Create project**
5. You'll get a connection string like:
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
6. Copy this string — you'll need it in Vercel

---

### Step 2: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → choose **GitHub**
3. Authorize Vercel to access your GitHub
4. Allow it to install the Vercel GitHub App

---

### Step 3: Deploy the Repo to Vercel

1. In Vercel dashboard, click **Add New** → **Project**
2. Select **Import Git Repository**
3. Find `owurakwabenah-droid/EMD-Kuamsi` in the list
4. Click **Import**
5. You'll see the project settings page

---

### Step 4: Set Environment Variables in Vercel

1. In the Vercel project settings, go to **Settings** → **Environment Variables**
2. Click **Add**
3. Add this variable:
   - **Name**: `POSTGRES_URL`
   - **Value**: (paste your Neon connection string from Step 1)
   - Click **Add**
4. Repeat for environments: **Production**, **Preview**, **Development**

---

### Step 5: Deploy

1. Back on the project page, click **Deploy**
2. Vercel will build and deploy automatically
3. Wait ~2-3 minutes for deployment to finish
4. You'll get a URL like: `https://emd-secretary-desk.vercel.app`

---

### Step 6: Test the App

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. You should see the EMD Secretary Desk UI
3. Check the browser console (F12) for any errors
4. Test adding a product or recording a sale

---

### Step 7: Update Frontend API URL (if needed)

If the frontend doesn't auto-detect the API:

1. Go to your project's `index.html`
2. Find this line:
   ```javascript
   const BASE_URL = '/api';
   ```
3. It should stay as `/api` (Vercel rewrites it)
4. If it shows errors, change it to:
   ```javascript
   const BASE_URL = 'https://your-project-name.vercel.app/api';
   ```
5. Commit and push the change
6. Vercel will auto-redeploy

---

## 🔗 Architecture Summary

```
GitHub Repo
    ↓
Vercel Deployment
    ├── Frontend (index.html)
    ├── API Routes (api/*.js)
    └── Environment: POSTGRES_URL
    ↓
Neon Postgres Database
    ├── products table
    ├── inventory table
    ├── sales table
    └── Shared data for all users
```

---

## ✨ Final URLs

After deployment:

- **App**: `https://your-project-name.vercel.app`
- **API Health**: `https://your-project-name.vercel.app/api/health`
- **Products**: `https://your-project-name.vercel.app/api/products`
- **Inventory**: `https://your-project-name.vercel.app/api/inventory`
- **Sales**: `https://your-project-name.vercel.app/api/sales`

---

## 🆘 Troubleshooting

### "API not connecting"
- Check `POSTGRES_URL` is set in Vercel environment
- Check Neon database is running
- Look at Vercel logs: **Deployments** → click latest → **Logs**

### "Database error in logs"
- Confirm the connection string is correct
- Check Neon account has active database
- Try rebuilding: **Deployments** → **Redeploy**

### "Frontend loads but no data shows"
- Open browser console (F12)
- Check for CORS or 500 errors
- Verify `POSTGRES_URL` env var is set

### "Need to update code after deployment"
- Edit files in GitHub
- Commit and push
- Vercel auto-redeploys on each push

---

## 📊 After Deployment

✅ Users can access the app from anywhere with the internet  
✅ All users share one database  
✅ Data persists forever on Neon Postgres  
✅ Changes auto-deploy from GitHub  
✅ Fully production-ready  

---

## 🚀 Going Live

Once tested:
1. Share the Vercel URL with your team
2. Everyone accesses the same live app
3. All changes are saved to Postgres
4. Make code changes in GitHub, auto-deploys to Vercel
5. Database is managed by Neon

**That's it! You have a live, shared, persistent EMD Secretary Desk app.** 🎉
