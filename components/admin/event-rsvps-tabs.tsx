"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CheckCircle, Mail, Download } from "lucide-react";
import EventRSVPsList from "./event-rsvps-list";
import EventRSVPsCheckpoints from "./event-rsvps-checkpoints";
import EventRSVPsCommunications from "./event-rsvps-communications";
import EventRSVPsImport from "./event-rsvps-import";

type Props = {
  slug: string;
  capacity: number;
  title: string;
  date?: Date;
  venue?: string;
};

export default function EventRSVPsTabs({ slug, capacity, title, date, venue }: Props) {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div>
        <h1 className="text-h2">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage RSVPs, checkpoints, and communications for this event
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">RSVP List</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
          <TabsTrigger value="checkpoints" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Checkpoints</span>
            <span className="sm:hidden">Check</span>
          </TabsTrigger>
          <TabsTrigger
            value="communications"
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
            <span className="sm:hidden">Email</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Import/Export</span>
            <span className="sm:hidden">Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <EventRSVPsList 
            slug={slug} 
            capacity={capacity} 
            title={title}
            date={date ? new Date(date).toLocaleDateString() : undefined}
            venue={venue || undefined}
          />
        </TabsContent>

        <TabsContent value="checkpoints" className="mt-6">
          <EventRSVPsCheckpoints slug={slug} />
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <EventRSVPsCommunications slug={slug} />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <EventRSVPsImport slug={slug} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
