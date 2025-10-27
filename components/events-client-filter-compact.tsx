"use client";

import { useMemo, useState, useTransition } from "react";
import {
  EventCardCompact,
  type EventCardProps,
} from "@/components/event-card-compact";
import {
  FilterPanel,
  type FilterOption,
  type FilterStats,
} from "@/components/filter-panel";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function EventsClientFilterCompact({
  events,
}: {
  events: EventCardProps[];
}) {
  const [city, setCity] = useState<string>("All");
  const [q, setQ] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [visibleCount, setVisibleCount] = useState(12);
  const [isPending, startTransition] = useTransition();

  const PAGE_SIZE = 12;

  // Derive filter options
  const cities = useMemo(
    () => [
      "All",
      ...Array.from(new Set(events.map((x) => x.city || "").filter(Boolean))),
    ],
    [events],
  );

  // Filter events
  const filtered = useMemo(() => {
    return events
      .filter((e) => (city === "All" ? true : e.city === city))
      .filter((e) =>
        q.trim() === ""
          ? true
          : [e.title, e.venue, e.description]
              .join(" ")
              .toLowerCase()
              .includes(q.toLowerCase()),
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [city, q, events]);

  const filteredUpcoming = useMemo(
    () => {
      const now = new Date().getTime();
      return filtered.filter((e) => new Date(e.date).getTime() >= now);
    },
    [filtered],
  );

  const filteredPast = useMemo(
    () => {
      const now = new Date().getTime();
      return filtered
        .filter((e) => new Date(e.date).getTime() < now)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
    },
    [filtered],
  );

  // Filter configuration
  const filterConfig: FilterOption[] = [
    {
      type: "select",
      label: "City",
      value: city,
      options: cities,
      onChange: (v) => startTransition(() => setCity(v)),
    },
    {
      type: "search",
      label: "Search",
      value: q,
      onChange: setQ,
      placeholder: "Search events...",
    },
  ];

  // Stats
  const stats: FilterStats[] = [
    { label: "Total Events", value: events.length },
    { label: "Upcoming", value: filteredUpcoming.length },
    { label: "Past Events", value: filteredPast.length },
  ];

  const appliedFiltersCount = [
    city !== "All" ? 1 : 0,
    q.trim() !== "" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  function resetFilters() {
    startTransition(() => {
      setCity("All");
      setQ("");
    });
  }

  const visibleUpcoming = filteredUpcoming.slice(0, visibleCount);
  const visiblePast = filteredPast.slice(0, visibleCount);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
      {/* Filter Panel */}
      <FilterPanel
        filters={filterConfig}
        stats={stats}
        onReset={resetFilters}
        appliedCount={appliedFiltersCount}
      />

      {/* Main Content */}
      <section>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({filteredUpcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({filteredPast.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {visibleUpcoming.length > 0 ? (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {visibleUpcoming.map((event) => (
                    <EventCardCompact key={event.id} event={event} />
                  ))}
                </div>

                {/* Load More */}
                {filteredUpcoming.length > visibleCount && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                      disabled={isPending}
                    >
                      {isPending ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No upcoming events"
                subtitle="Check back soon for new events or try adjusting your filters."
                actionHref="/events"
                actionLabel="Clear Filters"
              />
            )}
          </TabsContent>

          <TabsContent value="past">
            {visiblePast.length > 0 ? (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {visiblePast.map((event) => (
                    <EventCardCompact
                      key={event.id}
                      event={{ ...event, isPast: true }}
                    />
                  ))}
                </div>

                {/* Load More */}
                {filteredPast.length > visibleCount && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                      disabled={isPending}
                    >
                      {isPending ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No past events"
                subtitle="Past events will appear here once they're completed."
                actionHref="/events"
                actionLabel="View Upcoming"
              />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
