"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Mail, Scan, ExternalLink } from "lucide-react";

type Props = {
  slug: string;
};

export default function EventRSVPsCommunications({ slug }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Communications</CardTitle>
          <CardDescription>
            Send emails to attendees using the email builder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Link href={`/admin/events/${slug}/email`} className="block">
              <div className="border rounded-lg p-6 hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Email Builder</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Create and send custom emails to attendees with filters and
                  templates
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span>Open Email Builder</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
              </div>
            </Link>

            <Link href={`/admin/events/${slug}/scan`} className="block">
              <div className="border rounded-lg p-6 hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Scan className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">QR Scanner</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Scan attendee QR codes for quick check-in and checkpoint
                  marking
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <span>Open Scanner</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common communication tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Use the Email Builder to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 ml-4">
            <li>• Send approval notifications to pending RSVPs</li>
            <li>• Send event reminders to confirmed attendees</li>
            <li>• Send thank you emails after the event</li>
            <li>• Send custom announcements with filters</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
