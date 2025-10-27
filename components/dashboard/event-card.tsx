import {
  Calendar,
  MapPin,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketDisplay } from "./ticket-display";

interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  date: Date;
  city: string | null;
  venue: string | null;
  status: string;
  ticketNumber?: string | null;
  ticketImage?: string | null;
  isPast?: boolean;
}

export function EventCard({
  slug,
  title,
  date,
  city,
  venue,
  status,
  ticketNumber,
  ticketImage,
  isPast = false,
}: EventCardProps) {
  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed") {
      return {
        icon: CheckCircle,
        label: "Confirmed",
        variant: "default" as const,
        className: "badge-success",
      };
    }
    if (statusLower === "pending") {
      return {
        icon: Clock,
        label: "Pending",
        variant: "secondary" as const,
        className: "badge-warning",
      };
    }
    if (statusLower === "cancelled") {
      return {
        icon: XCircle,
        label: "Cancelled",
        variant: "destructive" as const,
        className: "badge-error",
      };
    }
    return {
      icon: AlertCircle,
      label: status,
      variant: "outline" as const,
      className: "badge-info",
    };
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedTime = new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Card
      className={`overflow-hidden transition-card hover:shadow-card-hover ${
        isPast ? "opacity-75" : ""
      }`}
    >
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-h4 line-clamp-2 flex-1">{title}</h3>
            <Badge className={`${statusConfig.className} shrink-0`}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {formattedDate} • {formattedTime}
              </span>
            </div>
            {(venue || city) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">
                  {venue}
                  {venue && city && " • "}
                  {city}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Section */}
        <div className="p-6">
          {ticketNumber && ticketImage ? (
            <TicketDisplay
              ticketNumber={ticketNumber}
              ticketImage={ticketImage}
              eventTitle={title}
            />
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isPast
                  ? "Event has concluded"
                  : "Ticket will appear here when available"}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-surface-subtle px-6 py-4">
          <Link href={`/events/${slug}`}>
            <Button variant="outline" className="w-full" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              {isPast ? "View Event Details" : "View Event Page"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}