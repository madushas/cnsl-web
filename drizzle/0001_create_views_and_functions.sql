-- Migration: Create database views and functions for performance optimization
-- Date: 2025-10-27
-- Purpose: Add views and functions needed by API endpoints (Drizzle doesn't generate these)

-- Drop existing if any
DROP VIEW IF EXISTS event_summary CASCADE;
DROP VIEW IF EXISTS rsvp_search CASCADE;
DROP FUNCTION IF EXISTS get_paginated_rsvps(text, text, text, text, integer, integer);
DROP FUNCTION IF EXISTS get_checkpoint_status(uuid, uuid);

-- CREATE EVENT_SUMMARY VIEW
CREATE VIEW event_summary AS
SELECT
  e.id,
  e.slug,
  e.title,
  e.description,
  e.date,
  e.city,
  e.venue,
  e.image,
  e.capacity,
  e.published,
  e.created_by,
  e.created_at,
  e.updated_at,
  COALESCE(
    jsonb_agg(DISTINCT et.topic) FILTER (WHERE et.topic IS NOT NULL),
    '[]'::jsonb
  ) AS topics,
  COALESCE(
    jsonb_agg(DISTINCT jsonb_build_object(
      'name', es.name,
      'title', es.title,
      'topic', es.topic
    )) FILTER (WHERE es.id IS NOT NULL),
    '[]'::jsonb
  ) AS speakers,
  COUNT(DISTINCT r.id) AS rsvp_total,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'approved') AS rsvp_approved,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status IN ('approved', 'invited')) AS rsvp_active,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'pending') AS rsvp_pending,
  COUNT(DISTINCT cs.id) FILTER (WHERE cs.checkpoint_type = 'entry') AS entry_scans,
  COUNT(DISTINCT cs.id) FILTER (WHERE cs.checkpoint_type = 'refreshment') AS refreshment_scans,
  COUNT(DISTINCT cs.id) FILTER (WHERE cs.checkpoint_type = 'swag') AS swag_scans,
  (e.date >= NOW()) AS is_upcoming,
  (e.date < NOW()) AS is_past
FROM events e
LEFT JOIN event_topics et ON et.event_id = e.id
LEFT JOIN event_speakers es ON es.event_id = e.id
LEFT JOIN rsvps r ON r.event_id = e.id
LEFT JOIN checkpoint_scans cs ON cs.event_id = e.id
WHERE e.deleted_at IS NULL
GROUP BY 
  e.id, e.slug, e.title, e.description, e.date, e.city, e.venue, 
  e.image, e.capacity, e.published, e.created_by, e.created_at, e.updated_at;

-- CREATE RSVP_SEARCH VIEW
CREATE VIEW rsvp_search AS
SELECT
  r.id,
  r.event_id,
  r.name,
  r.email,
  r.affiliation,
  r.status,
  r.created_at,
  r.updated_at,
  r.notified_at,
  r.ticket_number,
  r.qr_code,
  r.checked_in_at,
  r.account_id,
  r.account_email,
  r.account_name,
  r.ticket_image_url,
  r.ticket_generated_at,
  u.linkedin,
  u.twitter,
  u.github,
  u.website,
  u.company,
  u.title AS user_title,
  u.phone,
  u.whatsapp,
  MAX(cs.scanned_at) FILTER (WHERE cs.checkpoint_type = 'entry') AS entry_scanned_at,
  MAX(cs.scanned_at) FILTER (WHERE cs.checkpoint_type = 'refreshment') AS refreshment_scanned_at,
  MAX(cs.scanned_at) FILTER (WHERE cs.checkpoint_type = 'swag') AS swag_scanned_at
FROM rsvps r
LEFT JOIN users u ON u.auth_user_id = r.account_id
LEFT JOIN checkpoint_scans cs ON cs.rsvp_id = r.id AND cs.event_id = r.event_id
GROUP BY
  r.id, r.event_id, r.name, r.email, r.affiliation, r.status,
  r.created_at, r.updated_at, r.notified_at, r.ticket_number, r.qr_code,
  r.checked_in_at, r.account_id, r.account_email, r.account_name,
  r.ticket_image_url, r.ticket_generated_at,
  u.linkedin, u.twitter, u.github, u.website, u.company, u.title,
  u.phone, u.whatsapp;

-- CREATE GET_PAGINATED_RSVPS FUNCTION
CREATE OR REPLACE FUNCTION get_paginated_rsvps(
  in_event_slug text,
  in_status text DEFAULT NULL,
  in_search text DEFAULT NULL,
  in_checkpoint text DEFAULT NULL,
  in_page integer DEFAULT 1,
  in_size integer DEFAULT 20
) RETURNS TABLE (
  total integer,
  approved integer,
  pending integer,
  items jsonb
) LANGUAGE plpgsql AS $$$
DECLARE
  v_event_id uuid;
  v_page integer := GREATEST(COALESCE(in_page, 1), 1);
  v_size integer := GREATEST(LEAST(COALESCE(in_size, 20), 100), 1);
BEGIN
  SELECT id INTO v_event_id FROM events WHERE slug = in_event_slug AND deleted_at IS NULL LIMIT 1;
  
  IF v_event_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT *
    FROM rsvp_search
    WHERE event_id = v_event_id
      AND (in_status IS NULL OR in_status = '' OR status = in_status)
      AND (
        in_search IS NULL OR in_search = '' OR (
          name ILIKE '%' || in_search || '%'
          OR email ILIKE '%' || in_search || '%'
          OR COALESCE(affiliation, '') ILIKE '%' || in_search || '%'
          OR COALESCE(company, '') ILIKE '%' || in_search || '%'
          OR COALESCE(user_title, '') ILIKE '%' || in_search || '%'
        )
      )
      AND (
        in_checkpoint IS NULL OR in_checkpoint = '' OR
        CASE in_checkpoint
          WHEN 'entry' THEN entry_scanned_at IS NOT NULL
          WHEN 'refreshment' THEN refreshment_scanned_at IS NOT NULL
          WHEN 'swag' THEN swag_scanned_at IS NOT NULL
          WHEN 'missing-entry' THEN entry_scanned_at IS NULL
          WHEN 'missing-refreshment' THEN refreshment_scanned_at IS NULL
          WHEN 'missing-swag' THEN swag_scanned_at IS NULL
          ELSE TRUE
        END
      )
  ),
  paged AS (
    SELECT *
    FROM base
    ORDER BY created_at DESC
    LIMIT v_size
    OFFSET (v_page - 1) * v_size
  )
  SELECT
    COALESCE((SELECT COUNT(*)::int FROM base), 0) AS total,
    COALESCE((SELECT COUNT(*)::int FROM base WHERE status = 'approved'), 0) AS approved,
    COALESCE((SELECT COUNT(*)::int FROM base WHERE status = 'pending'), 0) AS pending,
    COALESCE((SELECT jsonb_agg(to_jsonb(p)) FROM paged p), '[]'::jsonb) AS items;
END;
$$;

-- CREATE GET_CHECKPOINT_STATUS FUNCTION
CREATE OR REPLACE FUNCTION get_checkpoint_status(
  in_event_id uuid,
  in_rsvp_id uuid
) RETURNS TABLE (
  has_entry boolean,
  has_refreshment boolean,
  has_swag boolean,
  entry_scanned_at timestamptz,
  refreshment_scanned_at timestamptz,
  swag_scanned_at timestamptz
) LANGUAGE sql STABLE AS $$
  SELECT
    BOOL_OR(cs.checkpoint_type = 'entry') AS has_entry,
    BOOL_OR(cs.checkpoint_type = 'refreshment') AS has_refreshment,
    BOOL_OR(cs.checkpoint_type = 'swag') AS has_swag,
    MAX(cs.scanned_at) FILTER (WHERE cs.checkpoint_type = 'entry') AS entry_scanned_at,
    MAX(cs.scanned_at) FILTER (WHERE cs.checkpoint_type = 'refreshment') AS refreshment_scanned_at,
    MAX(cs.scanned_at) FILTER (WHERE cs.checkpoint_type = 'swag') AS swag_scanned_at
  FROM checkpoint_scans cs
  WHERE cs.event_id = in_event_id AND cs.rsvp_id = in_rsvp_id;
$$;
