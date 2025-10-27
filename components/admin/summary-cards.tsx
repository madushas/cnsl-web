import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type AdminSummary = {
  eventsTotal: number;
  upcomingEvents: number;
  rsvpsTotal: number;
  pendingRsvps: number;
  approvedRsvps: number;
  eventsTrend?: string;
  upcomingTrend?: string;
  rsvpsTrend?: string;
  pendingTrend?: string;
};

export function SummaryCards({ summary }: { summary: AdminSummary }) {
  const items = [
    {
      label: "Total Events",
      value: summary.eventsTotal,
      hint: "All-time",
      trend: summary.eventsTrend ?? "+0%",
    },
    {
      label: "Upcoming Events",
      value: summary.upcomingEvents,
      hint: "Next 30 days",
      trend: summary.upcomingTrend ?? "+0%",
    },
    {
      label: "Total RSVPs",
      value: summary.rsvpsTotal,
      hint: "All-time",
      trend: summary.rsvpsTrend ?? "+0%",
    },
    {
      label: "Pending RSVPs",
      value: summary.pendingRsvps,
      hint: "Awaiting review",
      trend: summary.pendingTrend ?? "+0%",
    },
  ];
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className="@container/card">
          <CardHeader>
            <CardDescription>{it.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {Intl.NumberFormat().format(it.value)}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">{it.trend}</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">{it.hint}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
