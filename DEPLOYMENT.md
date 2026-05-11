# Deployment Guide

Complete instructions for deploying the Staff Attendance Management System to production.

## Pre-Deployment Checklist

- [ ] All code committed and pushed to main branch
- [ ] Build passes without errors: `bun run build`
- [ ] No TypeScript errors: `bun tsc --noEmit`
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] Tested on staging environment
- [ ] Performance checked (lighthouse score 90+)
- [ ] Security audit completed

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel?**
- Automatic deployments on push
- Built-in CDN globally distributed
- Zero-config deployment
- Free tier available
- Optimal for React/Vite apps

**Steps:**

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Connect your GitHub repository
   - Select `staff-pulse` repo

3. **Configure Environment Variables**
   - Click "Environment Variables"
   - Add these variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build (typically 2-3 minutes)
   - Get your live URL (e.g., `staff-pulse.vercel.app`)

5. **Verify Deployment**
   - Visit your live URL
   - Test login with demo account
   - Check all features work

**Auto-Deploy:** Every push to `main` automatically deploys!

**Rollback:**
```bash
# Revert to previous version in Vercel dashboard:
# Deployments → Select previous → Promote to production
```

---

### Option 2: Netlify

**Why Netlify?**
- Great GitHub integration
- Automatic deployments
- Form handling built-in
- Generous free tier
- Good performance

**Steps:**

1. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Authorize GitHub
   - Select repository

2. **Build Configuration**
   - Build command: `bun run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```

4. **Deploy**
   - Click "Deploy site"
   - Monitor build logs
   - Site goes live when build succeeds

**Custom Domain:**
- Domain settings → Add custom domain
- Update DNS records
- SSL certificate auto-generated

---

### Option 3: Cloudflare Pages

**Why Cloudflare?**
- Extremely fast globally
- High security
- Free tier competitive
- DDoS protection built-in
- Good for high traffic

**Steps:**

1. **Setup Cloudflare Account**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Add your domain

2. **Connect Pages Project**
   - Go to Pages section
   - "Create a project"
   - "Connect to Git"
   - Select repository

3. **Configure Build**
   - Framework: Vite
   - Build command: `bun run build`
   - Build output directory: `dist`

4. **Environment Variables**
   - Settings → Environment variables
   - Add Supabase credentials

5. **Deploy**
   - Click "Save and Deploy"
   - View build logs
   - Site available at `your-project.pages.dev`

---

### Option 4: Self-Hosted (Docker)

**For control & customization**

1. **Create Dockerfile**
   ```dockerfile
   FROM oven/bun:latest as builder
   WORKDIR /app
   COPY package.json bun.lockb ./
   RUN bun install
   COPY . .
   RUN bun run build

   FROM oven/bun:latest
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   RUN bun add -G serve
   EXPOSE 3000
   CMD ["bunx", "serve", "-s", "dist", "-l", "3000"]
   ```

2. **Build Docker Image**
   ```bash
   docker build -t staff-pulse:latest .
   ```

3. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e VITE_SUPABASE_URL=your-url \
     -e VITE_SUPABASE_ANON_KEY=your-key \
     staff-pulse:latest
   ```

4. **Deploy to Server**
   - Push to Docker Hub or private registry
   - Deploy to VPS (DigitalOcean, Linode, AWS EC2)
   - Use container orchestration (Docker Compose, Kubernetes)

---

## 🔒 Security Configuration

### 1. HTTPS/SSL
- Automatic on all platforms (Vercel, Netlify, Cloudflare)
- Force HTTPS redirect in headers

### 2. Environment Variables
- **Never commit .env files**
- Use `.env.example` for documentation
- Store secrets in platform settings only

### 3. CORS Configuration
```javascript
// Already configured in Supabase
// Allow your deployment domain
```

### 4. Rate Limiting
Consider adding rate limiting for:
- Login attempts: 5 tries per hour
- API calls: 1000 per hour per user

---

## 📊 Monitoring & Maintenance

### Performance Monitoring
```bash
# Check performance after deployment
# Use Lighthouse: https://web.dev/measure/

# Target scores:
# Performance: 90+
# Accessibility: 90+
# Best Practices: 90+
# SEO: 90+
```

### Error Tracking
Set up error tracking:
- **Vercel Analytics**: Built-in
- **Sentry**: Real-time error monitoring
- **LogRocket**: Session replay

### Uptime Monitoring
- Use UptimeRobot: https://uptimerobot.com
- Monitor response times
- Get alerts for downtime

---

## 🔄 Continuous Deployment (CD)

### Automatic Deployments
GitHub Actions already configured (see `.github/workflows/build.yml`):

1. **On every push to main**:
   - Runs linter
   - Builds project
   - Checks TypeScript
   - Auto-deploys to production

2. **On pull requests**:
   - Same checks as above
   - Prevents merge if checks fail

### Manual Deployment
If needed:
```bash
# Build locally
bun run build

# Test build
bun run preview

# Deploy (platform-specific)
# Vercel: Push to main branch
# Netlify: Push to main branch
# Cloudflare: Push to main branch
```

---

## 📈 Database Backups

### Supabase Backups
1. Go to Supabase Dashboard
2. Project Settings → Backups
3. Enable automated daily backups
4. Download backups monthly for safety

### Manual Backup
```bash
# Export database
pg_dump your_supabase_connection > backup.sql

# Restore database
psql your_supabase_connection < backup.sql
```

---

## 🆘 Rollback Procedures

### Vercel Rollback
1. Go to Vercel Dashboard
2. Select "Deployments"
3. Find previous stable deployment
4. Click three dots → "Promote to Production"

### Netlify Rollback
1. Go to Netlify site dashboard
2. Deploys tab
3. Click previous deploy
4. Click "Publish deploy"

### Git Rollback
```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# This triggers automatic redeploy
```

---

## 🚨 Deployment Issues

### Build Fails: "Module not found"
```bash
# Clean install
bun install --force
bun run build
```

### Site Shows 404
- Check build output directory is `dist`
- Verify `index.html` exists in dist
- Check build command in platform settings

### Environment Variables Not Working
- Confirm variables added to platform settings
- Restart deployment after adding variables
- Check variable names match exactly

### Supabase Connection Failed
- Verify `VITE_SUPABASE_URL` is correct
- Check `VITE_SUPABASE_ANON_KEY` is valid
- Ensure RLS policies allow public access
- Check network tab for CORS errors

---

## 📋 Deployment Checklist Template

```markdown
## Deployment to Production - [DATE]

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Database backed up
- [ ] Team notified
- [ ] Maintenance window scheduled

### Deployment
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Deployment to [Platform] initiated
- [ ] Build completes without errors
- [ ] Site accessible at live URL

### Post-Deployment
- [ ] All pages load correctly
- [ ] Login functionality verified
- [ ] Employee CRUD operations tested
- [ ] Attendance marking works
- [ ] Reports generate correctly
- [ ] CSV export successful
- [ ] Mobile responsiveness verified
- [ ] Error logs checked
- [ ] Performance acceptable
- [ ] Team notified of successful deployment

### Rollback (if needed)
- [ ] Issue identified and documented
- [ ] Rollback procedure initiated
- [ ] Previous version deployed
- [ ] Verification complete
- [ ] Root cause analysis scheduled
```

---

## 📞 Support

**Deployment Questions?**
- Check platform documentation
- Review GitHub actions logs
- Check Supabase documentation
- Monitor project status pages

**Deployment Success! 🎉**

Your application is now live. Share your deployment URL:
- With your team
- In your GitHub README
- In project documentation
- For demo purposes

---

**Last Updated**: May 11, 2026
