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
CREATE TABLE "event_speakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"name" text NOT NULL,
	"title" text,
	"topic" text
);
--> statement-breakpoint
CREATE TABLE "event_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"topic" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" timestamp with time zone NOT NULL,
	"city" text,
	"venue" text,
	"image" text,
	"capacity" integer DEFAULT 0,
	"published" boolean DEFAULT false,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"deleted_by" text
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"title" text,
	"company" text,
	"linkedin" text,
	"twitter" text,
	"github" text,
	"website" text,
	"photo" text,
	"category" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" text
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"category" text,
	"image" text,
	"date" timestamp with time zone,
	"author" text,
	"tags" text,
	"content" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"deleted_by" text,
	"published" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"affiliation" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"account_id" text,
	"account_email" text,
	"account_name" text,
	"notified_at" timestamp with time zone,
	"qr_code" text,
	"ticket_number" text,
	"ticket_image_url" text,
	"ticket_generated_at" timestamp with time zone,
	"checked_in_at" timestamp with time zone
);
--> statement-breakpoint
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
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"email" text,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"auth_user_id" text PRIMARY KEY NOT NULL,
	"email" text,
	"name" text,
	"image_url" text,
	"linkedin" text,
	"twitter" text,
	"github" text,
	"website" text,
	"company" text,
	"title" text,
	"phone" text,
	"whatsapp" text,
	"profile_completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "checkpoint_scans" ADD CONSTRAINT "checkpoint_scans_rsvp_id_rsvps_id_fk" FOREIGN KEY ("rsvp_id") REFERENCES "public"."rsvps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkpoint_scans" ADD CONSTRAINT "checkpoint_scans_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_topics" ADD CONSTRAINT "event_topics_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_templates" ADD CONSTRAINT "ticket_templates_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "checkpoint_scans_unique" ON "checkpoint_scans" USING btree ("rsvp_id","event_id","checkpoint_type");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_rsvp" ON "checkpoint_scans" USING btree ("rsvp_id");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_event" ON "checkpoint_scans" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_type" ON "checkpoint_scans" USING btree ("checkpoint_type");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_event_type" ON "checkpoint_scans" USING btree ("event_id","checkpoint_type");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_scanner" ON "checkpoint_scans" USING btree ("scanned_by");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_time" ON "checkpoint_scans" USING btree ("scanned_at");--> statement-breakpoint
CREATE INDEX "idx_checkpoint_scans_event_rsvp_type_time" ON "checkpoint_scans" USING btree ("event_id","rsvp_id","checkpoint_type","scanned_at");--> statement-breakpoint
CREATE INDEX "event_speakers_event_idx" ON "event_speakers" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_topics_event_idx" ON "event_topics" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_key" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_events_status_date" ON "events" USING btree ("published","date");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_key" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "rsvps_event_idx" ON "rsvps" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "rsvps_email_idx" ON "rsvps" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "rsvps_event_email_key" ON "rsvps" USING btree ("event_id","email");--> statement-breakpoint
CREATE INDEX "rsvps_status_idx" ON "rsvps" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_rsvps_event_status" ON "rsvps" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "idx_rsvps_affiliation" ON "rsvps" USING btree ("affiliation");--> statement-breakpoint
CREATE UNIQUE INDEX "rsvps_ticket_number_key" ON "rsvps" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX "idx_rsvps_event_created_at" ON "rsvps" USING btree ("event_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_rsvps_account_id" ON "rsvps" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_rsvps_event_account" ON "rsvps" USING btree ("event_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_templates_event" ON "ticket_templates" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_templates_default" ON "ticket_templates" USING btree ("is_default");--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_user_role_key" ON "user_roles" USING btree ("user_id","role");--> statement-breakpoint
CREATE INDEX "idx_user_roles_email" ON "user_roles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");