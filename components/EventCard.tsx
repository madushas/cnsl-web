import { Calendar, MapPin, Clock, Users, ArrowRight, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { DatabaseEvent } from "@/lib/types";

interface EventCardProps {
  readonly event: DatabaseEvent;
  readonly isVisible?: boolean;
  readonly isPastEvent?: boolean;
  readonly onRegister?: (eventId: string) => void;
  readonly isRegistering?: boolean;
}

export default function EventCard({
  event,
  isVisible = true,
  isPastEvent = false,
  onRegister,
  isRegistering = false,
}: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const progressValue = event.maxAttendees
    ? (event.currentAttendees / event.maxAttendees) * 100
    : 0;
  const isFullyBooked =
    event.maxAttendees && event.currentAttendees >= event.maxAttendees;

  // Format date nicely
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Get difficulty color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card
      className={`group relative flex flex-col overflow-hidden border border-border bg-card transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 pt-0 ${
        event.featured ? "ring-2 ring-primary ring-offset-2" : ""
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      itemScope
      itemType="https://schema.org/Event"
    >
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <Calendar className="h-16 w-16 text-primary/40" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {event.featured && (
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg border-0 backdrop-blur-sm">
              ⭐ Featured
            </Badge>
          )}
          {isPastEvent ? (
            <Badge
              variant="secondary"
              className="bg-black/40 text-white border-0 backdrop-blur-sm"
            >
              Past Event
            </Badge>
          ) : (
            <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm">
              Upcoming
            </Badge>
          )}
        </div>

        {/* Event Type Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className="bg-white/90 text-gray-800 border-0 backdrop-blur-sm capitalize font-medium"
          >
            {event.eventType}
          </Badge>
        </div>

        {/* Date overlay */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-2xl font-bold leading-none">
            {eventDate.getDate()}
          </div>
          <div className="text-xs uppercase tracking-wide opacity-90">
            {eventDate.toLocaleDateString("en-US", { month: "short" })}
          </div>
        </div>
      </div>

      <CardHeader className="space-y-3 p-5 pb-3">
        {/* Title */}
        <h3
          className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2"
          itemProp="name"
        >
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <time dateTime={event.eventDate} itemProp="startDate">
              {formattedDate}
            </time>
            <span className="text-muted-foreground/60">•</span>
            <Clock className="h-4 w-4 text-primary" />
            <span itemProp="doorTime">{event.eventTime}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span itemProp="location" className="truncate">
              {event.location}
            </span>
          </div>
        </div>

        {/* Speaker Info */}
        {event.speakerDetails.length > 0 && (
          <div className="flex flex-col gap-3 p-3 bg-muted/50 rounded-lg">
            {event.speakerDetails.map((speaker) => (
              <div key={speaker.id} className="flex items-center gap-3">
                {speaker.image ? (
                  <Image
                    src={speaker.image}
                    alt={speaker.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {speaker.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {speaker.title}
                    {speaker.company && ` at ${speaker.company}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 p-5 pt-0 flex-1">
        {/* Description */}
        <p
          className="text-sm leading-relaxed text-muted-foreground line-clamp-3"
          itemProp="description"
        >
          {event.description}
        </p>

        {/* Topics/Tags */}
        {event.topics && event.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.topics.slice(0, 3).map((topic, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-1 bg-primary/10 text-primary border-0"
              >
                {topic}
              </Badge>
            ))}
            {event.topics.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                +{event.topics.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Difficulty */}
        {event.difficulty && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Difficulty:</span>
            <Badge
              variant="outline"
              className={`text-xs capitalize ${getDifficultyColor(
                event.difficulty
              )}`}
            >
              {event.difficulty}
            </Badge>
          </div>
        )}

        {/* Attendance Progress */}
        {!isPastEvent && !!event.maxAttendees && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            {event.currentAttendees}/{event.maxAttendees} registered
          </span>
              </div>
              <span
          className={`font-medium ${
            isFullyBooked ? "text-red-600" : "text-green-600"
          }`}
              >
          {Math.round(progressValue)}%
              </span>
            </div>
            <Progress
              value={progressValue}
              className={`h-2 w-full ${
          isFullyBooked ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"
              }`}
              aria-label={`${event.currentAttendees} of ${event.maxAttendees} spots filled`}
            />
            {isFullyBooked && (
              <p className="text-xs text-red-600 font-medium">
          Event is fully booked
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 group/btn border-primary/20 hover:border-primary hover:bg-primary/5"
          >
            <Link href={`/events/${event.slug}`}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>

          {!isPastEvent && onRegister && (
            <Button
              onClick={() => onRegister(event.id)}
              disabled={isFullyBooked || isRegistering}
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isRegistering ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering...
                </div>
              ) : isFullyBooked ? (
                "Fully Booked"
              ) : (
                "Register"
              )}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
}
