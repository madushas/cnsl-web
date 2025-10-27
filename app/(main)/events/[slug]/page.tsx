import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { db, schema } from "@/db";
import { and, eq, not, inArray, sql, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EventDetailClient } from "@/components/event-detail-client";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";

export const revalidate = 60; // ISR: revalidate every 60 seconds

type EventDetail = {
  id: string;
  slug: string;
  title: string;
  date: string;
  city: string | null;
  venue: string | null;
  image?: string | null;
  capacity: number;
  registered: number;
  description: string | null;
  topics: string[];
  speakers: { name: string; title: string | null; topic: string | null }[];
};

async function getEvent(slug: string): Promise<EventDetail | null> {
  const [event] = await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.slug, slug))
    .limit(1);

  if (!event) return null;

  const topics = await db
    .select()
    .from(schema.eventTopics)
    .where(eq(schema.eventTopics.eventId, event.id));
  const speakers = await db
    .select()
    .from(schema.eventSpeakers)
    .where(eq(schema.eventSpeakers.eventId, event.id));

  // Count only active registrations (exclude declined/cancelled)
  const [countRow] = await db
    .select({ c: sql<number>`count(*)` })
    .from(schema.rsvps)
    .where(
      and(
        eq(schema.rsvps.eventId, event.id),
        not(inArray(schema.rsvps.status, ["declined", "cancelled"])),
      ),
    );

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    date: event.date.toISOString(),
    city: event.city,
    venue: event.venue,
    image: event.image,
    capacity: event.capacity ?? 0,
    description: event.description,
    topics: topics.map((t) => t.topic),
    speakers: speakers.map((s) => ({
      name: s.name,
      title: s.title,
      topic: s.topic,
    })),
    registered: Number(countRow?.c || 0),
  };
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
  _parent?: any,
): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await getEvent(slug);

  if (!event) {
    return {
      title: "Event Not Found | CNSL",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const imgUrl = event.image
    ? event.image.startsWith("http://") || event.image.startsWith("https://")
      ? event.image
      : `${siteUrl}${event.image}`
    : undefined;

  return {
    title: `${event.title} | CNSL Events`,
    description:
      event.description ||
      `Join us for ${event.title} at ${event.venue}, ${event.city}`,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.description || `Join us for ${event.title}`,
      images: imgUrl ? [{ url: imgUrl, width: 1200, height: 630 }] : [],
      type: "website",
      url: `${siteUrl}/events/${event.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description || `Join us for ${event.title}`,
      images: imgUrl ? [imgUrl] : [],
    },
  };
}

export default async function EventDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  // CSR-03 fix: Fetch user data server-side to avoid client API calls
  const user = await getSessionUser();

  // Fetch profile completion status if user is logged in
  let initialProfile = null;
  if (user?.id) {
    const [userProfile] = await db
      .select({
        profileCompleted: schema.users.profileCompleted,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.authUserId, String(user.id)))
      .limit(1);

    if (userProfile) {
      initialProfile = {
        isLoggedIn: true,
        profileCompleted: userProfile.profileCompleted ?? false,
        name: userProfile.name || user.name || "",
        email: userProfile.email || user.email || "",
      };
    } else {
      // User exists in auth but not in our DB yet
      initialProfile = {
        isLoggedIn: true,
        profileCompleted: false,
        name: user.name || "",
        email: user.email || "",
      };
    }
  }

  // Check if user already has an RSVP for this event
  let initialMyRsvp = false;
  if (user?.id || user?.email) {
    const existingRsvp = await db
      .select({ id: schema.rsvps.id })
      .from(schema.rsvps)
      .where(
        and(
          eq(schema.rsvps.eventId, event.id),
          or(
            user.id ? eq(schema.rsvps.accountId, String(user.id)) : sql`false`,
            user.email ? eq(schema.rsvps.email, user.email) : sql`false`,
          ),
        ),
      )
      .limit(1);

    initialMyRsvp = existingRsvp.length > 0;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || "",
    startDate: event.date,
    location:
      event.venue && event.city
        ? {
            "@type": "Place",
            name: event.venue,
            address: {
              "@type": "PostalAddress",
              addressLocality: event.city,
            },
          }
        : undefined,
    image: event.image
      ? [
          event.image.startsWith("http://") ||
          event.image.startsWith("https://")
            ? event.image
            : `${siteUrl}${event.image}`,
        ]
      : [],
    organizer: {
      "@type": "Organization",
      name: "Colombo Network for Software and Law (CNSL)",
      url: siteUrl,
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    offers:
      event.capacity > 0
        ? {
            "@type": "Offer",
            price: "0",
            priceCurrency: "LKR",
            availability:
              event.registered >= event.capacity
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            validFrom: new Date().toISOString(),
          }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="container mx-auto px-4 section-spacing-sm">
        <EventDetailClient
          event={event}
          initialProfile={initialProfile}
          initialMyRsvp={initialMyRsvp}
        />
      </main>
      <Footer />
    </div>
  );
}
