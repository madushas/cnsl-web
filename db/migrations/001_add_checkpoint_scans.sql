-- Migration: Add Multi-Checkpoint System
-- Date: 2025-10-10
-- Purpose: Enable tracking of entry, refreshment, and swag distribution separately

-- Create checkpoint_scans table
CREATE TABLE IF NOT EXISTS checkpoint_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL,
  event_id UUID NOT NULL,
  checkpoint_type TEXT NOT NULL CHECK (checkpoint_type IN ('entry', 'refreshment', 'swag')),
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  scanned_by TEXT,
  scan_method TEXT CHECK (scan_method IN ('qr', 'ticket', 'email', 'manual')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_checkpoint_scans_rsvp 
    FOREIGN KEY (rsvp_id) REFERENCES rsvps(id) ON DELETE CASCADE,
  CONSTRAINT fk_checkpoint_scans_event 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create unique index to prevent duplicate scans at same checkpoint
CREATE UNIQUE INDEX IF NOT EXISTS checkpoint_scans_unique 
  ON checkpoint_scans(rsvp_id, event_id, checkpoint_type);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_checkpoint_scans_rsvp 
  ON checkpoint_scans(rsvp_id);

CREATE INDEX IF NOT EXISTS idx_checkpoint_scans_event 
  ON checkpoint_scans(event_id);

CREATE INDEX IF NOT EXISTS idx_checkpoint_scans_type 
  ON checkpoint_scans(checkpoint_type);

CREATE INDEX IF NOT EXISTS idx_checkpoint_scans_event_type 
  ON checkpoint_scans(event_id, checkpoint_type);

CREATE INDEX IF NOT EXISTS idx_checkpoint_scans_scanner 
  ON checkpoint_scans(scanned_by);

CREATE INDEX IF NOT EXISTS idx_checkpoint_scans_time 
  ON checkpoint_scans(scanned_at);

-- Add helpful comments
COMMENT ON TABLE checkpoint_scans IS 'Tracks multiple checkpoints during events: entry, refreshment, and swag distribution';
COMMENT ON COLUMN checkpoint_scans.checkpoint_type IS 'Type of checkpoint: entry, refreshment, or swag';
COMMENT ON COLUMN checkpoint_scans.scan_method IS 'How the scan was performed: qr, ticket, email, or manual';
COMMENT ON COLUMN checkpoint_scans.scanned_by IS 'Admin user ID who performed the scan';
COMMENT ON COLUMN checkpoint_scans.notes IS 'Optional notes like "Late arrival" or "VIP"';

-- Backfill existing check-ins as entry checkpoints
-- This ensures backward compatibility with existing data
INSERT INTO checkpoint_scans (rsvp_id, event_id, checkpoint_type, scanned_at, scanned_by, scan_method, notes)
SELECT 
  id as rsvp_id,
  event_id,
  'entry' as checkpoint_type,
  checked_in_at as scanned_at,
  NULL as scanned_by,
  'manual' as scan_method,
  'Migrated from checked_in_at' as notes
FROM rsvps
WHERE checked_in_at IS NOT NULL
ON CONFLICT (rsvp_id, event_id, checkpoint_type) DO NOTHING;

-- Note: We keep rsvps.checked_in_at for backward compatibility
-- but new scans should use checkpoint_scans table
