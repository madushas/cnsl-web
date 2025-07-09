import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Link from "next/link";
import { DatabaseEvent } from "@/lib/types";
import { isPastEvent } from "@/lib/utils";
import Image from "next/image";

const FeaturedEvents = ({ event }: { event: DatabaseEvent }) => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Featured Event
          </h2>
          <p className="text-lg text-muted-foreground">
            Don&apos;t miss our upcoming community gathering
          </p>
        </div>

        <Card className="max-w-4xl mx-auto overflow-hidden p-0">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-auto bg-gradient-to-br from-primary/20 to-secondary/20">
<div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110 rounded-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <Calendar className="h-16 w-16 text-primary/40" />
          </div>
        )}
      </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={isPastEvent(event) ? "secondary" : "default"}>
                  {isPastEvent(event) ? "Past Event" : "Upcoming"}
                </Badge>
                {/* Display attendance badge */}
                
              </div>
              <h3 className="text-2xl font-bold mb-4">{event.title}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{event.eventDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{event.eventTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">{event.description}</p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href={`/events/${event.slug}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/events">All Events</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FeaturedEvents;