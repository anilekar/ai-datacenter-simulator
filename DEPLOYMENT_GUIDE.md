# Deploying AI Data Center Simulator to Vercel

Complete guide for deploying your application to Vercel.

## Prerequisites

1. **GitHub Account** - Sign up at [github.com](https://github.com)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) - Free tier available!
3. **Git** - Installed on your system

---

## 🚀 Quick Start (Recommended Method)

### Step 1: Push to GitHub

```bash
# Navigate to your project
cd "C:\Users\anile\OneDrive\Documents\Coding\DataCenterWebSimulator"

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AI Data Center Simulator"
```

Now create a new repository on GitHub:
1. Go to [github.com/new](https://github.com/new)
2. Name it: `ai-datacenter-simulator`
3. Don't initialize with README (you already have files)
4. Click "Create repository"

Then push your code:
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/ai-datacenter-simulator.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Authorize GitHub if needed
4. Select your `ai-datacenter-simulator` repository
5. Vercel auto-detects Vite configuration:
   - **Framework**: Vite ✅
   - **Build Command**: `npm run build` ✅
   - **Output Directory**: `dist` ✅
6. Click **"Deploy"** 🚀

**Done!** Your app will be live in ~2 minutes at `your-app.vercel.app`

---

## 📋 Alternative: Deploy via Vercel CLI

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login & Deploy

```bash
# Login to Vercel
vercel login

# Navigate to project
cd "C:\Users\anile\OneDrive\Documents\Coding\DataCenterWebSimulator"

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## ✅ What's Already Configured

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

### `.gitignore`
Updated to exclude:
- `node_modules/`
- `dist/`
- `.vercel/`
- `*.xlsx` (Excel exports)

### `package.json`
Build script already configured:
```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

---

## 🎯 Post-Deployment Checklist

### Test Your Deployment

Visit your Vercel URL and test:
- [ ] Dashboard loads
- [ ] Select a scenario
- [ ] Run simulation
- [ ] Inject failures
- [ ] Configure custom settings
- [ ] Export to Excel
- [ ] Multi-variable plots work
- [ ] All charts render correctly

### Optional Enhancements

1. **Custom Domain**
   - Dashboard → Settings → Domains
   - Add your domain
   - Update DNS records

2. **Analytics**
   - Dashboard → Analytics (free tier)
   - Track page views, performance

3. **Preview Deployments**
   - Every GitHub PR gets its own URL
   - Test changes before merging

---

## 🔄 Updating Your Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make your changes...

# Commit and push
git add .
git commit -m "Update: added new feature"
git push

# Vercel automatically builds and deploys!
```

Manual redeploy via CLI:
```bash
vercel --prod
```

---

## 🐛 Troubleshooting

### Build Fails

**Test locally first:**
```bash
npm run build
```

**Common issues:**
- Missing dependencies → `npm install`
- TypeScript errors → Fix errors shown in build output
- Node version → Vercel uses Node 18+ (should work fine)

### App Loads but Doesn't Work

1. Open browser DevTools (F12)
2. Check Console for errors
3. Verify all routes work
4. Check Vercel logs: Dashboard → Project → Logs

### Excel Export Doesn't Download

- This is a client-side feature (uses browser download)
- Works the same on Vercel as localhost
- Check browser's download permissions

---

## 📊 Vercel Free Tier

Your project gets:
- ✅ **Bandwidth**: 100 GB/month (plenty!)
- ✅ **Builds**: 100 hours/month
- ✅ **Deployments**: Unlimited
- ✅ **SSL**: Free HTTPS certificate
- ✅ **CDN**: Global content delivery
- ✅ **Preview URLs**: For every PR
- ✅ **Auto-deployment**: From GitHub

**This is more than enough for this project!**

---

## 🌐 Example URLs

After deployment:
```
Production: https://ai-datacenter-simulator.vercel.app
Preview: https://ai-datacenter-simulator-git-feature-username.vercel.app
Custom: https://datacenter.yourdomain.com
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions](https://docs.github.com/en/actions) - For advanced CI/CD

---

## 🎉 Success!

Once deployed, you can:
1. Share the URL with stakeholders
2. Demo the simulator anywhere
3. Access from any device
4. No local setup needed for users

**Your AI Data Center Simulator is now live! 🚀**
