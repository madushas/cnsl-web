import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconPencil } from "@tabler/icons-react";
import EventRSVPsTabs from "@/components/admin/event-rsvps-tabs";
// import EventRSVPsClient from '@/components/admin/event-rsvps-client' // OLD - archived

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const [event] = await db
    .select({
      id: schema.events.id,
      title: schema.events.title,
      capacity: schema.events.capacity,
      date: schema.events.date,
      venue: schema.events.venue,
    })
    .from(schema.events)
    .where(eq(schema.events.slug, slug))
    .limit(1);

  if (!event) {
    return (
      <div className="px-4 lg:px-6">
        <div className="text-sm text-red-400">Event not found</div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Contextual Navigation Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/events">
              <IconArrowLeft className="size-4" />
              Back to Events
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-xl font-semibold">{event.title}</h1>
            <p className="text-sm text-muted-foreground">
              Manage RSVPs and attendance
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/events/${slug}/edit`}>
            <IconPencil className="size-4" />
            Edit Event
          </Link>
        </Button>
      </div>

      <EventRSVPsTabs
        slug={slug}
        capacity={event.capacity ?? 0}
        title={event.title}
        date={event.date}
        venue={event.venue || undefined}
      />
    </div>
  );
}
