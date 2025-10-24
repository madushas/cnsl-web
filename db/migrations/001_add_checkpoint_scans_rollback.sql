-- Rollback Migration: Remove Multi-Checkpoint System
-- Date: 2025-10-10
-- Purpose: Safely rollback the checkpoint_scans table if needed

-- WARNING: This will delete all checkpoint scan data
-- Make sure to backup before running this rollback

-- Drop all indexes first
DROP INDEX IF EXISTS idx_checkpoint_scans_time;
DROP INDEX IF EXISTS idx_checkpoint_scans_scanner;
DROP INDEX IF EXISTS idx_checkpoint_scans_event_type;
DROP INDEX IF EXISTS idx_checkpoint_scans_type;
DROP INDEX IF EXISTS idx_checkpoint_scans_event;
DROP INDEX IF EXISTS idx_checkpoint_scans_rsvp;
DROP INDEX IF EXISTS checkpoint_scans_unique;

-- Drop the table (CASCADE will handle foreign key references)
DROP TABLE IF EXISTS checkpoint_scans CASCADE;

-- Note: rsvps.checked_in_at remains intact for backward compatibility
