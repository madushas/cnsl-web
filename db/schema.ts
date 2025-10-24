import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex, index, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date', { withTimezone: true }).notNull(),
  city: text('city'),
  venue: text('venue'),
  image: text('image'),
  capacity: integer('capacity').default(0),
  published: boolean('published').default(false),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
}, (t) => [
  uniqueIndex('events_slug_key').on(t.slug),
  index('idx_events_status_date').on(t.published, t.date),
])

export const eventSpeakers = pgTable('event_speakers', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  title: text('title'),
  topic: text('topic'),
}, (t) => [
  index('event_speakers_event_idx').on(t.eventId),
])

export const eventTopics = pgTable('event_topics', {
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  topic: text('topic').notNull(),
}, (t) => [
  index('event_topics_event_idx').on(t.eventId),
])

export const rsvps = pgTable('rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  affiliation: text('affiliation'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  accountId: text('account_id'),
  accountEmail: text('account_email'),
  accountName: text('account_name'),
  notifiedAt: timestamp('notified_at', { withTimezone: true }),
  qrCode: text('qr_code'),
  ticketNumber: text('ticket_number'),
  ticketImageUrl: text('ticket_image_url'),
  ticketGeneratedAt: timestamp('ticket_generated_at', { withTimezone: true }),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
}, (t) => [
  index('rsvps_event_idx').on(t.eventId),
  index('rsvps_email_idx').on(t.email),
  uniqueIndex('rsvps_event_email_key').on(t.eventId, t.email),
  index('rsvps_status_idx').on(t.status),
  index('idx_rsvps_event_status').on(t.eventId, t.status),
  index('idx_rsvps_affiliation').on(t.affiliation), // DB-02 fix: Index for admin search/filter
  uniqueIndex('rsvps_ticket_number_key').on(t.ticketNumber),
])

export const users = pgTable('users', {
  authUserId: text('auth_user_id').primaryKey(),
  email: text('email'),
  name: text('name'),
  imageUrl: text('image_url'),
  // Profile links & org fields
  linkedin: text('linkedin'),
  twitter: text('twitter'),
  github: text('github'),
  website: text('website'),
  company: text('company'),
  title: text('title'),
  // Contact fields
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  // Onboarding flag
  profileCompleted: boolean('profile_completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_users_email').on(t.email),
  index('idx_users_phone').on(t.phone),
])

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  email: text('email'),
  role: text('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('user_roles_user_role_key').on(t.userId, t.role),
  index('idx_user_roles_email').on(t.email),
])

// Ticket Templates for automated generation
export const ticketTemplates = pgTable('ticket_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  isDefault: boolean('is_default').default(false),
  backgroundImage: text('background_image'), // URL or base64
  qrConfig: jsonb('qr_config').notNull(), // { x, y, size, errorCorrection }
  textOverlays: jsonb('text_overlays'), // [{ field, x, y, fontSize, fontFamily, color }]
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdBy: text('created_by'),
}, (t) => [
  index('idx_ticket_templates_event').on(t.eventId),
  index('idx_ticket_templates_default').on(t.isDefault),
])

// Organizers/Advisors combined
export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: text('role'),
  title: text('title'),
  company: text('company'),
  linkedin: text('linkedin'),
  twitter: text('twitter'),
  github: text('github'),
  website: text('website'),
  photo: text('photo'),
  category: text('category').notNull(), // 'organizer' | 'advisor'
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
})

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  category: text('category'),
  image: text('image'),
  date: timestamp('date', { withTimezone: true }),
  author: text('author'),
  tags: text('tags'), // comma-separated for now
  content: text('content'), // join array with \n\n
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: text('deleted_by'),
}, (t) => [
  uniqueIndex('posts_slug_key').on(t.slug),
  index('posts_category_idx').on(t.category),
])


 export const auditLogs = pgTable('audit_logs', {
   id: uuid('id').primaryKey().defaultRandom(),
   userId: text('user_id'),
   action: text('action').notNull(),
   entityType: text('entity_type'),
   entityId: uuid('entity_id'),
   oldValues: jsonb('old_values'),
   newValues: jsonb('new_values'),
   ipAddress: text('ip_address'),
   createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
 })

// Multi-checkpoint system for event management
// Tracks entry, refreshment distribution, and swag distribution separately
export const checkpointScans = pgTable('checkpoint_scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  rsvpId: uuid('rsvp_id').notNull().references(() => rsvps.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  checkpointType: text('checkpoint_type').notNull(), // 'entry' | 'refreshment' | 'swag'
  scannedAt: timestamp('scanned_at', { withTimezone: true }).notNull().defaultNow(),
  scannedBy: text('scanned_by'), // Admin user ID who performed the scan
  scanMethod: text('scan_method'), // 'qr' | 'ticket' | 'email' | 'manual'
  notes: text('notes'), // Optional notes (e.g., "Late arrival", "VIP")
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  // Prevent duplicate scans at the same checkpoint
  uniqueIndex('checkpoint_scans_unique').on(t.rsvpId, t.eventId, t.checkpointType),
  // Fast lookups by RSVP
  index('idx_checkpoint_scans_rsvp').on(t.rsvpId),
  // Fast lookups by event
  index('idx_checkpoint_scans_event').on(t.eventId),
  // Fast lookups by checkpoint type
  index('idx_checkpoint_scans_type').on(t.checkpointType),
  // Fast stats queries (event + type combination)
  index('idx_checkpoint_scans_event_type').on(t.eventId, t.checkpointType),
  // Fast lookups by scanner (admin accountability)
  index('idx_checkpoint_scans_scanner').on(t.scannedBy),
  // Time-based queries (e.g., scans in last hour)
  index('idx_checkpoint_scans_time').on(t.scannedAt),
  // Composite for common multi-column filters and ordered scans
  index('idx_checkpoint_scans_event_rsvp_type_time').on(t.eventId, t.rsvpId, t.checkpointType, t.scannedAt),
])

// Drizzle relations for easier queries and type safety
export const eventsRelations = relations(events, ({ many }) => ({
  rsvps: many(rsvps),
  checkpointScans: many(checkpointScans),
  speakers: many(eventSpeakers),
  topics: many(eventTopics),
}))

export const rsvpsRelations = relations(rsvps, ({ one, many }) => ({
  event: one(events, {
    fields: [rsvps.eventId],
    references: [events.id],
  }),
  checkpointScans: many(checkpointScans),
}))

export const checkpointScansRelations = relations(checkpointScans, ({ one }) => ({
  rsvp: one(rsvps, {
    fields: [checkpointScans.rsvpId],
    references: [rsvps.id],
  }),
  event: one(events, {
    fields: [checkpointScans.eventId],
    references: [events.id],
  }),
}))
