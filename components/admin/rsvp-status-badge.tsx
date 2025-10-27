import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type RSVPStatus =
  | "pending"
  | "approved"
  | "invited"
  | "declined"
  | "waitlisted"
  | string;

type RSVPStatusBadgeProps = {
  status: RSVPStatus;
  showTooltip?: boolean;
  className?: string;
};

const STATUS_CONFIG = {
  pending: {
    variant: "outline" as const,
    label: "Pending",
    tooltip: "Awaiting admin approval. Does not count toward event capacity.",
  },
  approved: {
    variant: "default" as const,
    label: "Approved",
    tooltip: "Confirmed attendee. Counts toward event capacity.",
  },
  invited: {
    variant: "secondary" as const,
    label: "Invited",
    tooltip: "Invited but not yet confirmed. Does not count toward capacity.",
  },
  declined: {
    variant: "destructive" as const,
    label: "Declined",
    tooltip: "RSVP rejected by admin or declined by attendee.",
  },
  waitlisted: {
    variant: "outline" as const,
    label: "Waitlisted",
    tooltip:
      "On waiting list due to capacity limits. Does not count toward capacity.",
  },
  waitlist: {
    variant: "outline" as const,
    label: "Waitlisted",
    tooltip:
      "On waiting list due to capacity limits. Does not count toward capacity.",
  },
} as const;

export function RSVPStatusBadge({
  status,
  showTooltip = true,
  className,
}: RSVPStatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || "pending";
  const config = STATUS_CONFIG[
    normalizedStatus as keyof typeof STATUS_CONFIG
  ] || {
    variant: "outline" as const,
    label: status,
    tooltip: `Status: ${status}`,
  };

  const badge = (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Legend component for showing all statuses
export function RSVPStatusLegend() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h4 className="text-sm font-medium mb-3">RSVP Status Guide</h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-start gap-2">
          <RSVPStatusBadge status="approved" showTooltip={false} />
          <div className="text-xs text-muted-foreground">
            Confirmed.{" "}
            <span className="font-medium">Counts toward capacity.</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <RSVPStatusBadge status="invited" showTooltip={false} />
          <div className="text-xs text-muted-foreground">
            Invited, not confirmed. Does not count.
          </div>
        </div>
        <div className="flex items-start gap-2">
          <RSVPStatusBadge status="pending" showTooltip={false} />
          <div className="text-xs text-muted-foreground">
            Awaiting approval. Does not count.
          </div>
        </div>
        <div className="flex items-start gap-2">
          <RSVPStatusBadge status="waitlisted" showTooltip={false} />
          <div className="text-xs text-muted-foreground">
            On waiting list. Does not count.
          </div>
        </div>
        <div className="flex items-start gap-2">
          <RSVPStatusBadge status="declined" showTooltip={false} />
          <div className="text-xs text-muted-foreground">
            Rejected or declined.
          </div>
        </div>
      </div>
    </div>
  );
}
