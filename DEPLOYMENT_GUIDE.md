# Deployment Guide for Absen V7 (CI/CD Pipeline)

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) workflow for the Absen V7 project. We use a **GitHub → Vercel** pipeline, meaning every code pushed to the `main` branch on GitHub will automatically become the live production site on Vercel.

## ✅ 1. Pre-Flight Deployment Checklist

Before pushing any code to GitHub, **always** run through this checklist locally to guarantee a 100% successful live deployment:

- [ ] **Test Locally:** Run `npm run dev` and test your new features. Ensure there are no errors in the browser console.
- [ ] **Check Code Quality:** Run `npm run lint` to catch any syntax or hook warnings.
- [ ] **Test Production Build:** Run `npm run build` locally. Vercel uses this exact command. **If it fails on your computer, it will fail on Vercel.**
- [ ] **Check Routing Config:** Ensure `vercel.json` exists in your root folder and is not ignored by Git. (This prevents 404 errors when refreshing pages).
- [ ] **Check Secrets:** Ensure your `.env` file is in `.gitignore` and is **NOT** staged for commit.

---

## 🚀 2. Routine Deployment Steps

Once you have passed the checklist above, you are ready to deploy. 

Because Vercel is linked to your GitHub repository, pushing your code to the `main` branch will automatically trigger a live production update.

Run these commands in your terminal:

```bash
# 1. Stage all your verified changes
git add .

# 2. Commit with a descriptive message describing what you changed
git commit -m "feat: your feature description"

# 3. Push to GitHub (This triggers the Vercel Auto-Deploy)
git push origin main