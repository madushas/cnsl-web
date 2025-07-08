"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatabaseEvent } from "@/lib/types";
import { isPastEvent } from "@/lib/utils";
import EventCard from "./EventCard";

interface EventsClientProps {
  readonly events: DatabaseEvent[];
}

export default function EventsClient({ events }: EventsClientProps) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filterType, setFilterType] = useState<string>("all");

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const upcoming = events.filter((event) => !isPastEvent(event)).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    const past = events.filter((event) => isPastEvent(event)).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const eventTypes = useMemo(() => [...new Set(events.map(event => event.eventType))], [events]);

  const filteredUpcomingEvents = useMemo(() => {
    if (filterType === "all") return upcomingEvents;
    return upcomingEvents.filter(event => event.eventType === filterType);
  }, [upcomingEvents, filterType]);

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
          className="transition-all duration-200"
        >
          All Events
        </Button>
        {eventTypes.map((type) => (
          <Button
            key={type}
            variant={filterType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(type)}
            className="capitalize transition-all duration-200"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Events Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8 border-b-2 border-muted">
          <TabsTrigger value="upcoming" className="text-sm font-medium">
            Upcoming Events ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-sm font-medium">
            Past Events ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-8">
          {filteredUpcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredUpcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} isVisible={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {filterType === "all" 
                  ? "No upcoming events at the moment. Check back soon!"
                  : `No upcoming ${filterType} events. Try another filter.`
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-8">
          {pastEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isVisible={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No past events to display.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
