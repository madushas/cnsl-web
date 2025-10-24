"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Tag, Share2, Download } from "lucide-react";

/**
 * EventsClientFilter
 *
 * Purpose:
 * - Client-side event listing with improved UX:
 *   - Debounced search
 *   - Load-more pagination
 *   - Sticky sidebar with NextUp highlight
 *   - Share (Web Share API / clipboard fallback)
 *   - Download .ics calendar for events
 *   - Accessibility improvements (semantic elements, aria labels)
 *
 * Notes:
 * - This component expects all event data to be provided from the server.
 * - Filtering is client-side for responsiveness. For very large datasets,
 *   consider moving filters to server side (API + pagination).
 */

type Speaker = { name: string; title?: string | null; topic?: string | null };

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  date: string; // ISO string
  city: string | null;
  venue: string | null;
  image?: string | null;
  gallery?: string[];
  topics: string[];
  capacity: number;
  registered: number;
  description: string | null;
  speakers: Speaker[];
};

function truncate(text: string | null | undefined, max = 160) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}

function useDebounced<T>(value: T, ms = 300) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return deb;
}

function generateICS(e: EventItem) {
  const dtStart = new Date(e.date);
  const dtEnd = new Date(dtStart.getTime() + 1000 * 60 * 60 * 2); // 2 hours default
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const description = (e.description || "").replace(/\r?\n/g, "\\n");
  const location = `${e.venue || ""}${e.city ? ", " + e.city : ""}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CNSL//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@cnsl.lk`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dtStart)}`,
    `DTEND:${fmt(dtEnd)}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function EventsClientFilter({ events }: { events: EventItem[] }) {
  // Filters
  const [city, setCity] = useState<string>("All");
  const [topic, setTopic] = useState<string>("All");
  const [q, setQ] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("upcoming");

  // Debounce search to avoid heavy re-renders
  const debouncedQ = useDebounced(q, 300);
  const [isPending, startTransition] = useTransition();

  // Pagination
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Derived filter options
  const cities = useMemo(
    () => [
      "All",
      ...Array.from(new Set(events.map((x) => x.city || "").filter(Boolean))),
    ],
    [events],
  );
  const topics = useMemo(
    () => ["All", ...Array.from(new Set(events.flatMap((x) => x.topics)))],
    [events],
  );

  // Filtered events
  const filtered = useMemo(() => {
    const out = events
      .filter((e) => (city === "All" ? true : e.city === city))
      .filter((e) => (topic === "All" ? true : e.topics.includes(topic)))
      .filter((e) =>
        debouncedQ.trim() === ""
          ? true
          : [e.title, e.venue, e.description]
              .join(" ")
              .toLowerCase()
              .includes(debouncedQ.toLowerCase()),
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Reset visible count when filters change (non-blocking)
    startTransition(() => setVisibleCount(PAGE_SIZE));
    return out;
  }, [city, topic, debouncedQ, events]);

  // Filtered upcoming and past
  const filteredUpcoming = useMemo(
    () => filtered.filter((e) => new Date(e.date).getTime() >= Date.now()),
    [filtered],
  );
  const filteredPast = useMemo(
    () =>
      filtered
        .filter((e) => new Date(e.date).getTime() < Date.now())
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [filtered],
  );

  // Note: upcoming and past are now filteredUpcoming and filteredPast

  // Next up (first upcoming event from all events, not filtered)
  const nextUp = useMemo(() => {
    const sorted = [...events]
      .filter((e) => new Date(e.date).getTime() >= Date.now())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted[0] || null;
  }, [events]);

  // Share helper (Web Share API fallback to clipboard)
  async function shareEvent(e: EventItem) {
    const url = `${location.origin}/events/${e.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: e.title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // last resort: create temporary input
        const t = document.createElement("textarea");
        t.value = url;
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        t.remove();
      }
    } catch {
      // silent fail
    }
  }

  function downloadEventICS(e: EventItem) {
    try {
      const ics = generateICS(e);
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${e.slug || "event"}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }

  // UI helpers
  const visibleUpcoming = filteredUpcoming.slice(0, visibleCount);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      {/* Sidebar - sticky on desktop */}
      <aside className="order-2 lg:order-1">
        <div className="sticky top-24 space-y-6">
          {/* Next Up */}
          {nextUp && (
            <Card className="bg-card border-border overflow-hidden">
              <div className="relative aspect-[16/9] w-full border-b border-border">
                <Image
                  src={nextUp.image || "/event-flyer-placeholder.svg"}
                  alt={`${nextUp.title} flyer`}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                  priority
                />
              </div>
              <CardContent className="card-padding space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    Next Up
                  </Badge>
                  <time
                    dateTime={nextUp.date}
                    className="text-xs text-muted-foreground"
                  >
                    {new Date(nextUp.date).toLocaleDateString()}
                  </time>
                </div>
                <h3 className="mt-1 text-h4 text-foreground line-clamp-2">
                  {nextUp.title}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {nextUp.venue} · {nextUp.city}
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {truncate(nextUp.description, 180)}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1"
                    aria-label={`Register for ${nextUp.title}`}
                  >
                    <Link href={`/events/${nextUp.slug}`}>Register</Link>
                  </Button>
                  <Button
                    onClick={() => shareEvent(nextUp)}
                    size="sm"
                    variant="outline"
                    aria-label={`Share ${nextUp.title}`}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => downloadEventICS(nextUp)}
                    size="sm"
                    variant="outline"
                    aria-label={`Download calendar for ${nextUp.title}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="card-padding space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  City
                </label>
                <Select
                  value={city}
                  onValueChange={(v) => startTransition(() => setCity(v))}
                >
                  <SelectTrigger className="bg-surface-subtle border-border text-foreground">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Topic
                </label>
                <Select
                  value={topic}
                  onValueChange={(v) => startTransition(() => setTopic(v))}
                >
                  <SelectTrigger className="bg-surface-subtle border-border text-foreground">
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {topics.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="events-search"
                  className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Search
                </label>
                <Input
                  id="events-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, venue, description"
                  className="bg-surface-subtle border-border"
                  aria-label="Search events by title, venue, or description"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() =>
                    startTransition(() => {
                      setCity("All");
                      setTopic("All");
                      setQ("");
                    })
                  }
                  variant="outline"
                  className="flex-1"
                  aria-label="Reset filters"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => {
                    /* Future: server apply */
                  }}
                  className="flex-1"
                  aria-label="Apply filters"
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="card-padding">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>{" "}
                events • Upcoming{" "}
                <span className="font-medium text-foreground">
                  {filteredUpcoming.length}
                </span>{" "}
                • Past{" "}
                <span className="font-medium text-foreground">
                  {filteredPast.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main content */}
      <section className="order-1 lg:order-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({filteredUpcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({filteredPast.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {visibleUpcoming.length > 0 ? (
              <div className="space-y-3">
                <div className="grid gap-6 md:grid-cols-2">
                  {visibleUpcoming.map((e) => {
                    const fill = Math.min(
                      100,
                      Math.round(
                        (e.registered / Math.max(1, e.capacity)) * 100,
                      ),
                    );
                    const barColor =
                      fill > 90
                        ? "bg-red-500"
                        : fill > 70
                          ? "bg-yellow-500"
                          : "bg-blue-500";
                    const isFull = e.capacity > 0 && e.registered >= e.capacity;
                    const topicsToShow = e.topics.slice(0, 6);
                    const extraTopics = Math.max(
                      0,
                      e.topics.length - topicsToShow.length,
                    );
                    return (
                      <article
                        key={e.id}
                        aria-labelledby={`event-${e.id}-title`}
                        className="group overflow-hidden bg-card border-border transition-card hover:shadow-card-hover hover:-translate-y-1"
                      >
                        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border">
                          <Image
                            src={e.image ?? "/event-flyer-placeholder.svg"}
                            alt={e.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                            className="object-cover"
                          />
                          <Badge
                            className="absolute left-3 top-3"
                            variant={isFull ? "default" : "secondary"}
                          >
                            {isFull ? "Full" : "Registration open"}
                          </Badge>
                        </div>

                        <CardContent className="card-padding space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-blue-400">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(e.date).toLocaleString(undefined, {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {e.registered}/{e.capacity}
                            </div>
                          </div>

                          <h3
                            id={`event-${e.id}-title`}
                            className="text-h3 text-foreground group-hover:text-blue-400 transition-colors"
                          >
                            <Link href={`/events/${e.slug}`}>{e.title}</Link>
                          </h3>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {e.venue} — {e.city}
                            </span>
                          </div>

                          {e.speakers && e.speakers.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Speakers:{" "}
                              {e.speakers.map((s) => s.name).join(", ")}
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Sessions: {e.topics.length} • Speakers:{" "}
                            {e.speakers.length}
                          </div>

                          <p
                            className="text-sm text-muted-foreground line-clamp-3"
                            aria-hidden={false}
                          >
                            {truncate(e.description, 180)}
                          </p>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {topicsToShow.map((t) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className="gap-1"
                              >
                                <Tag className="h-3.5 w-3.5" /> {t}
                              </Badge>
                            ))}
                            {extraTopics > 0 && (
                              <Badge variant="outline">
                                +{extraTopics} more
                              </Badge>
                            )}
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <div className="w-2/3">
                              <Progress
                                value={fill}
                                indicatorClassName={barColor}
                                className="mt-1"
                                aria-label={`Registration ${fill}%`}
                              />
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <Button asChild size="sm">
                                <Link href={`/events/${e.slug}`}>
                                  {isFull ? "View" : "Register"}
                                </Link>
                              </Button>
                              <Button
                                onClick={() => shareEvent(e)}
                                size="sm"
                                variant="outline"
                                aria-label={`Share ${e.title}`}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => downloadEventICS(e)}
                                size="sm"
                                variant="outline"
                                aria-label={`Download ${e.title} calendar`}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </article>
                    );
                  })}
                </div>

                {/* Load more */}
                {filteredUpcoming.length > visibleCount && (
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                      variant="ghost"
                      aria-label="Load more events"
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No upcoming events match your filters."
                subtitle="Try a different city, topic, or search term."
                actionHref="/events"
                actionLabel="Reset filters"
              />
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {filteredPast.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredPast.map((e) => (
                  <article
                    key={e.id}
                    aria-labelledby={`past-event-${e.id}-title`}
                    className="group overflow-hidden bg-card border-border transition-card hover:shadow-card-hover hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border">
                      <Image
                        src={e.image ?? "/event-flyer-placeholder.svg"}
                        alt={e.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                        className="object-cover"
                      />
                      <Badge
                        className="absolute left-3 top-3"
                        variant="outline"
                      >
                        Completed
                      </Badge>
                    </div>
                    <CardContent className="card-padding space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(e.date).toLocaleDateString()}</span>
                      </div>
                      <h3
                        id={`past-event-${e.id}-title`}
                        className="text-h3 text-foreground group-hover:text-blue-400 transition-colors"
                      >
                        <Link href={`/events/${e.slug}`}>{e.title}</Link>
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {e.venue} — {e.city}
                        </span>
                      </div>
                      {e.speakers && e.speakers.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Speakers: {e.speakers.map((s) => s.name).join(", ")}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Sessions: {e.topics.length} • Speakers:{" "}
                        {e.speakers.length}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {truncate(e.description, 160)}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {e.topics.slice(0, 6).map((t) => (
                          <Badge key={t} variant="outline" className="gap-1">
                            <Tag className="h-3.5 w-3.5" /> {t}
                          </Badge>
                        ))}
                      </div>
                      <div className="pt-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/events/${e.slug}`}>View details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No past events match your filters."
                subtitle="Try a different city, topic, or search term."
                actionHref="/events"
                actionLabel="Reset filters"
              />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
