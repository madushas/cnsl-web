"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type Speaker = { name: string; title?: string | null; topic?: string | null };

type EventItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  city: string | null;
  venue: string | null;
  image?: string | null;
  capacity: number;
  registered: number;
  description: string | null;
  speakers: Speaker[];
  topics: string[];
};

export function EventsModernLayout({ events }: { events: EventItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Get unique cities
  const cities = useMemo(() => {
    const citySet = new Set(events.map((e) => e.city).filter(Boolean));
    return Array.from(citySet) as string[];
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.venue?.toLowerCase().includes(query)
      );
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter((e) => e.city === selectedCity);
    }

    // Split by time
    const now = Date.now();
    const upcoming = filtered
      .filter((e) => new Date(e.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = filtered
      .filter((e) => new Date(e.date).getTime() < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcoming, past };
  }, [events, searchQuery, selectedCity]);

  const displayEvents =
    activeTab === "upcoming"
      ? filteredEvents.upcoming
      : filteredEvents.past;

  const featuredEvent = displayEvents[0];
  const regularEvents = displayEvents.slice(1);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCity === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCity(null)}
          >
            All Cities
          </Button>
          {cities.map((city) => (
            <Button
              key={city}
              variant={selectedCity === city ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
            activeTab === "upcoming"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upcoming ({filteredEvents.upcoming.length})
          {activeTab === "upcoming" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
            activeTab === "past"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Past ({filteredEvents.past.length})
          {activeTab === "past" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Events Display */}
      {displayEvents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No events found</p>
          {(searchQuery || selectedCity) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCity(null);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured Event - Large Card */}
          {featuredEvent && (
            <Link
              href={`/events/${featuredEvent.slug}`}
              className="block group"
            >
              <div className="grid md:grid-cols-2 gap-6 border border-border rounded-xl overflow-hidden hover:border-primary transition-colors bg-card">
                <div className="relative aspect-[16/10] md:aspect-auto">
                  <Image
                    src={featuredEvent.image ?? "/event-flyer-placeholder.svg"}
                    alt={featuredEvent.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4">Featured</Badge>
                  <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {featuredEvent.title}
                  </h2>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={featuredEvent.date}>
                        {new Date(featuredEvent.date).toLocaleString(undefined, {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    {(featuredEvent.venue || featuredEvent.city) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {[featuredEvent.venue, featuredEvent.city]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {featuredEvent.registered}/
                        {featuredEvent.capacity > 0 ? featuredEvent.capacity : "∞"}{" "}
                        registered
                      </span>
                    </div>
                  </div>
                  {featuredEvent.description && (
                    <p className="text-muted-foreground line-clamp-3 mb-6">
                      {featuredEvent.description}
                    </p>
                  )}
                  <Button className="w-fit">View Details</Button>
                </div>
              </div>
            </Link>
          )}

          {/* Regular Events - Bento Grid */}
          {regularEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const isFull = event.capacity > 0 && event.registered >= event.capacity;
  const isPast = new Date(event.date).getTime() < Date.now();

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block group border border-border rounded-xl overflow-hidden hover:border-primary transition-colors bg-card"
    >
      <div className="relative aspect-[16/10]">
        <Image
          src={event.image ?? "/event-flyer-placeholder.svg"}
          alt={event.title}
          fill
          className="object-cover"
        />
        {(isPast || isFull) && (
          <Badge className="absolute top-3 left-3">
            {isPast ? "Past" : "Full"}
          </Badge>
        )}
      </div>
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={event.date}>
              {new Date(event.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          {(event.venue || event.city) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">
                {[event.venue, event.city].filter(Boolean).join(" · ")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            <span>
              {event.registered}/{event.capacity > 0 ? event.capacity : "∞"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}