import { SummaryCards } from "@/components/admin/summary-cards";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { QuickActionsWidget } from "@/components/admin/quick-actions-widget";
import { PendingActionsWidget } from "@/components/admin/pending-actions-widget";
import { db, schema } from "@/db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAnalytics() {
  const [{ count: eventsTotal }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events);

  const [{ count: upcomingEvents }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(sql`${schema.events.date} >= now()`);

  const [{ count: rsvpsTotal }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.rsvps);

  const [{ count: pendingRsvps }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.rsvps)
    .where(sql`${schema.rsvps.status} = 'pending'`);

  const [{ count: approvedRsvps }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.rsvps)
    .where(sql`${schema.rsvps.status} IN ('approved','invited')`);

  const [{ count: draftPosts }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.posts)
    .where(sql`${schema.posts.published} = false`);

  // Trends
  const [
    [{ count: eventsCreatedCur }],
    [{ count: eventsCreatedPrev }],
    [{ count: upcomingCur }],
    [{ count: upcomingPrev }],
    [{ count: rsvpsCur }],
    [{ count: rsvpsPrev }],
    [{ count: pendingCur }],
    [{ count: pendingPrev }],
  ] = await Promise.all([
    // Events created last 30d vs previous 30d
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.events)
      .where(sql`${schema.events.createdAt} >= now() - interval '30 days'`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.events)
      .where(
        sql`${schema.events.createdAt} < now() - interval '30 days' AND ${schema.events.createdAt} >= now() - interval '60 days'`,
      ),

    // Upcoming next 30d vs past 30d
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.events)
      .where(
        sql`${schema.events.date} >= now() AND ${schema.events.date} < now() + interval '30 days'`,
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.events)
      .where(
        sql`${schema.events.date} < now() AND ${schema.events.date} >= now() - interval '30 days'`,
      ),

    // RSVPs last 30d vs previous 30d
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.rsvps)
      .where(sql`${schema.rsvps.createdAt} >= now() - interval '30 days'`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.rsvps)
      .where(
        sql`${schema.rsvps.createdAt} < now() - interval '30 days' AND ${schema.rsvps.createdAt} >= now() - interval '60 days'`,
      ),

    // Pending created last 30d vs previous 30d
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.rsvps)
      .where(
        sql`${schema.rsvps.status} = 'pending' AND ${schema.rsvps.createdAt} >= now() - interval '30 days'`,
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.rsvps)
      .where(
        sql`${schema.rsvps.status} = 'pending' AND ${schema.rsvps.createdAt} < now() - interval '30 days' AND ${schema.rsvps.createdAt} >= now() - interval '60 days'`,
      ),
  ]);

  function pct(cur: any, prev: any): string {
    const c = Number(cur) || 0;
    const p = Number(prev) || 0;
    if (p === 0 && c === 0) return "+0%";
    if (p === 0) return "+100%";
    const v = Math.round(((c - p) / p) * 100);
    return `${v >= 0 ? "+" : ""}${v}%`;
  }

  const series = await db
    .select({
      date: sql<string>`(date_trunc('day', ${schema.rsvps.createdAt})::date)::text`,
      count: sql<number>`count(*)`,
    })
    .from(schema.rsvps)
    .where(sql`${schema.rsvps.createdAt} >= now() - interval '30 days'`)
    .groupBy(sql`date_trunc('day', ${schema.rsvps.createdAt})`)
    .orderBy(sql`date_trunc('day', ${schema.rsvps.createdAt})`);

  const topEvents = await db
    .select({
      slug: schema.events.slug,
      title: schema.events.title,
      count: sql<number>`count(*)`,
    })
    .from(schema.rsvps)
    .innerJoin(
      schema.events,
      sql`${schema.events.id} = ${schema.rsvps.eventId}`,
    )
    .where(sql`${schema.rsvps.createdAt} >= now() - interval '30 days'`)
    .groupBy(schema.events.slug, schema.events.title)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  return {
    summary: {
      eventsTotal: Number(eventsTotal) || 0,
      upcomingEvents: Number(upcomingEvents) || 0,
      rsvpsTotal: Number(rsvpsTotal) || 0,
      pendingRsvps: Number(pendingRsvps) || 0,
      approvedRsvps: Number(approvedRsvps) || 0,
      eventsTrend: pct(eventsCreatedCur, eventsCreatedPrev),
      upcomingTrend: pct(upcomingCur, upcomingPrev),
      rsvpsTrend: pct(rsvpsCur, rsvpsPrev),
      pendingTrend: pct(pendingCur, pendingPrev),
    },
    pendingActions: {
      pendingRsvps: Number(pendingRsvps) || 0,
      upcomingEvents: Number(upcomingCur) || 0,
      draftPosts: Number(draftPosts) || 0,
    },
    series,
    topEvents,
  };
}

export default async function AdminDashboardPage() {
  // Server-side guard: ensure only admins can access
  await requireAdmin();
  const data = await getAnalytics();

  return (
    <div className="px-4 lg:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your community metrics and activity
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={data.summary} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardCharts
            data={{ series: data.series, topEvents: data.topEvents }}
          />
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <PendingActionsWidget stats={data.pendingActions} />
          <QuickActionsWidget />
        </div>
      </div>
    </div>
  );
}
