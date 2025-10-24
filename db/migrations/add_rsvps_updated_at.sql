-- Add updatedAt column to rsvps table for consistency with other tables
-- Migration: add_rsvps_updated_at
-- Date: 2025-10-13

-- Add the column with default value
ALTER TABLE rsvps 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Set existing rows to have updated_at = created_at
UPDATE rsvps 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Make it NOT NULL after backfilling
ALTER TABLE rsvps 
ALTER COLUMN updated_at SET NOT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN rsvps.updated_at IS 'Timestamp of last update to this RSVP record';
