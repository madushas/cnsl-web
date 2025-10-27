"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import Image from "next/image";

type EventItem = {
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

export function UpcomingEventSection({ initial }: { initial?: EventItem[] }) {
  // Server always provides data - no client fetch needed (CSR-01 fix)
  const nextUp = useMemo(() => {
    const data = initial || [];
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const now = new Date().getTime();
    return sorted.find((e) => new Date(e.date).getTime() >= now) || null;
  }, [initial]);
  const dt = nextUp ? new Date(nextUp.date) : null;

  if (!nextUp) return null;

  return (
    <section className="container mx-auto px-4 section-spacing">
      <Reveal className="mb-12 md:mb-16 text-center">
        <h2 className="mb-4 text-h2 text-foreground">
          Upcoming Event Spotlight
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground">
          Don’t miss our next community gathering
        </p>
      </Reveal>

      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Card className="relative overflow-hidden bg-card border-border transition-card hover:shadow-card-hover">
            <CardContent className="relative p-0">
              <div className="grid items-stretch gap-0 lg:grid-cols-12">
                {/* Media (Left) */}
                <div className="col-span-12 lg:col-span-6">
                  {nextUp && (
                    <div className="relative h-full max-h-[400px] w-full overflow-hidden lg:rounded-l-2xl">
                      <Image
                        src={nextUp.image || "/event-flyer-placeholder.svg"}
                        alt={`${nextUp.title} flyer`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Content (Right) */}
                <div className="col-span-12 lg:col-span-6 card-padding-lg lg:p-12 space-y-6">
                  <div>
                    <Badge
                      variant="secondary"
                      className="mb-2 gap-2 px-4 py-1.5 text-sm"
                    >
                      <Calendar className="h-4 w-4" />
                      Next Up
                    </Badge>
                    {nextUp && (
                      <>
                        <h3 className="mt-4 text-h2 text-foreground">
                          {nextUp.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {nextUp.venue} — {nextUp.city}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sessions: {nextUp.topics.length} • Speakers:{" "}
                          {nextUp.speakers.length}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Registration is open. Due to space limitations, RSVP
                          emails may be sent to selected participants.
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-border bg-surface-subtle p-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Date
                        </div>
                        <div className="font-semibold text-foreground">
                          {dt
                            ? dt.toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-border bg-surface-subtle p-2">
                        <MapPin className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Location
                        </div>
                        <div className="font-semibold text-foreground">
                          {nextUp?.venue}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-border pt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Featured Speakers</span>
                    </div>
                    <div className="space-y-2">
                      {(nextUp?.speakers || []).slice(0, 3).map((s) => (
                        <div key={s.name} className="text-foreground">
                          <span className="font-semibold">{s.name}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            — {s.topic}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 pt-4">
                    <div className="text-left">
                      <div className="text-2xl font-bold text-foreground">
                        {nextUp?.registered ?? 0}+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Already Registered
                      </div>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                    >
                      <Link
                        href={nextUp ? `/events/${nextUp.slug}` : "/events"}
                        aria-label="Register for the next CNSL event"
                      >
                        Register
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
