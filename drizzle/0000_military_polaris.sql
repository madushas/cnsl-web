CREATE TABLE IF NOT EXISTS "event_speakers" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
		"event_id" uuid,
		"name" text NOT NULL,
		"title" text,
		"topic" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_topics" (
		"event_id" uuid,
		"topic" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
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
		"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "people" (
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
		"category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
		"slug" text NOT NULL,
		"title" text NOT NULL,
		"excerpt" text,
		"category" text,
		"image" text,
		"date" text,
		"author" text,
		"tags" text,
		"content" text,
		"created_at" timestamp with time zone DEFAULT now(),
		"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rsvps" (
		"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
		"event_id" uuid,
		"name" text NOT NULL,
		"email" text NOT NULL,
		"affiliation" text,
		"status" text DEFAULT 'confirmed' NOT NULL,
		"created_at" timestamp with time zone DEFAULT now(),
		"account_id" text,
		"account_email" text,
		"account_name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
		"user_id" text PRIMARY KEY NOT NULL,
		"email" text,
		"role" text NOT NULL,
		"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
		"auth_user_id" text PRIMARY KEY NOT NULL,
		"email" text,
		"name" text,
		"image_url" text,
		"created_at" timestamp with time zone DEFAULT now(),
		"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.table_constraints tc
		JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
		WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'event_speakers' AND kcu.column_name = 'event_id'
	) THEN
		ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.table_constraints tc
		JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
		WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'event_topics' AND kcu.column_name = 'event_id'
	) THEN
		ALTER TABLE "event_topics" ADD CONSTRAINT "event_topics_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.table_constraints tc
		JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
		WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'rsvps' AND kcu.column_name = 'event_id'
	) THEN
		ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_speakers_event_idx" ON "event_speakers" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_topics_event_idx" ON "event_topics" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_key" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_key" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_category_idx" ON "posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rsvps_event_idx" ON "rsvps" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rsvps_email_idx" ON "rsvps" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");