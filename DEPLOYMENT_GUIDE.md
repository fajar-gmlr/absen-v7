# Deployment Guide for Absen V7

## Quick Deploy (Local → Vercel)

### Prerequisites
- Vercel CLI installed: `npm i -g vercel`
- Logged in to Vercel: `vercel login`

### Steps

1. **Link Project (First Time Only)**
   ```bash
   vercel link
   ```
   - Select "Y" to set up
   - Choose your scope (e.g., "Fajar Gumelar's projects")
   - Select the project to link to

2. **Deploy to Production**
   ```bash
   vercel --prod
   ```
   - Wait for build to complete
   - URL will be shown at the end

3. **Verify Deployment**
   - Check the provided URL
   - Test all functionality

---

## GitHub → Vercel (Auto Deploy)

### Setup
1. Connect GitHub repo to Vercel project
2. Vercel auto-deploys on every push to main/master

### Steps
1. **Commit changes**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

2. **Push to GitHub**
   ```bash
   git push origin master
   ```

3. **Vercel auto-deploys**
   - Check deployment status in Vercel dashboard
   - URL: https://vercel.com/dashboard

---

## Common Issues

### Issue: "origin does not appear to be a git repository"
**Fix:**
```bash
git remote add origin https://github.com/fajar-gmlr/absen-v7.git
git push origin master
```

### Issue: Build fails
**Check:**
- TypeScript errors: `npx tsc --noEmit`
- All imports are correct
- No missing dependencies

### Issue: Changes not reflecting
**Fix:**
- Clear browser cache (Ctrl+Shift+R)
- Check if deployment completed
- Verify correct URL

---

## Deployment Checklist

Before deploying, verify:
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] All changes committed
- [ ] Vercel CLI linked to correct project

After deploying, verify:
- [ ] Site loads correctly
- [ ] Firebase connection working
- [ ] All features functional
- [ ] No console errors

---

## URLs

- **Production:** https://absen-v7-main.vercel.app
- **Dashboard:** https://vercel.com/fajar-gumelars-projects/absen-v7-main
- **GitHub:** https://github.com/fajar-gmlr/absen-v7
