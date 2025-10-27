import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { EventFormAdvanced } from "@/components/admin/event-form-advanced";

export const revalidate = 0;

type EventRow = typeof schema.events.$inferSelect;

export default async function EditEventPage(props: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await props.params;
  const [event] = (await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.slug, slug))
    .limit(1)) as [EventRow?];
  if (!event)
    return (
      <div className="px-4 lg:px-6">
        <div className="text-sm text-red-400">Event not found</div>
      </div>
    );

  // Load topics & speakers
  const topics = await db
    .select()
    .from(schema.eventTopics)
    .where(eq(schema.eventTopics.eventId, event.id));
  const speakers = await db
    .select()
    .from(schema.eventSpeakers)
    .where(eq(schema.eventSpeakers.eventId, event.id));

  const initial = {
    slug: event.slug,
    title: event.title,
    description: event.description || "",
    date:
      event.date instanceof Date
        ? event.date.toISOString()
        : String(event.date),
    city: event.city || "",
    venue: event.venue || "",
    image: event.image || "",
    capacity: event.capacity ?? 0,
    published: !!event.published,
    topics: topics.map((t) => t.topic),
    speakers: speakers.map((s) => ({
      name: s.name,
      title: s.title || undefined,
      topic: s.topic || undefined,
    })),
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Admin · Edit Event</h1>
      </div>
      <div className="rounded-lg border p-4">
        <EventFormAdvanced mode="edit" initial={initial} />
      </div>
    </div>
  );
}
