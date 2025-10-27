import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconUsers,
  IconCalendar,
  IconFileText,
  IconChevronRight,
  IconCheck,
} from "@tabler/icons-react";

type DashboardStats = {
  pendingRsvps: number;
  upcomingEvents: number;
  draftPosts: number;
};

type PendingActionsWidgetProps = {
  stats: DashboardStats;
};

export function PendingActionsWidget({ stats }: PendingActionsWidgetProps) {
  const hasPendingItems =
    stats.pendingRsvps > 0 || stats.upcomingEvents > 0 || stats.draftPosts > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs Attention</CardTitle>
        <CardDescription>Pending actions requiring review</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.pendingRsvps > 0 && (
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-3 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
            asChild
          >
            <Link href="/admin/events?status=pending">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0">
                  <IconUsers className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">
                    {stats.pendingRsvps} Pending RSVP
                    {stats.pendingRsvps !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Review and approve
                  </div>
                </div>
              </div>
              <IconChevronRight className="size-4 text-muted-foreground shrink-0" />
            </Link>
          </Button>
        )}

        {stats.upcomingEvents > 0 && (
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
            asChild
          >
            <Link href="/admin/events?timeframe=upcoming">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <IconCalendar className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">
                    {stats.upcomingEvents} Upcoming Event
                    {stats.upcomingEvents !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    In next 30 days
                  </div>
                </div>
              </div>
              <IconChevronRight className="size-4 text-muted-foreground shrink-0" />
            </Link>
          </Button>
        )}

        {stats.draftPosts > 0 && (
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-3 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
            asChild
          >
            <Link href="/admin/posts?status=draft">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                  <IconFileText className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">
                    {stats.draftPosts} Draft Post
                    {stats.draftPosts !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ready to publish?
                  </div>
                </div>
              </div>
              <IconChevronRight className="size-4 text-muted-foreground shrink-0" />
            </Link>
          </Button>
        )}

        {!hasPendingItems && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-3">
              <IconCheck className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs mt-1">No pending actions at the moment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
