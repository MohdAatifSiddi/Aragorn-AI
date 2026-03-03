# Aragorn AI - Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account with your code pushed
- Vercel account (free tier works)
- AWS credentials ready
- Supabase project set up

---

## Step 1: Prepare Your Repository

### 1.1 Commit All Changes
```bash
git add .
git commit -m "Add AWS integration and real-time updates"
git push origin main
```

### 1.2 Verify Files
Ensure these files are in your repo:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to exclude from deployment
- ✅ `next.config.ts` - Next.js configuration
- ✅ All source files

---

## Step 2: Deploy to Vercel

### 2.1 Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select "Aragorn-AI" repository

### 2.2 Configure Build Settings
Vercel will auto-detect Next.js. Verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2.3 Add Environment Variables

Click "Environment Variables" and add these:

#### Supabase Variables:
```
NEXT_PUBLIC_SUPABASE_URL = https://nvxgunmvwyujtcodkvkn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
DATABASE_URL = your_database_url
```

#### AWS Variables:
```
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = your_aws_access_key_id
AWS_SECRET_ACCESS_KEY = your_aws_secret_access_key
AWS_S3_BUCKET = aragorn-construction-images
```

#### Site URL:
```
NEXT_PUBLIC_SITE_URL = https://your-project.vercel.app
```

**Important**: Add these to all environments (Production, Preview, Development)

### 2.4 Deploy
Click "Deploy" and wait 2-3 minutes.

---

## Step 3: Post-Deployment Configuration

### 3.1 Update Supabase Redirect URL
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL":
   ```
   https://your-project.vercel.app
   ```
3. Add to "Redirect URLs":
   ```
   https://your-project.vercel.app/auth/callback
   ```

### 3.2 Update AWS S3 CORS
1. Go to AWS Console → S3 → Your Bucket → Permissions → CORS
2. Update the configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-project.vercel.app"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 3.3 Update Environment Variable in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_SITE_URL` with your actual Vercel URL
3. Redeploy the project

---

## Step 4: Verify Deployment

### 4.1 Test Basic Functionality
1. Visit your Vercel URL
2. Try to sign up / log in
3. Check if dashboard loads

### 4.2 Test Image Upload
1. Login to dashboard
2. Upload a test construction image
3. Verify:
   - ✅ Image uploads to S3
   - ✅ Analysis completes
   - ✅ Results display
   - ✅ Dashboard updates

### 4.3 Check Logs
If issues occur:
1. Vercel Dashboard → Your Project → Deployments → Latest → View Function Logs
2. Check for errors in:
   - `/api/upload`
   - `/api/analyze`
   - `/api/stats`

---

## Common Deployment Issues

### Issue 1: Build Fails with "routes-manifest.json not found"
**Solution**: Already fixed in `next.config.ts`. If still occurs:
```bash
# Clear Next.js cache locally
rm -rf .next
npm run build

# Commit and push
git add .
git commit -m "Fix build configuration"
git push
```

### Issue 2: Environment Variables Not Working
**Solution**:
1. Verify all variables are added in Vercel
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables

### Issue 3: Image Upload Fails
**Solution**:
1. Check AWS credentials in Vercel environment variables
2. Verify S3 bucket CORS includes Vercel URL
3. Check S3 bucket permissions

### Issue 4: Authentication Fails
**Solution**:
1. Update Supabase redirect URLs
2. Verify `NEXT_PUBLIC_SITE_URL` is correct
3. Check Supabase auth settings

### Issue 5: "Module not found" Errors
**Solution**:
```bash
# Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

---

## Performance Optimization

### 1. Enable Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Enable Vercel Speed Insights
```bash
npm install @vercel/speed-insights
```

### 3. Configure Caching
Already configured in `next.config.ts` for optimal performance.

---

## Monitoring & Maintenance

### Check Deployment Status
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Check deployments
vercel ls

# View logs
vercel logs
```

### Monitor AWS Costs
1. AWS Console → Billing Dashboard
2. Set up billing alerts
3. Monitor S3 storage and Rekognition usage

### Monitor Supabase Usage
1. Supabase Dashboard → Settings → Usage
2. Check database size
3. Monitor API requests

---

## Scaling Considerations

### When to Scale:

#### 1. High Traffic (> 10,000 users/month)
- Upgrade Vercel plan for better performance
- Consider AWS CloudFront CDN for images
- Implement Redis caching

#### 2. Large Image Volume (> 100,000 images/month)
- Move to AWS Lambda for async processing
- Implement image compression
- Use S3 Intelligent-Tiering

#### 3. Multiple Sites (> 10 construction sites)
- Implement multi-tenancy
- Database sharding
- Regional deployments

---

## Rollback Procedure

If deployment has issues:

### Option 1: Instant Rollback (Vercel Dashboard)
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Option 2: Git Revert
```bash
git revert HEAD
git push origin main
```

### Option 3: Redeploy Specific Commit
1. Vercel Dashboard → Deployments
2. Find working commit
3. Click "Redeploy"

---

## Security Checklist

Before going live:

- [ ] All environment variables are set
- [ ] AWS credentials are production keys (not dev)
- [ ] S3 bucket is private (no public access)
- [ ] Supabase RLS policies are enabled
- [ ] CORS is configured correctly
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Error messages don't expose sensitive data

---

## Production Checklist

- [ ] All tests pass locally
- [ ] Build succeeds on Vercel
- [ ] Authentication works
- [ ] Image upload works
- [ ] AI analysis works
- [ ] Dashboard updates in real-time
- [ ] Mobile responsive
- [ ] Performance is acceptable (< 3s load time)
- [ ] Error handling works
- [ ] Monitoring is set up

---

## Support

### Vercel Issues
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

### Next.js Issues
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js GitHub](https://github.com/vercel/next.js)

### AWS Issues
- Check `AWS_SETUP_GUIDE.md`
- [AWS Support](https://aws.amazon.com/support)

---

## Quick Commands

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Link local project to Vercel
vercel link
```

---

## Success!

Your Aragorn AI is now live on Vercel! 🎉

**Next Steps:**
1. Share the URL with your team
2. Upload test images
3. Monitor performance
4. Gather user feedback
5. Iterate and improve

**Production URL**: `https://your-project.vercel.app`

---

**Last Updated**: March 3, 2024
**Status**: Production Ready ✅
