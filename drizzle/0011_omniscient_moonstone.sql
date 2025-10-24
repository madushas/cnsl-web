CREATE TABLE "checkpoint_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rsvp_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"checkpoint_type" text NOT NULL,
	"scanned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"scanned_by" text,
	"scan_method" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "checkpoint_scans" ADD CONSTRAINT "checkpoint_scans_rsvp_id_rsvps_id_fk" FOREIGN KEY ("rsvp_id") REFERENCES "public"."rsvps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkpoint_scans" ADD CONSTRAINT "checkpoint_scans_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "checkpoint_scans_unique" ON "checkpoint_scans" USING btree ("rsvp_id","event_id","checkpoint_type");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_rsvp" ON "checkpoint_scans" USING btree ("rsvp_id");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_event" ON "checkpoint_scans" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_type" ON "checkpoint_scans" USING btree ("checkpoint_type");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_event_type" ON "checkpoint_scans" USING btree ("event_id","checkpoint_type");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_scanner" ON "checkpoint_scans" USING btree ("scanned_by");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_time" ON "checkpoint_scans" USING btree ("scanned_at");--> statement-breakpoint
CREATE INDEX "idx_rsvps_affiliation" ON "rsvps" USING btree ("affiliation");--> statement-breakpoint
-- Backfill existing check-ins as entry checkpoints for backward compatibility
INSERT INTO "checkpoint_scans" ("rsvp_id", "event_id", "checkpoint_type", "scanned_at", "scan_method", "notes")
SELECT 
  "id" as "rsvp_id",
  "event_id",
  'entry' as "checkpoint_type",
  "checked_in_at" as "scanned_at",
  'manual' as "scan_method",
  'Migrated from legacy checked_in_at field' as "notes"
FROM "rsvps"
WHERE "checked_in_at" IS NOT NULL
ON CONFLICT ("rsvp_id", "event_id", "checkpoint_type") DO NOTHING;