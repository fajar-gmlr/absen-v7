# Deployment Guide for Absen V7

## Recommended Workflow: GitHub → Vercel (Auto Deploy)

This is the **recommended** deployment method. Vercel automatically deploys when you push to GitHub.

### Setup (One Time)
1. Connect GitHub repo to Vercel project at https://vercel.com/dashboard
2. Select your repository: `fajar-gmlr/absen-v7`
3. Vercel will auto-deploy on every push to `main` branch

### Deploy Steps

1. **Commit your changes**
   
```
bash
   git add .
   git commit -m "Your commit message"
   
```

2. **Push to GitHub main branch**
   
```
bash
   git push origin master:main
   
```
   Or if you're already on main branch:
   
```
bash
   git push origin main
   
```

3. **Vercel auto-deploys**
   - Build starts automatically (takes 1-2 minutes)
   - Check status at: https://vercel.com/dashboard
   - Production URL: https://fajar-gmlr-absen-v7.vercel.app/

---

## Environment Variables Setup

### Local Development
1. Copy `.env.example` to `.env`:
   
```
bash
   cp .env.example .env
   
```

2. Fill in your actual Firebase credentials in `.env`:
   
```
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseapp.com
   
```

3. **IMPORTANT**: `.env` is in `.gitignore` and should NEVER be committed to GitHub

### Vercel Production Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add all `VITE_FIREBASE_*` variables from your `.env` file
4. Redeploy if needed

---

## Alternative: Local → Vercel CLI (Not Recommended)

Only use this if GitHub auto-deploy is not working.

### Prerequisites
- Vercel CLI installed: `npm i -g vercel`
- Logged in to Vercel: `vercel login`

### Steps
1. **Link to existing project**
   
```
bash
   vercel link
   
```
   - Select "Y" to set up
   - Choose "Fajar Gumelar's projects"
   - Select "absen-v7" (NOT absen-v7-main)

2. **Deploy to production**
   
```
bash
   vercel --prod
   
```

---

## Common Issues

### Issue: Build fails on Vercel
**Check locally first:**
```
bash
npm run build
npx tsc --noEmit
```
**Common causes:**
- TypeScript errors (missing types, incorrect imports)
- Missing dependencies in package.json
- Missing environment variables (VITE_FIREBASE_*)

### Issue: Changes pushed but not deploying
**Check:**
- Did you push to `main` branch? Vercel only watches `main`
- Check Vercel dashboard for build errors: https://vercel.com/dashboard
- Verify GitHub connection in Vercel project settings

### Issue: "Cannot find module" or TypeScript errors
**Fix:**
```
bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Deployed to wrong project (absen-v7-main instead of absen-v7)
**Fix:**
- Always use GitHub workflow (push to main)
- If using CLI, run `vercel link` and select "absen-v7" (not absen-v7-main)

### Issue: Firebase connection fails in production
**Fix:**
- Verify all `VITE_FIREBASE_*` environment variables are set in Vercel
- Check that `VITE_FIREBASE_DATABASE_URL` is correct
- Ensure Firebase Realtime Database rules allow access

---

## Deployment Checklist

### Before Pushing to GitHub:
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] All changes committed (`git status` shows clean)
- [ ] `.env` file is NOT staged (should be in `.gitignore`)
- [ ] Tested locally (`npm run dev`)

### After Vercel Deploys:
- [ ] Check deployment status in Vercel dashboard
- [ ] Test production URL: https://fajar-gmlr-absen-v7.vercel.app/
- [ ] Verify Firebase connection working
- [ ] Test key features (absensi, managerial, etc.)
- [ ] Clear browser cache if needed (Ctrl+Shift+R)

---

## Important URLs

| Resource | URL |
|----------|-----|
| **Production Site** | https://fajar-gmlr-absen-v7.vercel.app/ |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **GitHub Repository** | https://github.com/fajar-gmlr/absen-v7 |

## Quick Reference Commands

```
bash
# Test locally
npm run dev

# Build check
npm run build

# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Your message"
git push origin master:main

# Check status
git status
git log --oneline -3
