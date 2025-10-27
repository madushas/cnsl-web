import { Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "upcoming" | "past";
}

export function EmptyState({ type }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed bg-surface-subtle p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        {type === "upcoming" ? (
          <Calendar className="h-8 w-8 text-primary" />
        ) : (
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="mb-2 text-lg font-semibold">
        {type === "upcoming" ? "No Upcoming Events" : "No Past Events"}
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        {type === "upcoming"
          ? "You haven't RSVP'd to any upcoming events yet. Explore our events and register for ones that interest you!"
          : "You don't have any past event history yet."}
      </p>
      {type === "upcoming" && (
        <Link href="/events">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Browse Events
          </Button>
        </Link>
      )}
    </div>
  );
}