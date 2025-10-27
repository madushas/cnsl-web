import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { desc, eq, or } from "drizzle-orm";
import Link from "next/link";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { EventCard } from "@/components/dashboard/event-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RsvpRow = {
  id: string;
  event_id: string | null;
  name: string;
  email: string;
  affiliation: string | null;
  status: string;
  created_at: Date | null;
  slug: string;
  title: string;
  date: Date;
  city: string | null;
  venue: string | null;
  ticket_number?: string | null;
  ticketImage?: string | null;
};

async function getMyRsvps(
  userId?: string,
  email?: string | null,
): Promise<RsvpRow[]> {
  if (!userId && !email) return [];
  const rows = await db
    .select({
      id: schema.rsvps.id,
      event_id: schema.rsvps.eventId,
      name: schema.rsvps.name,
      email: schema.rsvps.email,
      affiliation: schema.rsvps.affiliation,
      status: schema.rsvps.status,
      created_at: schema.rsvps.createdAt,
      slug: schema.events.slug,
      title: schema.events.title,
      date: schema.events.date,
      city: schema.events.city,
      venue: schema.events.venue,
      ticket_number: schema.rsvps.ticketNumber,
      ticketImage: schema.rsvps.ticketImageUrl,
    })
    .from(schema.rsvps)
    .innerJoin(schema.events, eq(schema.events.id, schema.rsvps.eventId))
    .where(
      or(
        eq(schema.rsvps.accountId, String(userId || "")),
        eq(schema.rsvps.accountEmail, String(email || "")),
        eq(schema.rsvps.email, String(email || "")),
      ),
    )
    .orderBy(desc(schema.rsvps.createdAt));
  return rows as any;
}

export default async function Page() {
  const user = await getSessionUser();
  // Require login for dashboard
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-h2 mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to view your dashboard.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const rsvps = await getMyRsvps(user.id, user.email);
  const now = new Date().getTime();
  const upcoming = rsvps.filter((r) => new Date(r.date).getTime() >= now);
  const past = rsvps.filter((r) => new Date(r.date).getTime() < now);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-h2 mb-2">
              Welcome back, {user.name || user.email}
            </h1>
            <p className="text-muted-foreground">
              Manage your event registrations and tickets
            </p>
          </div>
          <Link href="/account">
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Manage Profile
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="mb-10">
        <StatsOverview
          totalRsvps={rsvps.length}
          upcomingCount={upcoming.length}
          pastCount={past.length}
        />
      </div>

      {/* Upcoming Events Section */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-h3 mb-1">Upcoming Events</h2>
          <p className="text-sm text-muted-foreground">
            Events you've registered for
          </p>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState type="upcoming" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((r) => (
              <EventCard
                key={r.id}
                id={r.id}
                slug={r.slug}
                title={r.title}
                date={r.date}
                city={r.city}
                venue={r.venue}
                status={r.status}
                ticketNumber={r.ticket_number}
                ticketImage={r.ticketImage}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Events Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-h3 mb-1">Past Events</h2>
          <p className="text-sm text-muted-foreground">
            Your event history
          </p>
        </div>
        {past.length === 0 ? (
          <EmptyState type="past" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((r) => (
              <EventCard
                key={r.id}
                id={r.id}
                slug={r.slug}
                title={r.title}
                date={r.date}
                city={r.city}
                venue={r.venue}
                status={r.status}
                ticketNumber={r.ticket_number}
                ticketImage={r.ticketImage}
                isPast
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
