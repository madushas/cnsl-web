import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'
import EventRSVPsTabs from '@/components/admin/event-rsvps-tabs'
// import EventRSVPsClient from '@/components/admin/event-rsvps-client' // OLD - archived

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const [event] = await db
    .select({ id: schema.events.id, title: schema.events.title, capacity: schema.events.capacity })
    .from(schema.events)
    .where(eq(schema.events.slug, slug))
    .limit(1)

  if (!event) {
    return (
      <div className="px-4 lg:px-6">
        <div className="text-sm text-red-400">Event not found</div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <EventRSVPsTabs slug={slug} capacity={event.capacity ?? 0} title={event.title} />
    </div>
  )
}
