# Deployment Guide

**Last Updated**: October 13, 2025

This guide covers deploying the CNSL website to production.

---

## Prerequisites

### Required Services
- **Vercel Account** (or similar Next.js hosting)
- **Neon PostgreSQL** database
- **Stack Auth** project configured
- **Resend** account for emails
- **Cloudinary** account for image uploads

### Optional Services
- **Upstash Redis** for production rate limiting
- **Sentry** for error tracking
- **Telegram Bot** for notifications

---

## Environment Variables

### Required

```env
# Auth (Stack Auth)
NEXT_PUBLIC_STACK_PROJECT_ID='your-project-id'
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY='your-key'
STACK_SECRET_SERVER_KEY='your-secret'

# Database (Neon)
DATABASE_URL='postgresql://user:password@host/database'

# Site URLs
NEXT_PUBLIC_SITE_URL='https://cloudnative.lk'
NEXT_PUBLIC_BASE_URL='https://cloudnative.lk'

# Email (Resend)
RESEND_API='re_xxxxx'
FROM_EMAIL='notifications@cloudnative.lk'
NOTIFY_EMAIL='admin@cloudnative.lk'

# Admin Access
ADMIN_EMAILS='admin@cloudnative.lk,admin2@cloudnative.lk'
```

### Optional (Production)

```env
# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL='https://xxx.upstash.io'
UPSTASH_REDIS_REST_TOKEN='your-token'

# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN='https://xxx@sentry.io/xxx'
SENTRY_DSN='https://xxx@sentry.io/xxx'
SENTRY_ORG='your-org'
SENTRY_PROJECT='cnsl-web'
SENTRY_AUTH_TOKEN='your-token'

# Notifications (Telegram)
TELEGRAM_BOT_TOKEN='your-bot-token'
TELEGRAM_CHAT_ID='your-chat-id'

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME='your-cloud-name'
CLOUDINARY_UNSIGNED_PRESET='your-preset'
```

---

## Deployment Steps

### 1. Initial Setup

#### A. Create Neon Database
```bash
# Visit https://neon.tech
# Create new project
# Copy connection string
```

#### B. Run Database Migrations
```bash
# Connect to your database and run migrations
psql $DATABASE_URL < db/schema.sql

# Or use Drizzle
pnpm drizzle-kit push:pg
```

#### C. Create Stack Auth Project
```bash
# Visit https://stack-auth.com
# Create new project
# Configure OAuth providers (Google, GitHub)
# Set callback URLs
# Copy credentials
```

### 2. Deploy to Vercel

#### Option A: Via GitHub (Recommended)
```bash
# 1. Push code to GitHub
git push origin main

# 2. Import project in Vercel
# Visit https://vercel.com/new
# Connect GitHub repository
# Configure environment variables
# Deploy
```

#### Option B: Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Configure Environment Variables in Vercel

```bash
# Via Vercel Dashboard:
# Project Settings → Environment Variables
# Add all required variables
# Redeploy after adding variables
```

### 4. Configure Custom Domain

```bash
# In Vercel Dashboard:
# Project Settings → Domains
# Add domain: cloudnative.lk
# Add DNS records provided by Vercel
```

### 5. Verify Deployment

```bash
# Check health endpoint
curl https://cloudnative.lk/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123,
  "checks": {
    "database": { "status": "up", "responseTime": 5 },
    "redis": { "status": "up", "responseTime": 2 }
  }
}
```

---

## Database Migrations

### Running Migrations

```bash
# Generate migration
pnpm drizzle-kit generate:pg

# Apply migration
pnpm drizzle-kit push:pg

# Or manually via psql
psql $DATABASE_URL -f db/migrations/migration_name.sql
```

### Migration Checklist
- [ ] Test migration on local database first
- [ ] Backup production database before applying
- [ ] Run migration during low-traffic period
- [ ] Verify application works after migration
- [ ] Have rollback plan ready

---

## Rollback Procedures

### Application Rollback (Vercel)

#### Via Dashboard
```bash
# 1. Go to Project → Deployments
# 2. Find last working deployment
# 3. Click "..." → Promote to Production
```

#### Via CLI
```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

### Database Rollback

#### Restore from Backup
```bash
# Neon provides point-in-time recovery
# Via Neon Dashboard:
# 1. Go to Branches
# 2. Create new branch from specific time
# 3. Switch application to new branch

# Or restore from backup:
pg_restore -d $DATABASE_URL backup_file.dump
```

#### Undo Migration
```bash
# Run down migration
psql $DATABASE_URL -f db/migrations/rollback_migration_name.sql
```

---

## Monitoring & Alerts

### Health Checks

#### Setup UptimeRobot
```bash
# 1. Create account at https://uptimerobot.com
# 2. Add monitor:
#    - Type: HTTP(S)
#    - URL: https://cloudnative.lk/api/health
#    - Interval: 5 minutes
# 3. Add alert contacts (email, Telegram, etc.)
```

### Error Tracking (Sentry)

#### Enable Sentry
```bash
# 1. Uncomment code in:
#    - sentry.client.config.ts
#    - sentry.server.config.ts
#    - sentry.edge.config.ts

# 2. Add environment variables

# 3. Rebuild and deploy
pnpm build
vercel --prod
```

### Application Logs

```bash
# View real-time logs
vercel logs --follow

# View specific function logs
vercel logs <function-name>

# View logs for specific deployment
vercel logs <deployment-url>
```

---

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
pnpm build
pnpm analyze

# Check bundle with source-map-explorer
npx source-map-explorer .next/static/**/*.js
```

### Database Performance

```bash
# Check slow queries (if enabled)
# In Neon dashboard: Analytics → Queries

# Add indexes for frequently queried columns
# Already optimized in schema.ts
```

### CDN & Caching

```bash
# Vercel automatically handles:
# - Static asset caching
# - Image optimization
# - Edge caching

# Custom cache headers in next.config.js if needed
```

---

## Security Checklist

### Pre-Launch
- [ ] All environment variables set
- [ ] ADMIN_EMAILS configured
- [ ] CSRF protection enabled (automatic)
- [ ] Rate limiting enabled
- [ ] File upload validation active
- [ ] XSS protection in place
- [ ] HTTPS enforced (automatic on Vercel)

### Post-Launch
- [ ] Monitor error rates
- [ ] Check for suspicious activity
- [ ] Review rate limit logs
- [ ] Update dependencies regularly

---

## Troubleshooting

### Build Failures

```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Check for missing dependencies
pnpm install

# Clear cache
rm -rf .next
pnpm build
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection string format
# Should be: postgresql://user:pass@host:5432/db

# Verify IP whitelisting in Neon
# Vercel IPs: https://vercel.com/docs/concepts/functions/serverless-functions/edge-functions/edge-functions-api#ip-addresses
```

### Authentication Issues

```bash
# Verify Stack Auth configuration
# Check callback URLs match:
# - https://cloudnative.lk/handler/stack-handler/*

# Test auth endpoint
curl https://cloudnative.lk/api/me

# Should return 401 if not authenticated
```

---

## Maintenance Windows

### Recommended Schedule
- **Minor updates**: Deploy anytime (zero downtime)
- **Database migrations**: Tuesday/Wednesday 2-4 AM LKT
- **Major updates**: Plan 1-week notice to community

### Maintenance Procedure
1. Announce maintenance window
2. Backup database
3. Deploy changes
4. Verify functionality
5. Monitor for issues
6. Announce completion

---

## Emergency Contacts

### Service Providers
- **Vercel Support**: https://vercel.com/support
- **Neon Support**: support@neon.tech
- **Stack Auth**: hello@stack-auth.com

### Team
- **Technical Lead**: [Your email]
- **DevOps**: [Your email]
- **Community Manager**: hello@cloudnative.lk

---

## Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs --follow

# Check health
curl https://cloudnative.lk/api/health

# Run migrations
pnpm drizzle-kit push:pg

# Rollback deployment
vercel promote <previous-deployment-url>

# Test build locally
pnpm build && pnpm start
```

---

## Success Criteria

### Deployment Complete When:
- [ ] Application loads at https://cloudnative.lk
- [ ] Health check returns "healthy"
- [ ] Can login with test account
- [ ] Can view events page
- [ ] Admin dashboard accessible
- [ ] Email notifications working
- [ ] Monitoring alerts configured

---

**Status**: ✅ Ready for production deployment  
**Estimated Deployment Time**: 2-3 hours (initial setup)  
**Estimated Rollback Time**: 5 minutes
