# Database Migrations Folder

**⚠️ IMPORTANT NOTICE**

This folder previously contained custom SQL migration files that conflicted with the Drizzle migration system.

## What Happened

All custom migrations have been **consolidated and moved** into the Drizzle migration system:

**Old location (removed):**
```
db/migrations/
├── 001_add_checkpoint_scans.sql
├── 002_phase2_indexes.sql
├── 003_create_performance_views.sql
├── 004_fix_event_summary_view.sql
├── 005_simplify_event_summary.sql
└── add_rsvps_updated_at.sql
```

**New location:**
```
drizzle/0014_create_db_views_and_functions.sql
```

## Why This Change?

1. **Dual migration systems caused conflicts** - Drizzle and custom SQL files were out of sync
2. **Multiple versions of views** - 3 different `event_summary` definitions caused broken APIs
3. **No version control** - Custom migrations weren't tracked properly
4. **Deployment issues** - Unclear which migrations were applied

## Current State

This folder is now **empty** and should remain empty. All database changes must go through Drizzle:

### To create new migrations:
```bash
# 1. Modify db/schema.ts
# 2. Generate migration
npm run db:generate

# 3. Apply migration
npm run db:migrate
```

### For views and functions:
Create a new Drizzle migration SQL file in `drizzle/` folder and update the journal.

## Documentation

- **Full migration details:** See `MIGRATION-GUIDE.md` in project root
- **Technical documentation:** See `docs/DATABASE-VIEWS-MIGRATION.md`
- **Summary:** See `REBUILD-SUMMARY.md` in project root

## Migration Applied

**Migration 0014** - October 26, 2025
- Created `event_summary` view
- Created `rsvp_search` view
- Created `get_paginated_rsvps()` function
- Created `get_checkpoint_status()` function
- Added performance indexes

All APIs are working correctly with these new database objects.
