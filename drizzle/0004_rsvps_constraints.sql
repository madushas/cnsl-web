-- RSVP constraints and workflow tweaks
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Default status to pending
ALTER TABLE public.rsvps
  ALTER COLUMN status SET DEFAULT 'pending';

-- Backfill any null status
UPDATE public.rsvps SET status = 'pending' WHERE status IS NULL;

-- Notified timestamp for sent invites
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='rsvps' AND column_name='notified_at'
  ) THEN
    ALTER TABLE public.rsvps ADD COLUMN notified_at timestamptz;
  END IF;
END $$;

-- Uniqueness per event/email to prevent duplicate registrations
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='rsvps_event_email_key'
  ) THEN
    CREATE UNIQUE INDEX rsvps_event_email_key ON public.rsvps(event_id, email);
  END IF;
END $$;

-- Helpful filter index for admin UI
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='rsvps_status_idx'
  ) THEN
    CREATE INDEX rsvps_status_idx ON public.rsvps(status);
  END IF;
END $$;
