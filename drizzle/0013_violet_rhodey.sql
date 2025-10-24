CREATE TABLE "ticket_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"event_id" uuid,
	"is_default" boolean DEFAULT false,
	"background_image" text,
	"qr_config" jsonb NOT NULL,
	"text_overlays" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" text
);
--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN "ticket_image_url" text;--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN "ticket_generated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_templates" ADD CONSTRAINT "ticket_templates_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ticket_templates_event" ON "ticket_templates" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_templates_default" ON "ticket_templates" USING btree ("is_default");