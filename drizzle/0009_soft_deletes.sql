-- Add soft delete columns to events, posts, and people
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "deleted_by" text;

ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "deleted_by" text;

ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "deleted_by" text;
