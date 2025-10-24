import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { db, schema } from "@/db"
import { and, asc, eq, inArray, sql } from "drizzle-orm"
import { EventsModernLayout } from "@/components/events-modern-layout"
import type { Metadata } from "next"

export const revalidate = 60 // ISR: revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'Events | CNSL',
  description: 'Discover upcoming community meetups and special events by Cloud Native Sri Lanka.',
  alternates: { canonical: '/events' },
}

type EventItem = {
  id: string
  slug: string
  title: string
  date: string
  city: string | null
  venue: string | null
  image?: string | null
  gallery?: string[]
  topics: string[]
  capacity: number
  registered: number
  description: string | null
  speakers: { name: string; title: string | null; topic: string | null }[]
}

async function getEvents(): Promise<EventItem[]> {
  const rows = await db.select().from(schema.events)
    .where(and(eq(schema.events.published, true), sql`${schema.events.deletedAt} IS NULL`))
    .orderBy(asc(schema.events.date))
  
  const ids = rows.map(r => r.id).filter(Boolean) as string[]
  if (ids.length === 0) return []
  
  const [topics, speakers, counts] = await Promise.all([
    db.select().from(schema.eventTopics).where(inArray(schema.eventTopics.eventId, ids)),
    db.select().from(schema.eventSpeakers).where(inArray(schema.eventSpeakers.eventId, ids)),
    db.select({ eventId: schema.rsvps.eventId, c: sql<number>`count(*)` })
      .from(schema.rsvps)
      .where(inArray(schema.rsvps.eventId, ids))
      .groupBy(schema.rsvps.eventId),
  ])
  
  return rows.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    date: e.date.toISOString(),
    city: e.city,
    venue: e.venue,
    image: e.image,
    description: e.description,
    capacity: e.capacity ?? 0,
    topics: topics.filter(t => t.eventId === e.id).map(t => t.topic),
    speakers: speakers.filter(s => s.eventId === e.id).map(s => ({ name: s.name, title: s.title, topic: s.topic })),
    registered: Number((counts.find((x: any) => x.eventId === e.id)?.c) ?? 0),
  }))
}

export default async function EventsPage() {
  const data = await getEvents()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Events</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Join us for community meetups, workshops, and tech talks. Connect with fellow developers and learn from industry experts.
          </p>
        </div>
        
        <EventsModernLayout events={data} />
      </main>
      <Footer />
    </div>
  )
}
