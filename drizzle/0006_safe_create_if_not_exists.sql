-- Safe migration to avoid errors if objects already exist
-- This migration is defensive: it creates objects only if missing.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_speakers'
  ) THEN
    CREATE TABLE event_speakers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      event_id uuid,
      name text NOT NULL,
      title text,
      topic text
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_topics'
  ) THEN
    CREATE TABLE event_topics (
      event_id uuid,
      topic text NOT NULL
    );
  END IF;
END $$;

-- Create indexes if they do not exist
CREATE INDEX IF NOT EXISTS event_speakers_event_idx ON event_speakers USING btree (event_id);
CREATE INDEX IF NOT EXISTS event_topics_event_idx ON event_topics USING btree (event_id);

-- Ensure foreign keys exist (add only if missing)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'event_speakers' AND kcu.column_name = 'event_id'
  ) THEN
    ALTER TABLE event_speakers ADD CONSTRAINT event_speakers_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'event_topics' AND kcu.column_name = 'event_id'
  ) THEN
    ALTER TABLE event_topics ADD CONSTRAINT event_topics_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- No destructive actions performed by this migration.
