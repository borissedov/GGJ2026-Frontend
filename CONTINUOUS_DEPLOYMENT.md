# Continuous Deployment Setup - Cloudflare Pages

Complete guide for automatic deployments on every git push.

## Overview

Cloudflare Pages will automatically deploy your frontend whenever you push to GitHub. No CI/CD pipeline needed!

---

## Setup Steps (5 minutes)

### Step 1: Connect GitHub Repository to Cloudflare

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Click **Pages** in the left sidebar

2. **Create New Project** (or reconnect existing)
   - Click **Create a project**
   - Click **Connect to Git**
   - Click **GitHub** → Authorize Cloudflare (if needed)

3. **Select Repository**
   - Organization: **borissedov**
   - Repository: **GGJ2026-Frontend**
   - Click **Begin setup**

### Step 2: Configure Build Settings

- **Project name**: `oh-my-hungry-god` (matches your wrangler.toml)
- **Production branch**: `main`
- **Framework preset**: Select **Vite** from dropdown
- **Build command**: `npm run build` (auto-filled)
- **Build output directory**: `dist` (auto-filled)
- **Root directory**: `/` (leave empty)

Click **Save and Deploy**

### Step 3: Add Environment Variable

⚠️ **CRITICAL STEP** - Without this, the app will try to connect to localhost!

1. While the first build is running, click **Cancel deployment** (we need to add env var first)

2. Go to **Settings** → **Environment variables**

3. Click **Add variable**:
   - **Variable name**: `VITE_BACKEND_URL`
   - **Value**: `https://ohmyhungrygod-backend-f5che7gshshzhzhm.southafricanorth-01.azurewebsites.net/gamehub`
   - **Environment**: Check **Production** ✓ (and optionally **Preview**)

4. Click **Save**

### Step 4: Trigger First Deployment

1. Go to **Deployments** tab
2. Click **Retry deployment** on the failed/cancelled build

   OR make a small change and push:
   ```bash
   cd oh-my-hungry-god-display
   git commit --allow-empty -m "Trigger Cloudflare Pages deployment"
   git push
   ```

3. Watch the deployment progress (takes ~1 minute)

4. When complete, you'll see: **"Success! Deployment is live"**

---

## ✅ Verification

### Check Deployment Status

Cloudflare Dashboard → Pages → oh-my-hungry-god:
- **Production deployment**: Should show green checkmark ✅
- **Last deployed**: Timestamp of your deployment
- **Preview URL**: https://oh-my-hungry-god.pages.dev

### Test the App

**Open**: https://oh-my-hungry-god.pages.dev

You should see:
1. ✅ QR code appears
2. ✅ 6-character join code
3. ✅ Browser console shows "SignalR connected"
4. ✅ No error messages

**Browser Console** (F12):
```
SignalR connected
Room created!
```

---

## 🔄 How Auto-Deployment Works

From now on, **every push to `main` branch** triggers automatic deployment:

```bash
# Make changes
cd oh-my-hungry-god-display
# ... edit files ...
git add .
git commit -m "Update game UI"
git push
```

**Cloudflare automatically:**
1. Detects the push (within seconds)
2. Starts a new build
3. Runs `npm run build` with your env vars
4. Deploys to global CDN
5. Makes it live (usually < 60 seconds total)

**You'll get**:
- Email notification when deployment completes
- Can see build logs in Cloudflare Dashboard → Deployments

---

## 🌿 Branch Deployments (Preview Environments)

**Bonus**: Every branch gets its own preview URL!

```bash
git checkout -b feature/new-ui
# ... make changes ...
git push origin feature/new-ui
```

Cloudflare creates a preview deployment:
- URL: `https://feature-new-ui.oh-my-hungry-god.pages.dev`
- Perfect for testing before merging to main

---

## 🔧 Troubleshooting

### Build Fails

**Check build logs:**
- Cloudflare Dashboard → Deployments → Click on failed deployment
- View full build output

**Common issues:**
- Missing `VITE_BACKEND_URL` env var
- TypeScript errors
- Missing dependencies

**Fix:**
- Add env var in Settings → Environment variables
- Fix code and push again
- Check `package.json` has all dependencies

### App Shows "localhost:5000" Error

**Problem**: Environment variable not set during build

**Fix:**
1. Settings → Environment variables
2. Verify `VITE_BACKEND_URL` exists
3. Click **Redeploy** on latest deployment

### Can't Connect to Backend

**Check:**
```bash
# Test backend
curl https://ohmyhungrygod-backend-f5che7gshshzhzhm.southafricanorth-01.azurewebsites.net/health

# Should return: {"status":"healthy",...}
```

**If 404 or error:**
- Backend isn't deployed yet
- Check Azure Portal → App Service → Deployment Center

---

## 📊 Monitoring Deployments

### Cloudflare Dashboard

**Pages → oh-my-hungry-god → Deployments**

Shows:
- ✅ All deployments (success/failed)
- ⏱️ Build duration
- 📝 Commit message
- 🔗 Preview URLs

### GitHub Integration

**GitHub → Your repo → Commits**

Each commit shows:
- ✅ Cloudflare Pages deployment status
- 🔗 Direct link to preview

---

## 🎯 Production Workflow

### For Quick Fixes:
```bash
# Fix bug, commit, push - live in ~60 seconds
git add .
git commit -m "Fix: button alignment"
git push
```

### For Features:
```bash
# Create branch, test in preview, then merge
git checkout -b feature/new-screen
# ... develop ...
git push origin feature/new-screen
# Test preview URL
# Merge to main when ready → auto-deploys to production
```

---

## 🌐 Custom Domain (Optional)

Make your URL prettier: `game.yourdomain.com` instead of `*.pages.dev`

### Setup:

1. **Cloudflare Pages** → Settings → Custom domains
2. Click **Set up a custom domain**
3. Enter: `game.yourdomain.com` (or subdomain of your choice)
4. Cloudflare auto-configures DNS if domain is on Cloudflare
5. SSL certificate auto-provisions (1-2 minutes)

**Result**: https://game.yourdomain.com → your game! 🎮

---

## ✨ Benefits Summary

✅ **Zero configuration files** needed (uses wrangler.toml)  
✅ **Auto-deploy on push** to main branch  
✅ **Preview deployments** for all branches  
✅ **Instant rollback** - click on any previous deployment  
✅ **Build logs** - see what happened if build fails  
✅ **Fast deploys** - usually < 60 seconds  
✅ **Global CDN** - instant loading worldwide  
✅ **Free tier** - unlimited bandwidth!  

---

## 📝 Current Setup Status

- ✅ Repository: `borissedov/GGJ2026-Frontend` (main branch)
- ✅ Cloudflare project: `oh-my-hungry-god`
- ✅ Production URL: https://af789c41.oh-my-hungry-god.pages.dev
- ✅ Backend URL: Configured in env vars
- ✅ `wrangler.toml`: Project settings defined

**Once you connect GitHub to Cloudflare Pages (steps above), you're done!** Every push auto-deploys. 🚀
