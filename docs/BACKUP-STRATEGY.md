# Backup & Recovery Strategy

**Last Updated**: October 13, 2025

This document outlines backup procedures and disaster recovery plans for the CNSL website.

---

## Backup Overview

### What We Backup
1. **Database** (PostgreSQL) - Critical
2. **Environment Variables** - Critical
3. **User-uploaded content** (Cloudinary) - Important
4. **Application code** (GitHub) - Automatic

### Backup Frequency
- **Database**: Daily automated + pre-deployment
- **Environment variables**: On change
- **Code**: Continuous (Git)
- **Images**: Cloudinary handles automatically

---

## Database Backups

### Automatic Backups (Neon)

Neon provides automatic backups:
- **Point-in-time recovery**: 7 days (free tier) or 30 days (paid)
- **Branch creation**: Instant snapshots
- **Location**: Same region as database

**Access backups**:
```bash
# Via Neon Dashboard:
# Project → Branches → Create branch from specific time
```

### Manual Backups

#### Full Database Backup
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Custom format (faster restore)
pg_dump -Fc $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).dump
```

#### Table-Specific Backups
```bash
# Backup specific tables
pg_dump $DATABASE_URL -t events -t rsvps -t users > critical_tables.sql

# Backup data only (no schema)
pg_dump $DATABASE_URL --data-only > data_only.sql
```

### Pre-Deployment Backup

**Always run before migrations**:
```bash
#!/bin/bash
# backup_before_deploy.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/pre_deploy_$TIMESTAMP.dump"

echo "Creating backup: $BACKUP_FILE"
pg_dump -Fc $DATABASE_URL > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup successful: $BACKUP_FILE"
    echo "Size: $(du -h $BACKUP_FILE | cut -f1)"
else
    echo "❌ Backup failed!"
    exit 1
fi
```

---

## Backup Storage

### Recommended Storage Locations

#### Option 1: AWS S3 (Recommended)
```bash
# Install AWS CLI
pip install awscli

# Configure
aws configure

# Upload backup
aws s3 cp backup.dump s3://cnsl-backups/db/backup_$(date +%Y%m%d).dump

# List backups
aws s3 ls s3://cnsl-backups/db/

# Download backup
aws s3 cp s3://cnsl-backups/db/backup_20251013.dump ./restore.dump
```

#### Option 2: Local Storage
```bash
# Create backup directory
mkdir -p ~/backups/cnsl-web

# Run backup script
./scripts/backup.sh

# Keep last 30 days
find ~/backups/cnsl-web -mtime +30 -delete
```

#### Option 3: Google Cloud Storage
```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Upload
gsutil cp backup.dump gs://cnsl-backups/db/backup_$(date +%Y%m%d).dump

# Download
gsutil cp gs://cnsl-backups/db/backup_20251013.dump ./restore.dump
```

---

## Environment Variables Backup

### Export Environment Variables
```bash
# From Vercel (via CLI)
vercel env pull .env.production

# Encrypt and store securely
gpg --symmetric --cipher-algo AES256 .env.production

# Result: .env.production.gpg (safe to store in cloud)
```

### Restore Environment Variables
```bash
# Decrypt
gpg .env.production.gpg

# Import to Vercel
vercel env add < .env.production
```

---

## Recovery Procedures

### Database Recovery

#### Restore from Neon Point-in-Time
```bash
# 1. Go to Neon Dashboard
# 2. Project → Branches
# 3. Create new branch from timestamp
# 4. Update DATABASE_URL in Vercel
# 5. Redeploy application
```

#### Restore from Manual Backup
```bash
# Restore SQL dump
psql $DATABASE_URL < backup_20251013.sql

# Restore custom format
pg_restore -d $DATABASE_URL backup_20251013.dump

# Restore specific tables
pg_restore -d $DATABASE_URL -t events -t rsvps backup.dump
```

#### Selective Restore
```bash
# Extract specific table from backup
pg_restore -l backup.dump | grep events > events.list
pg_restore -d $DATABASE_URL -L events.list backup.dump
```

### Application Recovery

#### Rollback Deployment
```bash
# Via Vercel Dashboard
# 1. Deployments → Select previous working deployment
# 2. Click "..." → Promote to Production

# Via CLI
vercel ls
vercel promote <deployment-url>
```

#### Restore from Git
```bash
# Find last working commit
git log --oneline

# Revert to specific commit
git revert <commit-hash>
git push origin main

# Or checkout and redeploy
git checkout <commit-hash>
vercel --prod
```

---

## Disaster Recovery Plan

### Scenario 1: Database Corruption

**Detection**: Health check fails, database errors in logs

**Recovery Steps**:
1. Verify issue: `psql $DATABASE_URL -c "SELECT 1"`
2. Create new database in Neon
3. Restore from latest backup
4. Update DATABASE_URL in Vercel
5. Redeploy application
6. Verify functionality

**RTO**: 15-30 minutes  
**RPO**: < 24 hours (last backup)

### Scenario 2: Accidental Data Deletion

**Detection**: User reports missing data, admin notices deletion

**Recovery Steps**:
1. Identify deletion time
2. Create Neon branch from before deletion
3. Export affected data
4. Import to production database
5. Verify data integrity

**RTO**: 1-2 hours  
**RPO**: Point-in-time (Neon keeps 7 days)

### Scenario 3: Complete Service Outage

**Detection**: Site unreachable, monitoring alerts

**Recovery Steps**:
1. Check Vercel status page
2. Verify DNS settings
3. Check deployment status
4. Rollback if recent deployment
5. Contact Vercel support if infrastructure issue

**RTO**: 5-15 minutes  
**RPO**: N/A (stateless application)

### Scenario 4: Security Breach

**Detection**: Suspicious activity, unauthorized access

**Recovery Steps**:
1. Immediately revoke all API keys
2. Reset Stack Auth secrets
3. Create new database backup
4. Audit database for unauthorized changes
5. Restore from known-good backup if needed
6. Update all passwords and secrets
7. Review audit logs
8. Notify affected users if needed

**RTO**: 2-4 hours  
**RPO**: Varies by breach time

---

## Backup Automation

### Daily Backup Script

```bash
#!/bin/bash
# scripts/daily_backup.sh

set -e

BACKUP_DIR="/backups/cnsl-web"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
BACKUP_FILE="$BACKUP_DIR/daily_$DATE.dump"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating daily backup..."
pg_dump -Fc $DATABASE_URL > $BACKUP_FILE

# Upload to S3
echo "Uploading to S3..."
aws s3 cp $BACKUP_FILE s3://cnsl-backups/db/daily_$DATE.dump

# Keep last 7 daily backups locally
find $BACKUP_DIR -name "daily_*.dump" -mtime +7 -delete

# Keep last 30 backups in S3
aws s3 ls s3://cnsl-backups/db/ | grep daily | \
    sort -r | tail -n +31 | awk '{print $4}' | \
    xargs -I {} aws s3 rm s3://cnsl-backups/db/{}

echo "✅ Backup complete: $BACKUP_FILE"
echo "Size: $(du -h $BACKUP_FILE | cut -f1)"
```

### Cron Job Setup

```bash
# Run daily at 3 AM
0 3 * * * /path/to/cnsl-web/scripts/daily_backup.sh >> /var/log/cnsl-backup.log 2>&1

# Run before deployments (manual)
# Add to deployment script
```

---

## Backup Verification

### Test Restore Procedure

**Monthly Test**:
```bash
#!/bin/bash
# scripts/test_restore.sh

# 1. Create test database
createdb test_restore

# 2. Restore latest backup
pg_restore -d postgresql://localhost/test_restore backup.dump

# 3. Verify data
psql postgresql://localhost/test_restore -c "SELECT COUNT(*) FROM events"
psql postgresql://localhost/test_restore -c "SELECT COUNT(*) FROM rsvps"

# 4. Cleanup
dropdb test_restore

echo "✅ Restore test successful"
```

### Backup Integrity Check

```bash
# Verify backup is not corrupted
pg_restore -l backup.dump > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Backup integrity OK"
else
    echo "❌ Backup is corrupted!"
    exit 1
fi
```

---

## Monitoring & Alerts

### Backup Monitoring

```bash
# Check last backup time
aws s3 ls s3://cnsl-backups/db/ --recursive | sort | tail -n 1

# Alert if backup is old (> 25 hours)
LAST_BACKUP=$(aws s3 ls s3://cnsl-backups/db/ --recursive | sort | tail -n 1 | awk '{print $1" "$2}')
LAST_BACKUP_TS=$(date -d "$LAST_BACKUP" +%s)
NOW=$(date +%s)
DIFF=$((NOW - LAST_BACKUP_TS))

if [ $DIFF -gt 90000 ]; then
    echo "⚠️ Last backup is older than 25 hours!"
    # Send alert
fi
```

### Setup Alerts

**Via AWS CloudWatch** (if using S3):
- Monitor backup upload events
- Alert if no backup in 25 hours

**Via Cron + Email**:
```bash
# Add to daily_backup.sh
if [ $? -ne 0 ]; then
    echo "Backup failed!" | mail -s "CNSL Backup Failed" admin@cloudnative.lk
fi
```

---

## Backup Retention Policy

### Retention Schedule
- **Daily backups**: Keep 7 days
- **Weekly backups**: Keep 4 weeks
- **Monthly backups**: Keep 12 months
- **Pre-deployment**: Keep 90 days

### Implementation
```bash
# Daily: Already automated in daily_backup.sh

# Weekly (Sunday 3 AM)
0 3 * * 0 cp $BACKUP_DIR/daily_$(date +%Y%m%d).dump $BACKUP_DIR/weekly_$(date +%Y%m%d).dump

# Monthly (1st of month, 3 AM)
0 3 1 * * cp $BACKUP_DIR/daily_$(date +%Y%m%d).dump $BACKUP_DIR/monthly_$(date +%Y%m).dump

# Cleanup
find $BACKUP_DIR -name "weekly_*.dump" -mtime +28 -delete
find $BACKUP_DIR -name "monthly_*.dump" -mtime +365 -delete
```

---

## Data Export

### Export for Analytics
```bash
# Export events data
psql $DATABASE_URL -c "COPY events TO STDOUT CSV HEADER" > events.csv

# Export RSVPs
psql $DATABASE_URL -c "COPY rsvps TO STDOUT CSV HEADER" > rsvps.csv

# Export with query
psql $DATABASE_URL -c "COPY (SELECT * FROM rsvps WHERE status='approved') TO STDOUT CSV HEADER" > approved_rsvps.csv
```

---

## Recovery Time Objectives (RTO)

| Scenario | RTO | RPO | Priority |
|----------|-----|-----|----------|
| Database corruption | 30 min | 24 hrs | Critical |
| Accidental deletion | 2 hrs | Point-in-time | High |
| Service outage | 15 min | 0 | Critical |
| Security breach | 4 hrs | Varies | Critical |
| Data export needed | 1 hr | Current | Medium |

---

## Checklist

### Daily
- [ ] Verify automated backup ran
- [ ] Check backup file size is reasonable

### Weekly
- [ ] Test restore procedure
- [ ] Review backup logs
- [ ] Verify S3 storage usage

### Monthly
- [ ] Full disaster recovery test
- [ ] Review and update backup strategy
- [ ] Audit backup retention compliance

### Before Deployment
- [ ] Create pre-deployment backup
- [ ] Verify backup integrity
- [ ] Document deployment time
- [ ] Have rollback plan ready

---

## Quick Reference

```bash
# Create backup
pg_dump -Fc $DATABASE_URL > backup.dump

# Restore backup
pg_restore -d $DATABASE_URL backup.dump

# Upload to S3
aws s3 cp backup.dump s3://cnsl-backups/db/backup_$(date +%Y%m%d).dump

# Download from S3
aws s3 cp s3://cnsl-backups/db/backup_20251013.dump ./restore.dump

# Test backup integrity
pg_restore -l backup.dump > /dev/null

# Rollback deployment
vercel promote <previous-deployment-url>

# Point-in-time recovery (Neon)
# Dashboard → Branches → Create from timestamp
```

---

**Status**: ✅ Backup strategy documented  
**Review Date**: Monthly  
**Owner**: DevOps Team
