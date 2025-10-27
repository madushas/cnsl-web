import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  IconUsers,
  IconPencil,
  IconTrash,
  IconCalendar,
  IconMapPin,
  IconTicket,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type EventCardProps = {
  id: string;
  slug: string;
  title: string;
  date: string;
  city?: string | null;
  venue?: string | null;
  capacity?: number | null;
  published?: boolean | null;
  image?: string | null;
  registered?: number;
  onTogglePublished: () => void;
  onDelete: () => void;
};

export function EventCard({
  id,
  slug,
  title,
  date,
  city,
  venue,
  capacity,
  published,
  image,
  registered = 0,
  onTogglePublished,
  onDelete,
}: EventCardProps) {
  const eventDate = new Date(date);
  const isPast = eventDate < new Date();
  const capacityPercent = capacity
    ? Math.round((registered / capacity) * 100)
    : 0;
  const isNearCapacity = capacityPercent >= 80;

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden bg-linear-to-br from-primary/10 to-primary/5">
        {image ? (
          <Image
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <IconCalendar className="size-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={published ? "success" : "subtle"}>
            {published ? "Published" : "Draft"}
          </Badge>
          <Badge variant={isPast ? "subtle" : "info"}>
            {isPast ? "Past" : "Upcoming"}
          </Badge>
          {registered > 0 && (
            <Badge variant="secondary" className="gap-1">
              <IconUsers className="size-3" />
              {registered} RSVPs
            </Badge>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/admin/events/${slug}`}>
              <IconUsers className="size-4" />
              RSVPs
            </Link>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/admin/events/${slug}/edit`}>
              <IconPencil className="size-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {eventDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Location */}
        {(city || venue) && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <IconMapPin className="mt-0.5 size-4 shrink-0" />
            <span className="line-clamp-2">
              {[venue, city].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Capacity Bar */}
        {capacity && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <IconTicket className="size-4" />
                <span className="font-medium">
                  {registered} / {capacity}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isNearCapacity ? "text-warning" : "text-muted-foreground",
                )}
              >
                {capacityPercent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all",
                  isNearCapacity ? "bg-warning" : "bg-primary",
                )}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={!!published}
              onCheckedChange={onTogglePublished}
              id={`publish-${id}`}
            />
            <label
              htmlFor={`publish-${id}`}
              className="text-sm font-medium cursor-pointer"
            >
              Published
            </label>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
