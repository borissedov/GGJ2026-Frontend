# Deploy to Cloudflare Pages

Quick guide for deploying the display frontend to Cloudflare Pages.

## Why Cloudflare Pages?

✅ **FREE** with generous limits
✅ **Global CDN** - Ultra-fast worldwide
✅ **Unlimited bandwidth** on free tier
✅ **Automatic HTTPS**
✅ **Git integration** with auto-deploy
✅ **500 builds/month** on free tier

## Prerequisites

- Cloudflare account (free)
- Backend deployed to Azure (or note the URL)

## Method 1: GitHub Integration (Recommended)

### Step 1: Push to GitHub

If not already in a Git repo:

```bash
cd oh-my-hungry-god-display
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 2: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Pages** in the left sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Authorize Cloudflare to access your GitHub
6. Select your repository
7. Click **Begin setup**

### Step 3: Configure Build Settings

- **Project name**: `oh-my-hungry-god` (or your choice)
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

Click **Save and Deploy**

### Step 4: Add Environment Variable

1. After deployment, go to **Settings** → **Environment variables**
2. Click **Add variable**
3. Add:
   - **Variable name**: `VITE_BACKEND_URL`
   - **Value**: `https://your-backend.azurewebsites.net/gamehub`
   - **Environment**: Production (and optionally Preview)
4. Click **Save**

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment
   
   OR
   
   Make a new commit and push to trigger auto-deploy:
   ```bash
   git commit --allow-empty -m "Trigger redeploy with env vars"
   git push
   ```

### Done! 🎉

Your app will be live at: `https://oh-my-hungry-god.pages.dev`

You can add a custom domain in Settings → Custom domains.

---

## Method 2: Direct Upload via CLI

Perfect for quick tests without Git.

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This opens a browser for authentication.

### Step 3: Build Your App

```bash
cd oh-my-hungry-god-display
echo "VITE_BACKEND_URL=https://your-backend.azurewebsites.net/gamehub" > .env
npm run build
```

### Step 4: Deploy

```bash
wrangler pages deploy dist
```

The project name and settings are already configured in `wrangler.toml`!

### Done! 🎉

Your app is live! The URL will be shown in the terminal.

---

## Method 3: Direct Upload via Dashboard

No CLI or Git needed.

### Step 1: Build Locally

```bash
cd oh-my-hungry-god-display
echo "VITE_BACKEND_URL=https://your-backend.azurewebsites.net/gamehub" > .env
npm run build
```

### Step 2: Upload to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Pages**
3. Click **Create a project**
4. Click **Upload assets**
5. Enter project name: `oh-my-hungry-god`
6. Drag and drop the entire `dist/` folder
7. Click **Deploy**

### Done! 🎉

Your app is live at: `https://oh-my-hungry-god.pages.dev`

---

## Updating Your Deployment

### If using Git integration:

Just push changes:
```bash
git add .
git commit -m "Update game"
git push
```

Cloudflare auto-deploys on every push!

### If using CLI:

```bash
npm run build
wrangler pages deploy dist
```

(Project settings are in `wrangler.toml`)

### If using direct upload:

Repeat the upload process via dashboard.

---

## Custom Domain (Optional)

### Step 1: Add Domain to Cloudflare

1. Cloudflare Dashboard → Add site
2. Enter your domain
3. Update nameservers at your domain registrar

### Step 2: Connect to Pages

1. Pages → Your project → Custom domains
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `game.yourdomain.com`)
4. Cloudflare automatically configures DNS

Your game will be at: `https://game.yourdomain.com` 🎮

---

## Troubleshooting

### Build fails

Check the build log in Cloudflare Dashboard → Deployments → View log.

Common issues:
- Missing environment variables → Add them in Settings
- Build command wrong → Should be `npm run build`
- Output directory wrong → Should be `dist`

### Can't connect to backend

- Verify `VITE_BACKEND_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend has CORS enabled (it does in our code)

### Environment variable not working

- Make sure you redeployed after adding the variable
- Check it's set for "Production" environment
- Verify the variable name is exactly `VITE_BACKEND_URL` (case-sensitive)

---

## Performance

Cloudflare Pages automatically:
- ✅ Compresses assets (gzip, brotli)
- ✅ Serves from 275+ global data centers
- ✅ Caches static assets at edge
- ✅ Uses HTTP/3 for faster connections
- ✅ Auto-minifies HTML/CSS/JS

**Expected load time**: < 1 second globally 🚀

---

## Free Tier Limits

- **Bandwidth**: Unlimited
- **Builds**: 500/month
- **Projects**: 100
- **Requests**: Unlimited
- **Storage**: 25GB

More than enough for your game jam! 🎉

---

## Monitoring

View analytics in Cloudflare Dashboard:
- Pages → Your project → Analytics
- See requests, bandwidth, unique visitors
- Geographic distribution of players

---

## Comparison: Cloudflare vs Azure Static Web Apps

| Feature | Cloudflare Pages | Azure Static Web Apps |
|---------|------------------|----------------------|
| **Free Tier** | ✅ Generous | ✅ Limited |
| **Bandwidth** | ✅ Unlimited | ❌ 100GB/month |
| **Builds** | ✅ 500/month | ❌ 10/month |
| **Global CDN** | ✅ 275+ locations | ✅ ~100 locations |
| **Deploy Speed** | ✅ 30-60s | ⚠️ 2-5 min |
| **Custom Domain** | ✅ Free & Easy | ✅ Free |
| **Preview Deploys** | ✅ Yes | ✅ Yes |

**Winner for this project**: Cloudflare Pages 🏆

---

## Questions?

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Community Forum](https://community.cloudflare.com/)

**Happy deploying!** 🚀
