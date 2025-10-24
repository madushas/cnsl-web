# Monitoring Guide

**Last Updated**: October 13, 2025

This guide explains how to monitor the CNSL website in production.

---

## Health Check Endpoint

### `/api/health`

**Purpose**: Check if the application and its dependencies are healthy.

**Response Format**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T01:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 5
    },
    "redis": {
      "status": "up",
      "responseTime": 2
    }
  },
  "version": "abc1234"
}
```

**Status Values**:
- `healthy` (200) - All systems operational
- `degraded` (200) - Redis down but app still works (rate limiting disabled)
- `unhealthy` (503) - Database down, app cannot function

**Usage**:
```bash
# Check health
curl https://cloudnative.lk/api/health

# Monitor in production
# Use UptimeRobot, Better Uptime, or similar service
# Check interval: 5 minutes
```

---

## Error Tracking (Sentry)

### Setup Instructions

**1. Install Sentry**:
```bash
pnpm add @sentry/nextjs
```

**2. Enable Configuration**:

Uncomment the code in these files:
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server error tracking
- `sentry.edge.config.ts` - Edge runtime tracking

**3. Add Environment Variables**:

In `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@o0.ingest.sentry.io/0
SENTRY_DSN=https://YOUR_KEY@o0.ingest.sentry.io/0
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=cnsl-web
SENTRY_AUTH_TOKEN=sntrys_***
```

**4. Get Your DSN**:
- Sign up at https://sentry.io
- Create a new Next.js project
- Copy the DSN from project settings

**5. Verify**:
```bash
# Rebuild the app
pnpm build

# Visit your site and trigger an error
# Check Sentry dashboard for the error
```

---

## What Gets Tracked

### Automatic Error Tracking (when Sentry enabled):
- All uncaught JavaScript errors (client)
- All unhandled API route errors (server)
- Database query failures
- Authentication failures
- Rate limit violations
- External API failures (Resend, Telegram)

### Filtered Out (noise reduction):
- Browser extension errors
- Network errors (user's internet issues)
- Authentication checks (expected behavior)
- Next.js redirects/not-found

### Performance Monitoring:
- API route response times
- Page load times
- Database query durations

---

## Uptime Monitoring

### Recommended Service: UptimeRobot (Free Tier)

**What to Monitor**:

1. **Main Site**
   - URL: `https://cloudnative.lk/`
   - Type: HTTP(S)
   - Interval: 5 minutes
   - Expected: 200 OK

2. **Health Check**
   - URL: `https://cloudnative.lk/api/health`
   - Type: HTTP(S) with keyword
   - Keyword: `"status":"healthy"`
   - Interval: 5 minutes
   - Expected: 200 OK + keyword present

3. **Admin Login**
   - URL: `https://cloudnative.lk/admin/login`
   - Type: HTTP(S)
   - Interval: 15 minutes
   - Expected: 200 OK

### Alert Channels:
- Email: admin@cloudnative.lk
- Telegram: (optional) Use UptimeRobot → Telegram integration
- Slack: (optional) Use webhook

---

## Alert Configuration

### Critical Alerts (immediate notification):
- Database down (health check fails)
- Site down (main page unreachable)
- Error rate spike (>10 errors/minute in Sentry)

### Warning Alerts (can wait 15 min):
- Redis down (degraded mode)
- Slow response times (>2s for health check)
- Disk space low (if applicable)

### Info Alerts (daily summary):
- Daily error count
- New error types discovered
- Performance trends

---

## Monitoring Dashboard

### Option 1: Vercel Analytics (Built-in)
- Already enabled for all Vercel deployments
- Shows page views, performance, errors
- Access: https://vercel.com/dashboard

### Option 2: Sentry Dashboard
- Error tracking and performance
- Alerts and notifications
- Team collaboration
- Access: https://sentry.io

### Option 3: Custom Dashboard (Future)
- Build internal dashboard showing:
  - Active users
  - Event registrations
  - System health
  - Recent errors

---

## Common Issues & Runbooks

### Issue: Health Check Returns 503

**Symptoms**: `/api/health` returns `{"status":"unhealthy"}`

**Diagnosis**:
```bash
# Check health endpoint
curl https://cloudnative.lk/api/health | jq

# Look at the checks object
# If database.status === "down", database is the issue
```

**Fix**:
1. Check Neon database dashboard
2. Verify DATABASE_URL is correct
3. Check if database is paused (free tier auto-pauses)
4. Contact Neon support if issue persists

---

### Issue: Redis Shows "down" but site works

**Symptoms**: Health shows `{"status":"degraded"}`, Redis check fails

**Impact**: Rate limiting disabled, site still works

**Fix**:
1. Check Upstash Redis dashboard
2. Verify UPSTASH_REDIS_REST_URL and TOKEN
3. Check if Redis instance is active
4. Not critical - site functions without Redis

---

### Issue: High Error Rate in Sentry

**Symptoms**: 10+ errors/minute in Sentry dashboard

**Diagnosis**:
1. Check Sentry → Issues → Recent errors
2. Look for patterns (same error repeated)
3. Check error stack trace for affected code

**Common Causes**:
- Database query timeout (slow query)
- External API down (Resend, Telegram)
- Bad deployment (broken code)
- Attack or bot traffic

**Fix**:
1. Identify the error source
2. If deployment issue: rollback via Vercel
3. If external API: wait or disable feature
4. If attack: enable rate limiting, block IPs

---

### Issue: Slow Response Times

**Symptoms**: Health check takes >2 seconds

**Diagnosis**:
```bash
# Time the health check
time curl https://cloudnative.lk/api/health

# Check Vercel function logs
# Check database performance in Neon dashboard
```

**Fix**:
1. Check if database is in sleep mode (cold start)
2. Optimize slow queries (add indexes)
3. Upgrade database tier if needed
4. Check if Vercel function region matches DB region

---

## Maintenance Tasks

### Daily:
- [ ] Check Sentry for new errors
- [ ] Review UptimeRobot status

### Weekly:
- [ ] Review error trends
- [ ] Check database performance
- [ ] Verify backups are running

### Monthly:
- [ ] Review and archive old Sentry issues
- [ ] Check disk usage and cleanup if needed
- [ ] Update dependencies (`pnpm update`)

---

## Metrics to Track

### Application Health:
- Uptime % (target: 99.9%)
- Error rate (target: <0.1%)
- Response time (target: <500ms)

### Business Metrics:
- Event registrations per week
- Email delivery success rate
- User sign-ups

### Infrastructure:
- Database query time (target: <100ms avg)
- Database connection pool usage
- Function execution time

---

## Quick Reference Commands

```bash
# Check health locally
curl http://localhost:3000/api/health | jq

# Check health in production
curl https://cloudnative.lk/api/health | jq

# Test Sentry (after enabling)
# Visit: https://cloudnative.lk/api/test-sentry

# View Vercel logs
vercel logs --follow

# Check database status
# Visit: https://console.neon.tech
```

---

## Support Contacts

**Infrastructure Issues**:
- Vercel Support: https://vercel.com/support
- Neon Database: https://neon.tech/docs/introduction/support
- Upstash Redis: https://upstash.com/docs/redis/troubleshooting

**Monitoring Tools**:
- Sentry: https://docs.sentry.io
- UptimeRobot: https://uptimerobot.com/help

**Community**:
- CNSL Admin Team: admin@cloudnative.lk

---

## Next Steps

1. **Enable Sentry** (when ready for production):
   - Create Sentry account
   - Add environment variables
   - Uncomment Sentry config files
   - Rebuild and deploy

2. **Setup UptimeRobot**:
   - Create free account
   - Add 3 monitors (main, health, admin)
   - Configure email alerts

3. **Create Runbook**:
   - Document team escalation process
   - Add phone numbers for emergencies
   - Test alert workflows

4. **Establish Baselines**:
   - Monitor for 1 week
   - Record normal error rates
   - Set alert thresholds based on data

---

**Monitoring Status**: ✅ Infrastructure ready, Sentry optional

**Health Check**: ✅ Live at `/api/health`

**Next**: Setup external monitoring (UptimeRobot) and enable Sentry when ready for production.
