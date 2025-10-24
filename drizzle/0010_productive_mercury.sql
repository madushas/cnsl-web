ALTER TABLE "users" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "twitter" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "github" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "whatsapp" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_completed" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");