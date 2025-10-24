-- Fix Schema Issues (Migration 0005)

-- 1. Fix posts.date from text to timestamp
ALTER TABLE posts ALTER COLUMN date TYPE timestamp WITH TIME ZONE USING 
  CASE 
    WHEN date IS NULL THEN NULL
    WHEN date ~ '^\d{4}-\d{2}-\d{2}' THEN date::timestamp
    ELSE NOW()
  END;

-- 2. Add id primary key to event_topics (currently has no PK)
ALTER TABLE event_topics ADD COLUMN id uuid DEFAULT gen_random_uuid();
ALTER TABLE event_topics ADD PRIMARY KEY (id);

-- 3. Add composite index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(published, date);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_status ON rsvps(event_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);

-- 4. Add published column to posts if missing (for better control)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'published') THEN
    ALTER TABLE posts ADD COLUMN published BOOLEAN DEFAULT false;
  END IF;
END $$;
