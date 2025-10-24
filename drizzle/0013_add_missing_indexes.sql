-- Migration: Add missing indexes for performance optimization (DB-02)
-- Created: 2025-10-22
-- Description: Adds indexes for frequently queried columns that were missing

-- Add index for RSVP account lookups
-- Used when: Finding RSVPs by user, checking user registrations
CREATE INDEX IF NOT EXISTS "idx_rsvps_account_id" ON "rsvps" ("account_id");

-- Add index for events created_by filtering
-- Used when: Admin filtering events by creator
CREATE INDEX IF NOT EXISTS "idx_events_created_by" ON "events" ("created_by");

-- Add composite index for RSVP event filtering
-- Used when: Checking if user has RSVP'd to specific event
CREATE INDEX IF NOT EXISTS "idx_rsvps_event_account" ON "rsvps" ("event_id", "account_id");

-- Verify existing indexes (for documentation)
-- These should already exist from previous migrations:
-- - idx_events_status_date ON events(published, date)
-- - idx_checkpoint_scans_rsvp ON checkpoint_scans(rsvp_id)
-- - idx_checkpoint_scans_event ON checkpoint_scans(event_id)
-- - idx_checkpoint_scans_composite ON checkpoint_scans(event_id, checkpoint_type, rsvp_id)
