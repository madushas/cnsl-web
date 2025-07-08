import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

import { events } from "@/lib/events-data";
import FeaturedEvents from "@/components/FeaturedEvents";
import { isPastEvent } from "@/lib/utils";
import RecentBlogs from "@/components/RecentBlogs";
import CommunityStats from "@/components/CommunityStats";

export default function Home() {
  // Get featured/upcoming events or empty array if none found
  // Sort events by date to find the next upcoming event
  const featuredEvent = 
    events.toSorted((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .find((event) => !isPastEvent(event)) ?? null;

  // Safety check for featured event
  if (!featuredEvent) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <Hero />
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero featuredEvent={featuredEvent} />
      <CommunityStats />  
      <FeaturedEvents event={featuredEvent} />
      <RecentBlogs />

      {/* Quick Overview Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Explore Our Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover events, connect with mentors, read our latest insights,
              and learn about our outreach programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Events</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Join our meetups, workshops, and conferences
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events">
                    View Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="text-center">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">CNSL Connect</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Connect with mentors and grow your career
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cnsl-connect">
                    Get Mentorship
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Blog</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Read tutorials, news, and community stories
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/blog">
                    Read Articles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">About Us</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Learn about our mission and community
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/about">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
