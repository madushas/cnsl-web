import { z } from 'zod'

// ============================================================================
// ARCH-03 Fix: Consolidated validation schemas
// Single source of truth for all validation logic
// ============================================================================

// ============================================================================
// RSVP Validation
// ============================================================================

// Simplified RSVP input for public API
export const RSVPInput = z.object({
  name: z.string().min(2, 'Name is required').max(100, 'Name too long'),
  email: z.email({ message: 'Invalid email address' }),
  affiliation: z.string().max(120).optional().default(''),
})
export type RSVPInput = z.infer<typeof RSVPInput>

// Extended RSVP schema with additional optional fields
export const rsvpSchema = RSVPInput.extend({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  guests: z.number().int().min(0).max(5, 'Maximum 5 guests').optional(),
})
export type RsvpInput = z.infer<typeof rsvpSchema>

// ============================================================================
// Bulk Operations Validation
// ============================================================================

// SEC-06 fix: Validate check-in items properly including date validation
const checkinItemSchema = z.object({
  id: z.uuid().optional(),
  email: z.email().optional(),
  ticketNumber: z.string().optional(),
  qr: z.string().optional(),
  when: z.string()
    .optional()
    .refine(
      (d) => !d || new Date(d) <= new Date(),
      { message: 'Cannot check in from future date' }
    ),
}).refine(
  (d) => d.id || d.email || d.ticketNumber || d.qr,
  { message: 'At least one identifier (id, email, ticketNumber, or qr) is required' }
)

export const bulkCheckinsSchema = z.object({
  action: z.enum(['checkin','uncheck']),
  items: z.array(checkinItemSchema).min(1, 'items array is required').max(500, 'Maximum 500 items allowed per bulk operation'),
})

// ============================================================================
// Contact Form Validation
// ============================================================================

export const contactSchema = z.object({
  email: z.email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message too short').max(5000, 'Message too long'),
})

export type ContactInput = z.infer<typeof contactSchema>
// ============================================================================
// Event Validation (Admin)
// ============================================================================

// Consolidated from lib/types.ts - comprehensive event schema
export const EventInput = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format (use lowercase and hyphens)'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(5000).optional().default(''),
  date: z.string(), // ISO datetime string
  city: z.string().max(120).optional().default(''),
  venue: z.string().max(120).optional().default(''),
  image: z.string().max(500).optional().default(''),
  capacity: z.number().int().min(0).default(0),
  published: z.boolean().default(false),
  topics: z.array(z.string()).optional().default([]),
  speakers: z
    .array(
      z.object({
        name: z.string().max(120),
        title: z.string().max(120).optional().default(''),
        topic: z.string().max(120).optional().default(''),
      })
    )
    .optional()
    .default([]),
})
export type EventInput = z.infer<typeof EventInput>

// Legacy alias for backward compatibility
export const eventSchema = EventInput

// ============================================================================
// Post Validation (Admin)
// ============================================================================

// Consolidated from lib/types.ts
export const PostInput = z.object({
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  title: z.string().min(3).max(200),
  excerpt: z.string().max(500).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  image: z.string().max(500).url().optional().nullable(),
  date: z.string().optional().nullable(),
  author: z.string().max(120).optional().nullable(),
  tags: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  content: z.union([z.string(), z.array(z.string())]).optional().nullable(),
})
export type PostInput = z.infer<typeof PostInput>

// Legacy alias for backward compatibility
export const postSchema = PostInput

// ============================================================================
// Person Validation (Admin - Organizers/Advisors)
// ============================================================================

export const PersonInput = z.object({
  name: z.string().min(2).max(120),
  role: z.string().max(120).optional().nullable(),
  title: z.string().max(120).optional().nullable(),
  company: z.string().max(120).optional().nullable(),
  linkedin: z.url().max(500).optional().nullable(),
  twitter: z.url().max(500).optional().nullable(),
  github: z.url().max(500).optional().nullable(),
  website: z.url().max(500).optional().nullable(),
  photo: z.url().max(500).optional().nullable(),
  category: z.enum(['organizer', 'advisor']),
})
export type PersonInput = z.infer<typeof PersonInput>

// ============================================================================
// Helper Functions
// ============================================================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    return {
      success: false as const,
      error: result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    }
  }
  
  return {
    success: true as const,
    data: result.data,
  }
}

// ============================================================================
// Admin Validation Schemas (Check-in, Select, Email Preview/Notify, Bulk Check-ins)
// ============================================================================

export const checkinSchema = z.object({
  slug: z.string().min(1, 'slug required'),
  id: z.uuid().optional(),
  ticketNumber: z
    .string()
    .regex(/^[A-Za-z0-9\-]{1,64}$/)
    .transform((s) => s.toUpperCase())
    .optional(),
  qr: z.string().max(2000).optional(),
  email: z.email().transform((s) => s.toLowerCase()).optional(),
}).refine((d) => d.id || d.ticketNumber || d.qr || d.email, {
  message: 'At least one identifier required',
})

export const adminSelectSchema = z.object({
  status: z.enum(['approved','invited','declined','cancelled','pending','waitlist']),
  rsvpIds: z.array(z.uuid()).min(1, 'No RSVP IDs provided').max(1000, 'Maximum 1000 RSVPs per bulk operation'),
})

export const previewEmailSchema = z.object({
  subject: z.string().min(1, 'subject required'),
  preheader: z.string().optional(),
  html: z.string().min(1, 'html required'),
  q: z.string().optional(),
  status: z.string().optional(),
  ids: z.array(z.uuid()).max(100, 'Maximum 100 preview recipients').optional().default([]),
})

export const notifySchema = z.object({
  subject: z.string().min(1, 'subject required'),
  preheader: z.string().optional(),
  html: z.string().min(1, 'html required'),
  q: z.string().optional(),
  status: z.string().optional(),
  ids: z.array(z.uuid()).max(5000, 'Maximum 5000 recipients per bulk email').optional().default([]),
  ratePerMinute: z.coerce.number().int().min(1).max(60).default(2),
})

// Removed duplicate - bulkCheckinsSchema now defined at line 52 with SEC-06 fix

// ============================================================================
// Checkpoint System Validation
// ============================================================================

// Checkpoint type enum for validation
export const checkpointTypeSchema = z.enum(['entry', 'refreshment', 'swag'], {
  message: 'Checkpoint type must be entry, refreshment, or swag'
})

// Scan method enum for validation
export const scanMethodSchema = z.enum(['qr', 'ticket', 'email', 'manual'], {
  message: 'Scan method must be qr, ticket, email, or manual'
})

// Single checkpoint scan schema
export const checkpointScanSchema = z.object({
  rsvpId: z.uuid('Invalid RSVP ID').optional(),
  eventId: z.uuid('Invalid event ID'),
  checkpointType: checkpointTypeSchema,
  identifier: z.object({
    id: z.uuid().optional(),
    email: z.email().optional(),
    ticketNumber: z.string().optional(),
    qr: z.string().optional(),
  }).refine(
    (data) => data.id || data.email || data.ticketNumber || data.qr,
    { message: 'At least one identifier (id, email, ticketNumber, or qr) is required' }
  ).optional(),
  scannedBy: z.string().optional(),
  scanMethod: scanMethodSchema.optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
})

// Bulk checkpoint scan schema
export const bulkCheckpointScanSchema = z.object({
  eventId: z.uuid('Invalid event ID'),
  checkpointType: checkpointTypeSchema,
  items: z.array(z.object({
    rsvpId: z.uuid().optional(),
    email: z.email().optional(),
    ticketNumber: z.string().optional(),
    scannedBy: z.string().optional(),
    notes: z.string().max(500).optional(),
  }).refine(
    (data) => data.rsvpId || data.email || data.ticketNumber,
    { message: 'At least one identifier required per item' }
  )).min(1, 'At least one item required').max(100, 'Maximum 100 items per bulk scan'),
})

// Checkpoint stats query schema
export const checkpointStatsQuerySchema = z.object({
  eventId: z.uuid('Invalid event ID'),
  checkpointType: checkpointTypeSchema.optional(),
})

// Checkpoint history query schema
export const checkpointHistoryQuerySchema = z.object({
  eventId: z.uuid('Invalid event ID'),
  checkpointType: checkpointTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})
