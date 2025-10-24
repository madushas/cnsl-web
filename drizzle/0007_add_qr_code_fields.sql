-- Add QR code and check-in fields to rsvps table
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS "qr_code" text;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS "ticket_number" text;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS "checked_in_at" timestamp with time zone;

-- Create unique index on ticket_number if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'rsvps_ticket_number_key'
  ) THEN
    CREATE UNIQUE INDEX rsvps_ticket_number_key ON rsvps(ticket_number) WHERE ticket_number IS NOT NULL;
  END IF;
END
$$;
