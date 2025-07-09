# Cloud Native Sri Lanka - Database Migration Guide: Neon PostgreSQL Implementation

## 📋 Overview

This comprehensive guide outlines the migration from file-based data storage to a production-ready **Neon PostgreSQL** database for the Cloud Native Sri Lanka website. This migration enables dynamic content management, user authentication, event registration, and scalable data operations while maintaining the existing design system and component architecture.

## 🎯 Migration Goals

- **Dynamic Content Management**: Replace static files with database-driven content
- **User Authentication**: Implement secure login/registration system
- **Event Registration**: Enable users to register for events
- **Admin Panel**: Provide content management interface
- **Performance**: Maintain fast load times with ISR/SSR
- **Scalability**: Support growing community needs
- **Security**: Implement proper data validation and protection

## 📊 Current Data Structure Analysis

Based on the provided files, we currently have:

### **Static Data Files**

- types.ts - Comprehensive type definitions
- blog-content.ts - Blog posts and authors (10 posts, 5 authors)
- events-data.ts - Events and speakers (8 events, 4 speakers)

### **Component Architecture**

- Server components: `About.tsx`, `Blog.tsx`, `Events.tsx`
- Client components: `AboutClient.tsx`, `BlogClient.tsx`, `EventsClient.tsx`
- UI components: Shadcn-based with consistent theming

## 🗄️ Database Schema Design

### **1. Core Tables**

```sql
-- Users table for authentication and profiles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE
);

-- Authors table for blog content
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Speakers table for events
CREATE TABLE speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  company VARCHAR(255),
  bio TEXT,
  expertise TEXT[], -- Array of expertise areas
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_time INTEGER, -- in minutes
  category VARCHAR(50) NOT NULL CHECK (category IN ('Announcements', 'Tutorials', 'Event Recaps', 'Member Stories')),
  tags TEXT[], -- Array of tags
  featured BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time VARCHAR(50),
  location VARCHAR(255),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  registration_url TEXT,
  image_url TEXT,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('meetup', 'workshop', 'conference', 'webinar', 'hackathon')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  topics TEXT[], -- Array of topics
  speaker_id UUID REFERENCES speakers(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Contact form submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  newsletter_signup BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Indexes for Performance**

```sql
-- Indexes for better query performance
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_date DESC) WHERE published = TRUE;
CREATE INDEX idx_blog_posts_category ON blog_posts(category) WHERE published = TRUE;
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured) WHERE featured = TRUE AND published = TRUE;
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

CREATE INDEX idx_events_date ON events(event_date) WHERE published = TRUE;
CREATE INDEX idx_events_type ON events(event_type) WHERE published = TRUE;
CREATE INDEX idx_events_featured ON events(featured) WHERE featured = TRUE AND published = TRUE;
CREATE INDEX idx_events_slug ON events(slug);

CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

## 🛠️ Implementation Steps

### **Step 1: Environment Setup**

#### **1.1 Install Dependencies**

```bash
# Core database dependencies
pnpm install @neondatabase/serverless
pnpm install drizzle-orm drizzle-kit
pnpm install postgres
pnpm install dotenv

# Authentication
pnpm install next-auth
pnpm install @auth/drizzle-adapter

# Validation and utilities
pnpm install zod
pnpm install @t3-oss/env-nextjs

# UI and form handling
pnpm install react-hook-form
pnpm install @hookform/resolvers

# Development dependencies
pnpm install -D @types/pg
```

#### **1.2 Environment Configuration**

```bash
# .env.local
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/cnsl-db?sslmode=require"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: For production
NEON_DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/cnsl-db?sslmode=require"
NODE_ENV="development"

# Email configuration (for contact forms)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# File upload (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### **1.3 Environment Validation**

```typescript
// lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
  },
  client: {
    // Add client-side env vars here if needed
  },
  experimental__runtimeEnv: {
    // Add runtime env vars here if needed
  },
});
```

### **Step 2: Database Setup**

#### **2.1 Drizzle Configuration**

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";
import { env } from "./lib/env";

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

#### **2.2 Database Schema with Drizzle**

```typescript
// lib/db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "moderator",
  "member",
]);
export const eventTypeEnum = pgEnum("event_type", [
  "meetup",
  "workshop",
  "conference",
  "webinar",
  "hackathon",
]);
export const difficultyEnum = pgEnum("difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const categoryEnum = pgEnum("category", [
  "Announcements",
  "Tutorials",
  "Event Recaps",
  "Member Stories",
]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "registered",
  "attended",
  "no_show",
  "cancelled",
]);
export const submissionStatusEnum = pgEnum("submission_status", [
  "new",
  "in_progress",
  "resolved",
  "archived",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("member"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  emailVerified: boolean("email_verified").default(false),
  active: boolean("active").default(true),
});

// Authors table
export const authors = pgTable("authors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  active: boolean("active").default(true),
});

// Speakers table
export const speakers = pgTable("speakers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  company: varchar("company", { length: 255 }),
  bio: text("bio"),
  expertise: text("expertise").array(),
  imageUrl: text("image_url"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  active: boolean("active").default(true),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  authorId: uuid("author_id").references(() => authors.id, {
    onDelete: "set null",
  }),
  publishedDate: timestamp("published_date", {
    withTimezone: true,
  }).defaultNow(),
  readTime: integer("read_time"),
  category: categoryEnum("category").notNull(),
  tags: text("tags").array(),
  featured: boolean("featured").default(false),
  imageUrl: text("image_url"),
  published: boolean("published").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  longDescription: text("long_description"),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  eventTime: varchar("event_time", { length: 50 }),
  location: varchar("location", { length: 255 }),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  registrationUrl: text("registration_url"),
  imageUrl: text("image_url"),
  eventType: eventTypeEnum("event_type").notNull(),
  difficulty: difficultyEnum("difficulty"),
  topics: text("topics").array(),
  speakerId: uuid("speaker_id").references(() => speakers.id, {
    onDelete: "set null",
  }),
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Event registrations table
export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  registrationDate: timestamp("registration_date", {
    withTimezone: true,
  }).defaultNow(),
  attendanceStatus:
    attendanceStatusEnum("attendance_status").default("registered"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Contact submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  newsletterSignup: boolean("newsletter_signup").default(false),
  status: submissionStatusEnum("status").default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertAuthorSchema = createInsertSchema(authors);
export const selectAuthorSchema = createSelectSchema(authors);
export const insertSpeakerSchema = createInsertSchema(speakers);
export const selectSpeakerSchema = createSelectSchema(speakers);
export const insertBlogPostSchema = createInsertSchema(blogPosts);
export const selectBlogPostSchema = createSelectSchema(blogPosts);
export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);
export const insertEventRegistrationSchema =
  createInsertSchema(eventRegistrations);
export const selectEventRegistrationSchema =
  createSelectSchema(eventRegistrations);
export const insertContactSubmissionSchema =
  createInsertSchema(contactSubmissions);
export const selectContactSubmissionSchema =
  createSelectSchema(contactSubmissions);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type Speaker = typeof speakers.$inferSelect;
export type NewSpeaker = typeof speakers.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type NewEventRegistration = typeof eventRegistrations.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
```

#### **2.3 Database Connection**

```typescript
// lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "../env";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export type Database = typeof db;
```

#### **2.4 Migration Scripts**

```bash
# Generate migration
npx drizzle-kit generate:pg

# Run migration
npx drizzle-kit push:pg
```

### **Step 3: Data Migration**

#### **3.1 Migration Script**

```typescript
// scripts/migrate-data.ts
import { db } from "../lib/db";
import { authors, speakers, blogPosts, events } from "../lib/db/schema";
import { blogContent } from "../lib/blog-content";
import {
  events as eventsData,
  speakers as speakersData,
} from "../lib/events-data";

async function migrateData() {
  console.log("Starting data migration...");

  try {
    // Migrate authors
    console.log("Migrating authors...");
    const authorPromises = blogContent.posts.map(async (post) => {
      if (post.authorDetails) {
        return await db
          .insert(authors)
          .values({
            name: post.authorDetails.name,
            title: post.authorDetails.title,
            bio: post.authorDetails.bio,
            avatarUrl: post.authorDetails.avatar,
            linkedinUrl: post.authorDetails.social?.linkedin,
            twitterUrl: post.authorDetails.social?.twitter,
            githubUrl: post.authorDetails.social?.github,
          })
          .onConflictDoNothing();
      }
    });
    await Promise.all(authorPromises.filter(Boolean));

    // Migrate speakers
    console.log("Migrating speakers...");
    const speakerPromises = speakersData.map(async (speaker) => {
      return await db
        .insert(speakers)
        .values({
          name: speaker.name,
          title: speaker.title,
          company: speaker.company,
          bio: speaker.bio,
          expertise: speaker.expertise,
          imageUrl: speaker.image,
          linkedinUrl: speaker.social.linkedin,
          twitterUrl: speaker.social.twitter,
          githubUrl: speaker.social.github,
        })
        .onConflictDoNothing();
    });
    await Promise.all(speakerPromises);

    // Get inserted authors and speakers for references
    const insertedAuthors = await db.select().from(authors);
    const insertedSpeakers = await db.select().from(speakers);

    // Migrate blog posts
    console.log("Migrating blog posts...");
    const blogPromises = blogContent.posts.map(async (post) => {
      const author = insertedAuthors.find((a) => a.name === post.author);
      return await db
        .insert(blogPosts)
        .values({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          authorId: author?.id,
          publishedDate: new Date(post.date),
          readTime: parseInt(post.readTime.replace(" min read", "")),
          category: post.category as any,
          tags: post.tags,
          featured: post.featured || false,
          imageUrl: typeof post.image === "string" ? post.image : undefined,
          published: true,
        })
        .onConflictDoNothing();
    });
    await Promise.all(blogPromises);

    // Migrate events
    console.log("Migrating events...");
    const eventPromises = eventsData.map(async (event) => {
      const speaker = insertedSpeakers.find((s) => s.name === event.speaker);
      return await db
        .insert(events)
        .values({
          title: event.title,
          slug: event.slug,
          description: event.description,
          longDescription: event.longDescription,
          eventDate: new Date(event.date),
          eventTime: event.time,
          location: event.location,
          maxAttendees: event.maxAttendees,
          currentAttendees: event.attendees,
          registrationUrl: event.registrationUrl,
          imageUrl: typeof event.image === "string" ? event.image : undefined,
          eventType: event.eventType as any,
          difficulty: event.difficulty as any,
          topics: event.topics,
          speakerId: speaker?.id,
          featured: event.featured || false,
          published: true,
        })
        .onConflictDoNothing();
    });
    await Promise.all(eventPromises);

    console.log("Data migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration
migrateData().catch(console.error);
```

```json
// package.json - Add script
{
  "scripts": {
    "db:migrate": "tsx scripts/migrate-data.ts",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg"
  }
}
```

### **Step 4: API Layer**

#### **4.1 Database Services**

```typescript
// lib/db/services/blog.service.ts
import { db } from "../index";
import { blogPosts, authors } from "../schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import type { BlogPost } from "../schema";

export class BlogService {
  static async getAllPosts(filters?: {
    category?: string;
    published?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const query = db
      .select({
        post: blogPosts,
        author: authors,
      })
      .from(blogPosts)
      .leftJoin(authors, eq(blogPosts.authorId, authors.id))
      .orderBy(desc(blogPosts.publishedDate));

    if (filters?.category && filters.category !== "All") {
      query.where(
        and(
          eq(blogPosts.category, filters.category as any),
          eq(blogPosts.published, filters?.published ?? true)
        )
      );
    } else if (filters?.published !== undefined) {
      query.where(eq(blogPosts.published, filters.published));
    }

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    return await query;
  }

  static async getPostBySlug(slug: string) {
    const result = await db
      .select({
        post: blogPosts,
        author: authors,
      })
      .from(blogPosts)
      .leftJoin(authors, eq(blogPosts.authorId, authors.id))
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
      .limit(1);

    return result[0] || null;
  }

  static async incrementViewCount(slug: string) {
    return await db
      .update(blogPosts)
      .set({
        viewCount: sql`${blogPosts.viewCount} + 1`,
      })
      .where(eq(blogPosts.slug, slug));
  }

  static async getFeaturedPosts(limit = 3) {
    return await db
      .select({
        post: blogPosts,
        author: authors,
      })
      .from(blogPosts)
      .leftJoin(authors, eq(blogPosts.authorId, authors.id))
      .where(and(eq(blogPosts.featured, true), eq(blogPosts.published, true)))
      .orderBy(desc(blogPosts.publishedDate))
      .limit(limit);
  }

  static async searchPosts(searchTerm: string, limit = 10) {
    return await db
      .select({
        post: blogPosts,
        author: authors,
      })
      .from(blogPosts)
      .leftJoin(authors, eq(blogPosts.authorId, authors.id))
      .where(
        and(
          or(
            ilike(blogPosts.title, `%${searchTerm}%`),
            ilike(blogPosts.excerpt, `%${searchTerm}%`),
            ilike(blogPosts.content, `%${searchTerm}%`)
          ),
          eq(blogPosts.published, true)
        )
      )
      .orderBy(desc(blogPosts.publishedDate))
      .limit(limit);
  }
}
```

```typescript
// lib/db/services/events.service.ts
import { db } from "../index";
import { events, speakers, eventRegistrations, users } from "../schema";
import { eq, desc, and, gte, lt, sql } from "drizzle-orm";
import type { Event, EventRegistration } from "../schema";

export class EventsService {
  static async getAllEvents(filters?: {
    eventType?: string;
    upcoming?: boolean;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = db
      .select({
        event: events,
        speaker: speakers,
      })
      .from(events)
      .leftJoin(speakers, eq(events.speakerId, speakers.id))
      .where(eq(events.published, true))
      .orderBy(desc(events.eventDate));

    if (filters?.upcoming !== undefined) {
      const now = new Date();
      if (filters.upcoming) {
        query = query.where(
          and(eq(events.published, true), gte(events.eventDate, now))
        );
      } else {
        query = query.where(
          and(eq(events.published, true), lt(events.eventDate, now))
        );
      }
    }

    if (filters?.eventType && filters.eventType !== "all") {
      query = query.where(
        and(
          eq(events.published, true),
          eq(events.eventType, filters.eventType as any)
        )
      );
    }

    if (filters?.featured) {
      query = query.where(
        and(eq(events.published, true), eq(events.featured, true))
      );
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  static async getEventBySlug(slug: string) {
    const result = await db
      .select({
        event: events,
        speaker: speakers,
      })
      .from(events)
      .leftJoin(speakers, eq(events.speakerId, speakers.id))
      .where(and(eq(events.slug, slug), eq(events.published, true)))
      .limit(1);

    return result[0] || null;
  }

  static async registerForEvent(
    eventId: string,
    userId: string,
    notes?: string
  ) {
    // Check if user is already registered
    const existingRegistration = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId)
        )
      )
      .limit(1);

    if (existingRegistration.length > 0) {
      throw new Error("User already registered for this event");
    }

    // Check if event has capacity
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      throw new Error("Event not found");
    }

    if (
      event[0].maxAttendees &&
      event[0].currentAttendees >= event[0].maxAttendees
    ) {
      throw new Error("Event is full");
    }

    // Register user and increment current attendees
    return await db.transaction(async (tx) => {
      await tx.insert(eventRegistrations).values({
        eventId,
        userId,
        notes,
      });

      await tx
        .update(events)
        .set({
          currentAttendees: sql`${events.currentAttendees} + 1`,
        })
        .where(eq(events.id, eventId));
    });
  }

  static async cancelRegistration(eventId: string, userId: string) {
    return await db.transaction(async (tx) => {
      const result = await tx
        .delete(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, eventId),
            eq(eventRegistrations.userId, userId)
          )
        );

      if (result.rowCount > 0) {
        await tx
          .update(events)
          .set({
            currentAttendees: sql`${events.currentAttendees} - 1`,
          })
          .where(eq(events.id, eventId));
      }

      return result;
    });
  }

  static async getUserRegistrations(userId: string) {
    return await db
      .select({
        registration: eventRegistrations,
        event: events,
        speaker: speakers,
      })
      .from(eventRegistrations)
      .innerJoin(events, eq(eventRegistrations.eventId, events.id))
      .leftJoin(speakers, eq(events.speakerId, speakers.id))
      .where(eq(eventRegistrations.userId, userId))
      .orderBy(desc(events.eventDate));
  }
}
```

#### **4.2 API Routes**

```typescript
// app/api/blog/route.ts
import { NextRequest } from "next/server";
import { BlogService } from "@/lib/db/services/blog.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : undefined;
    const search = searchParams.get("search");

    let posts;

    if (search) {
      posts = await BlogService.searchPosts(search, limit);
    } else {
      posts = await BlogService.getAllPosts({
        category: category || undefined,
        published: true,
        limit,
        offset,
      });
    }

    return Response.json({
      posts: posts.map(({ post, author }) => ({
        ...post,
        authorDetails: author,
      })),
      total: posts.length,
    });
  } catch (error) {
    console.error("Blog API error:", error);
    return Response.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/blog/[slug]/route.ts
import { NextRequest } from "next/server";
import { BlogService } from "@/lib/db/services/blog.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const result = await BlogService.getPostBySlug(slug);

    if (!result) {
      return Response.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Increment view count
    await BlogService.incrementViewCount(slug);

    return Response.json({
      post: result.post,
      author: result.author,
    });
  } catch (error) {
    console.error("Blog post API error:", error);
    return Response.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/events/route.ts
import { NextRequest } from "next/server";
import { EventsService } from "@/lib/db/services/events.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get("eventType");
    const upcoming = searchParams.get("upcoming") === "true";
    const featured = searchParams.get("featured") === "true";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : undefined;

    const events = await EventsService.getAllEvents({
      eventType: eventType || undefined,
      upcoming: upcoming || undefined,
      featured: featured || undefined,
      limit,
      offset,
    });

    return Response.json({
      events: events.map(({ event, speaker }) => ({
        ...event,
        speakerDetails: speaker,
      })),
      total: events.length,
    });
  } catch (error) {
    console.error("Events API error:", error);
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
```

```typescript
// app/api/events/register/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventsService } from "@/lib/db/services/events.service";
import { z } from "zod";

const registerSchema = z.object({
  eventId: z.string().uuid(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, notes } = registerSchema.parse(body);

    await EventsService.registerForEvent(eventId, session.user.id, notes);

    return Response.json({
      message: "Successfully registered for event",
    });
  } catch (error) {
    console.error("Event registration error:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return Response.json({ error: "Event ID is required" }, { status: 400 });
    }

    await EventsService.cancelRegistration(eventId, session.user.id);

    return Response.json({
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Event cancellation error:", error);
    return Response.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}
```

### **Step 5: Authentication Setup**

#### **5.1 NextAuth Configuration**

```typescript
// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // Get user role from database
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email!))
          .limit(1);

        if (dbUser.length > 0) {
          session.user.id = dbUser[0].id;
          session.user.role = dbUser[0].role;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
};
```

#### **5.2 Auth API Route**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

#### **5.3 Auth Components**

```typescript
// components/auth/SignInButton.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";

export default function SignInButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" disabled>
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session.user?.image || ""}
                alt={session.user?.name || ""}
              />
              <AvatarFallback>
                {session.user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">
              {session.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          {session.user?.role === "admin" && (
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Admin Dashboard
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={() => signIn()} variant="default">
      Sign In
    </Button>
  );
}
```

### **Step 6: Component Updates**

#### **6.1 Updated Events Component**

```typescript
// components/Events.tsx (Server Component)
import EventsClient from "./EventsClient";
import { EventsService } from "@/lib/db/services/events.service";
import { unstable_cache } from "next/cache";

// Cache events data for 5 minutes
const getCachedEvents = unstable_cache(
  async () => {
    const upcomingEvents = await EventsService.getAllEvents({
      upcoming: true,
      limit: 50,
    });
    const pastEvents = await EventsService.getAllEvents({
      upcoming: false,
      limit: 50,
    });

    return {
      upcomingEvents: upcomingEvents.map(({ event, speaker }) => ({
        ...event,
        speakerDetails: speaker,
      })),
      pastEvents: pastEvents.map(({ event, speaker }) => ({
        ...event,
        speakerDetails: speaker,
      })),
    };
  },
  ["events-data"],
  { revalidate: 300 } // 5 minutes
);

export default async function Events() {
  const { upcomingEvents, pastEvents } = await getCachedEvents();

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Events</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join our regular meetups, workshops, and conferences. Connect with
            fellow developers, learn from industry experts, and grow your
            cloud-native skills.
          </p>
        </header>

        <EventsClient upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
      </div>
    </section>
  );
}
```

#### **6.2 Updated EventsClient Component**

```typescript
// components/EventsClient.tsx
"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EventCard from "./EventCard";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  eventType: string;
  difficulty: string;
  topics: string[];
  speakerDetails?: {
    name: string;
    title: string;
    company: string;
  };
  registrationUrl?: string;
  imageUrl?: string;
}

interface EventsClientProps {
  upcomingEvents: Event[];
  pastEvents: Event[];
}

export default function EventsClient({
  upcomingEvents,
  pastEvents,
}: EventsClientProps) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filterType, setFilterType] = useState<string>("all");
  const [registering, setRegistering] = useState<string | null>(null);
  const { data: session } = useSession();

  const eventTypes = useMemo(() => {
    const allEvents = [...upcomingEvents, ...pastEvents];
    return [...new Set(allEvents.map((event) => event.eventType))];
  }, [upcomingEvents, pastEvents]);

  const filteredUpcomingEvents = useMemo(() => {
    if (filterType === "all") return upcomingEvents;
    return upcomingEvents.filter((event) => event.eventType === filterType);
  }, [upcomingEvents, filterType]);

  const filteredPastEvents = useMemo(() => {
    if (filterType === "all") return pastEvents;
    return pastEvents.filter((event) => event.eventType === filterType);
  }, [pastEvents, filterType]);

  const handleEventRegistration = async (eventId: string) => {
    if (!session) {
      toast.error("Please sign in to register for events");
      return;
    }

    setRegistering(eventId);

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      toast.success("Successfully registered for the event!");
      // Optionally refresh the page or update local state
      window.location.reload();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setRegistering(null);
    }
  };

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          onClick={() => setFilterType("all")}
          className="transition-all duration-200"
        >
          All Events
        </Button>
        {eventTypes.map((type) => (
          <Button
            key={type}
            variant={filterType === type ? "default" : "outline"}
            onClick={() => setFilterType(type)}
            className="transition-all duration-200 capitalize"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Events Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">
            Upcoming Events ({filteredUpcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Events ({filteredPastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {filteredUpcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUpcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={handleEventRegistration}
                  isRegistering={registering === event.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No upcoming events found for the selected filter.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {filteredPastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPastEvent={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No past events found for the selected filter.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
```

### **Step 7: Admin Dashboard**

#### **7.1 Admin Layout**

```typescript
// app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
```

#### **7.2 Admin Dashboard Components**

```typescript
// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground">CNSL Admin</h2>
      </div>

      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          onClick={() => signOut()}
          className="w-full justify-start"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
```

### **Step 8: Performance Optimization**

#### **8.1 Caching Strategy**

```typescript
// lib/cache.ts
import { unstable_cache } from "next/cache";
import { BlogService } from "./db/services/blog.service";
import { EventsService } from "./db/services/events.service";

// Blog post caching
export const getCachedBlogPosts = unstable_cache(
  async (filters?: { category?: string; limit?: number; offset?: number }) => {
    return await BlogService.getAllPosts(filters);
  },
  ["blog-posts"],
  { revalidate: 300, tags: ["blog"] }
);

export const getCachedBlogPost = unstable_cache(
  async (slug: string) => {
    return await BlogService.getPostBySlug(slug);
  },
  ["blog-post"],
  { revalidate: 3600, tags: ["blog"] }
);

// Events caching
export const getCachedEvents = unstable_cache(
  async (filters?: {
    upcoming?: boolean;
    eventType?: string;
    limit?: number;
  }) => {
    return await EventsService.getAllEvents(filters);
  },
  ["events"],
  { revalidate: 300, tags: ["events"] }
);

export const getCachedEvent = unstable_cache(
  async (slug: string) => {
    return await EventsService.getEventBySlug(slug);
  },
  ["event"],
  { revalidate: 3600, tags: ["events"] }
);

// Featured content caching
export const getCachedFeaturedContent = unstable_cache(
  async () => {
    const [featuredPosts, featuredEvents] = await Promise.all([
      BlogService.getFeaturedPosts(3),
      EventsService.getAllEvents({ featured: true, limit: 3 }),
    ]);

    return {
      featuredPosts: featuredPosts.map(({ post, author }) => ({
        ...post,
        authorDetails: author,
      })),
      featuredEvents: featuredEvents.map(({ event, speaker }) => ({
        ...event,
        speakerDetails: speaker,
      })),
    };
  },
  ["featured-content"],
  { revalidate: 600, tags: ["blog", "events"] }
);
```

#### **8.2 Database Connection Pooling**

```typescript
// lib/db/index.ts (Updated)
import { drizzle } from "drizzle-orm/neon-http";
import { neon, Pool } from "@neondatabase/serverless";
import { env } from "../env";
import * as schema from "./schema";

// Connection pooling for better performance
const pool = new Pool({ connectionString: env.DATABASE_URL });
const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
export const pooledDb = drizzle(pool, { schema });

// Use pooled connection for high-frequency operations
export const getDb = (usePool = false) => (usePool ? pooledDb : db);
```

### **Step 9: Testing Strategy**

#### **9.1 Database Testing**

```typescript
// __tests__/lib/db/services/blog.service.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "@/lib/db";
import { blogPosts, authors } from "@/lib/db/schema";
import { BlogService } from "@/lib/db/services/blog.service";
import { eq } from "drizzle-orm";

describe("BlogService", () => {
  let testAuthorId: string;
  let testPostId: string;

  beforeEach(async () => {
    // Create test author
    const [author] = await db
      .insert(authors)
      .values({
        name: "Test Author",
        title: "Test Title",
        bio: "Test bio",
      })
      .returning();
    testAuthorId = author.id;

    // Create test post
    const [post] = await db
      .insert(blogPosts)
      .values({
        title: "Test Post",
        slug: "test-post",
        content: "Test content",
        authorId: testAuthorId,
        category: "Tutorials",
        published: true,
      })
      .returning();
    testPostId = post.id;
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(blogPosts).where(eq(blogPosts.id, testPostId));
    await db.delete(authors).where(eq(authors.id, testAuthorId));
  });

  it("should get all published posts", async () => {
    const posts = await BlogService.getAllPosts({ published: true });
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].post.published).toBe(true);
  });

  it("should get post by slug", async () => {
    const result = await BlogService.getPostBySlug("test-post");
    expect(result).toBeTruthy();
    expect(result?.post.title).toBe("Test Post");
  });

  it("should increment view count", async () => {
    await BlogService.incrementViewCount("test-post");
    const result = await BlogService.getPostBySlug("test-post");
    expect(result?.post.viewCount).toBe(1);
  });
});
```

#### **9.2 API Testing**

```typescript
// __tests__/app/api/blog/route.test.ts
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/blog/route";
import { NextRequest } from "next/server";

describe("/api/blog", () => {
  it("should return blog posts", async () => {
    const request = new NextRequest("http://localhost:3000/api/blog");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.posts).toBeDefined();
    expect(Array.isArray(data.posts)).toBe(true);
  });

  it("should filter posts by category", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/blog?category=Tutorials"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.posts.every((post: any) => post.category === "Tutorials")).toBe(
      true
    );
  });
});
```

### **Step 10: Deployment & Production Setup**

#### **10.1 Production Environment Variables**

```bash
# .env.production
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/cnsl-db?sslmode=require"
NEXTAUTH_SECRET="production-secret-here"
NEXTAUTH_URL="https://cloudnativesl.com"

# OAuth providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="contact@cloudnativesl.com"
SMTP_PASSWORD="your-app-password"

# File uploads
CLOUDINARY_CLOUD_NAME="cnsl-uploads"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### **10.2 Production Build Configuration**

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol:// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        },
        {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        },
        },
        ],
        },
```
