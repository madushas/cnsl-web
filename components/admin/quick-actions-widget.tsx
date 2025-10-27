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
  IconPlus,
  IconFileText,
  IconUserPlus,
  IconTicket,
  IconCalendar,
} from "@tabler/icons-react";

export function QuickActionsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button
          variant="outline"
          className="justify-start h-auto py-3 px-4 hover:bg-primary/5 transition-colors"
          asChild
        >
          <Link href="/admin/events/new">
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                <IconCalendar className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Create Event</div>
                <div className="text-xs text-muted-foreground">
                  Set up a new community event
                </div>
              </div>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="justify-start h-auto py-3 px-4 hover:bg-primary/5 transition-colors"
          asChild
        >
          <Link href="/admin/posts/new">
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                <IconFileText className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Write Post</div>
                <div className="text-xs text-muted-foreground">
                  Share news or updates
                </div>
              </div>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="justify-start h-auto py-3 px-4 hover:bg-primary/5 transition-colors"
          asChild
        >
          <Link href="/admin/people">
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                <IconUserPlus className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Add Team Member</div>
                <div className="text-xs text-muted-foreground">
                  Invite organizer or advisor
                </div>
              </div>
            </div>
          </Link>
        </Button>

        <Button
          variant="outline"
          className="justify-start h-auto py-3 px-4 hover:bg-primary/5 transition-colors"
          asChild
        >
          <Link href="/admin/ticket-templates">
            <div className="flex items-center gap-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0">
                <IconTicket className="size-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Design Ticket</div>
                <div className="text-xs text-muted-foreground">
                  Create new ticket template
                </div>
              </div>
            </div>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
