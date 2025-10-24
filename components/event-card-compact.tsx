import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

type Speaker = { name: string; title?: string | null; topic?: string | null };

export type EventCardProps = {
  id: string;
  slug: string;
  title: string;
  date: string; // ISO string
  city: string | null;
  venue: string | null;
  image?: string | null;
  capacity: number;
  registered: number;
  description: string | null;
  speakers: Speaker[];
  isPast?: boolean;
};

function truncate(text: string | null | undefined, max = 100) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}

export function EventCardCompact({ event }: { event: EventCardProps }) {
  const isFull = event.capacity > 0 && event.registered >= event.capacity;
  const isPast = event.isPast || new Date(event.date).getTime() < Date.now();
  
  // Single primary status badge
  const statusBadge = isPast 
    ? { label: "Past Event", variant: "outline" as const }
    : isFull 
    ? { label: "Full", variant: "default" as const }
    : { label: "Open", variant: "secondary" as const };

  return (
    <article className="group card-compact h-full flex flex-col">
      <Link href={`/events/${event.slug}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={event.image ?? "/event-flyer-placeholder.svg"}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge 
            className="absolute left-3 top-3 shadow-sm" 
            variant={statusBadge.variant}
          >
            {statusBadge.label}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 space-y-2.5">
          {/* Date & Location */}
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <time dateTime={event.date} className="truncate">
                {new Date(event.date).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </div>
            {(event.venue || event.city) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {[event.venue, event.city].filter(Boolean).join(" · ")}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Description (hidden on mobile) */}
          <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2 flex-1">
            {truncate(event.description, 120)}
          </p>

          {/* Footer: Capacity + CTA */}
          <div className="flex items-center justify-between pt-2 mt-auto border-t">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>
                {event.registered}/{event.capacity > 0 ? event.capacity : "∞"}
              </span>
            </div>
            <Button 
              size="sm" 
              variant={isPast ? "outline" : "default"}
              className="pointer-events-none" 
              tabIndex={-1}
            >
              {isPast ? "View Details" : isFull ? "View" : "Register"}
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
}
