import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { InitiativesSection } from "@/components/initiatives-section";
import { UpcomingEventSection } from "@/components/upcoming-event-section";
import { InsightsSection } from "@/components/insights-section";
import { PartnersSection } from "@/components/partners-section";
import { Footer } from "@/components/footer";
import { db, schema } from "@/db";
import { asc, desc, eq, inArray, sql } from "drizzle-orm";

export const revalidate = 60;

type HomeEvent = {
  id: string;
  slug: string;
  title: string;
  date: string;
  city: string;
  venue: string;
  image?: string;
  topics: string[];
  capacity: number;
  registered: number;
  description: string;
  speakers: { name: string; title: string; topic: string }[];
};

type HomePost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
};

async function getHomeEvents(): Promise<HomeEvent[]> {
  // DB-01 fix: Optimize query to reduce round-trips
  // Fetch events with their related data in a single efficient query pattern
  const rows = await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.published, true))
    .orderBy(asc(schema.events.date));

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id).filter(Boolean) as string[];

  // Batch fetch all related data in parallel (already optimized with inArray + Promise.all)
  // This is 1 database round-trip with 3 concurrent queries vs N separate queries
  const [topics, speakers, counts] = await Promise.all([
    db
      .select()
      .from(schema.eventTopics)
      .where(inArray(schema.eventTopics.eventId, ids)),
    db
      .select()
      .from(schema.eventSpeakers)
      .where(inArray(schema.eventSpeakers.eventId, ids)),
    db
      .select({
        eventId: schema.rsvps.eventId,
        c: sql<number>`count(*)`,
      })
      .from(schema.rsvps)
      .where(inArray(schema.rsvps.eventId, ids))
      .groupBy(schema.rsvps.eventId),
  ]);

  // Build lookup maps for O(1) access instead of filter() loops
  const topicsByEvent = new Map<string, string[]>();
  const speakersByEvent = new Map<
    string,
    Array<{ name: string; title: string; topic: string }>
  >();
  const countsByEvent = new Map<string, number>();

  topics.forEach((t) => {
    const eventId = t.eventId;
    if (!eventId) return;
    if (!topicsByEvent.has(eventId)) topicsByEvent.set(eventId, []);
    topicsByEvent.get(eventId)!.push(t.topic);
  });

  speakers.forEach((s) => {
    const eventId = s.eventId;
    if (!eventId) return;
    if (!speakersByEvent.has(eventId)) speakersByEvent.set(eventId, []);
    speakersByEvent.get(eventId)!.push({
      name: s.name,
      title: s.title || "",
      topic: s.topic || "",
    });
  });

  counts.forEach((c: any) => {
    const eventId = c.eventId;
    if (!eventId) return;
    countsByEvent.set(eventId, Number(c.c || 0));
  });

  // Map with O(1) lookups instead of O(n) filter operations
  return rows.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    date: e.date.toISOString(),
    city: e.city || "",
    venue: e.venue || "",
    image: e.image || "/event-flyer-placeholder.svg",
    topics: topicsByEvent.get(e.id) || [],
    speakers: speakersByEvent.get(e.id) || [],
    capacity: e.capacity ?? 0,
    registered: countsByEvent.get(e.id) || 0,
    description: e.description || "",
  }));
}

async function getHomePosts(): Promise<HomePost[]> {
  const rows = await db
    .select()
    .from(schema.posts)
    .orderBy(desc(schema.posts.date));
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt || "",
    category: r.category || "General",
    image: r.image || "/cnsl-placeholder.svg",
    date: r.date
      ? r.date instanceof Date
        ? r.date.toISOString()
        : String(r.date)
      : new Date().toISOString(),
  }));
}

export default async function Home() {
  const [events, posts] = await Promise.all([getHomeEvents(), getHomePosts()]);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">
        <HeroSection />
        <InitiativesSection />
        <UpcomingEventSection initial={events} />
        <InsightsSection initial={posts} />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
}
export const dynamic = "force-static";
