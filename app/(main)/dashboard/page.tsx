import { db, schema } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { desc, eq, or } from "drizzle-orm";
import Link from "next/link";

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
  qr_code?: string | null;
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
      qr_code: schema.rsvps.qrCode,
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
    <div className="container mx-auto px-4 py-10 space-y-8">
      <header>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-h2">Welcome, {user.name || user.email}</h1>
            <p className="text-muted-foreground">
              Here are your upcoming and past RSVPs.
            </p>
          </div>
          <Link
            href="/account"
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-primary-foreground text-sm"
          >
            Manage profile
          </Link>
        </div>
      </header>

      <section>
        <h2 className="text-h3 mb-3">Upcoming RSVPs</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming RSVPs.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((r) => (
              <li key={r.id} className="rounded-md border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleString()} — {r.venue} · {r.city}
                    </div>
                    <div className="mt-1 text-xs">
                      Status: <span className="font-medium">{r.status}</span>
                    </div>
                    {r.ticket_number ? (
                      <div className="mt-2 text-xs">
                        <div className="font-medium">Ticket</div>
                        <div className="text-muted-foreground">
                          #{r.ticket_number}
                        </div>
                        {r.qr_code && (
                          <div className="mt-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.qr_code}
                              alt={`QR for ${r.title}`}
                              className="h-32 w-32 rounded border"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Ticket will appear here when available.
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 sm:self-start">
                    <Link
                      href={`/events/${r.slug}`}
                      className="text-sm text-primary underline"
                    >
                      View event
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-h3 mb-3">Past RSVPs</h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">No past RSVPs.</p>
        ) : (
          <ul className="space-y-3">
            {past.map((r) => (
              <li key={r.id} className="rounded-md border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleString()} — {r.venue} · {r.city}
                    </div>
                    <div className="mt-1 text-xs">
                      Status: <span className="font-medium">{r.status}</span>
                    </div>
                    {r.ticket_number ? (
                      <div className="mt-2 text-xs">
                        <div className="font-medium">Ticket</div>
                        <div className="text-muted-foreground">
                          #{r.ticket_number}
                        </div>
                        {r.qr_code && (
                          <div className="mt-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.qr_code}
                              alt={`QR for ${r.title}`}
                              className="h-32 w-32 rounded border"
                            />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-2 sm:self-start">
                    <Link
                      href={`/events/${r.slug}`}
                      className="text-sm text-primary underline"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
