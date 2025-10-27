/**
 * Centralized TypeScript Types
 * Database record types, API types, and utility types
 */

import { schema } from "@/db";
import { SQL } from "drizzle-orm";

// ============================================================================
// Database Record Types (Inferred from Schema)
// ============================================================================

export type Event = typeof schema.events.$inferSelect;
export type EventInsert = typeof schema.events.$inferInsert;
export type EventUpdate = Partial<EventInsert>;

export type RSVP = typeof schema.rsvps.$inferSelect;
export type RSVPInsert = typeof schema.rsvps.$inferInsert;
export type RSVPUpdate = Partial<RSVPInsert>;

export type User = typeof schema.users.$inferSelect;
export type UserInsert = typeof schema.users.$inferInsert;
export type UserUpdate = Partial<UserInsert>;

export type Post = typeof schema.posts.$inferSelect;
export type PostInsert = typeof schema.posts.$inferInsert;
export type PostUpdate = Partial<PostInsert>;

export type EventSpeaker = typeof schema.eventSpeakers.$inferSelect;
export type EventTopic = typeof schema.eventTopics.$inferSelect;

export type CheckpointScan = typeof schema.checkpointScans.$inferSelect;
export type CheckpointScanInsert = typeof schema.checkpointScans.$inferInsert;

export type Person = typeof schema.people.$inferSelect;
export type PersonInsert = typeof schema.people.$inferInsert;

export type TicketTemplate = typeof schema.ticketTemplates.$inferSelect;

// ============================================================================
// SQL Query Types
// ============================================================================

// Use this for arrays of SQL conditions
export type SQLCondition = SQL;

// ============================================================================
// API Response Types
// ============================================================================

export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Event with aggregated data (from event_summary view)
export type EventWithStats = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  date: Date;
  city: string | null;
  venue: string | null;
  image: string | null;
  capacity: number;
  published: boolean;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
  topics: string[];
  speakers: Array<{
    name: string;
    title: string | null;
    topic: string | null;
  }>;
  rsvp_total: number;
  rsvp_approved: number;
  rsvp_active: number;
  rsvp_pending: number;
  entry_scans: number;
  refreshment_scans: number;
  swag_scans: number;
  is_upcoming: boolean;
  is_past: boolean;
};

// RSVP with user profile and checkpoint data (from rsvp_search view)
export type RSVPWithProfile = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  affiliation: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  notified_at: Date | null;
  ticket_number: string | null;
  qr_code: string | null;
  checked_in_at: Date | null;
  account_id: string | null;
  account_email: string | null;
  account_name: string | null;
  ticket_image_url: string | null;
  ticket_generated_at: Date | null;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
  company: string | null;
  user_title: string | null;
  phone: string | null;
  whatsapp: string | null;
  entry_scanned_at: Date | null;
  refreshment_scanned_at: Date | null;
  swag_scanned_at: Date | null;
};

// ============================================================================
// Common Request/Response Patterns
// ============================================================================

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T = unknown> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// ============================================================================
// Utility Types
// ============================================================================

// For dynamic update objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// For query results with unknown structure
export type QueryRow = Record<string, unknown>;

// For request bodies that need validation
export type UnvalidatedBody = unknown;
