CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "date" TYPE timestamp with time zone USING (NULLIF("date", '')::timestamptz);--> statement-breakpoint
ALTER TABLE "rsvps" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
-- Drop existing primary key on user_roles (was on user_id) if present
DO $$
DECLARE
  pk_name text;
BEGIN
  SELECT tc.constraint_name INTO pk_name
  FROM information_schema.table_constraints tc
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'user_roles'
    AND tc.constraint_type = 'PRIMARY KEY';
  IF pk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.user_roles DROP CONSTRAINT %I', pk_name);
  END IF;
END $$;--> statement-breakpoint

-- Ensure RSVP columns exist without failing if already added in prior migrations
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "qr_code" text;--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "ticket_number" text;--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN IF NOT EXISTS "checked_in_at" timestamp with time zone;--> statement-breakpoint

-- Add surrogate id and primary key to user_roles in an idempotent way
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema='public' AND table_name='user_roles' AND constraint_type='PRIMARY KEY'
  ) THEN
    ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");
  END IF;
END $$;--> statement-breakpoint

-- Indices (guarded for idempotency)
CREATE INDEX IF NOT EXISTS "idx_events_status_date" ON "events" USING btree ("published","date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rsvps_event_email_key" ON "rsvps" USING btree ("event_id","email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rsvps_status_idx" ON "rsvps" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_rsvps_event_status" ON "rsvps" USING btree ("event_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rsvps_ticket_number_key" ON "rsvps" USING btree ("ticket_number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_role_key" ON "user_roles" USING btree ("user_id","role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_roles_email" ON "user_roles" USING btree ("email");