-- Phase 2 Database Migration
-- Date: 2025-10-09
-- Purpose: Add missing index for RSVP affiliation search (DB-02 fix)

-- Add index on rsvps.affiliation for fast admin search/filter
-- This improves performance when admins search RSVPs by affiliation
CREATE INDEX IF NOT EXISTS idx_rsvps_affiliation ON rsvps(affiliation);

-- Verify the index was created
-- Run this after migration:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'rsvps' ORDER BY indexname;
