"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SignIn } from "@stackframe/stack";
import { Calendar, Users, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SignInPage() {
  const benefits = [
    {
      icon: Calendar,
      title: "Event Management",
      description: "RSVP to events and manage your registrations",
    },
    {
      icon: Ticket,
      title: "Digital Tickets",
      description: "Access and download your event tickets",
    },
    {
      icon: Users,
      title: "Community Access",
      description: "Connect with fellow developers and speakers",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left side - Sign in form */}
            <div className="order-2 lg:order-1">
              <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-6">
                  <h1 className="text-h2 mb-2">Welcome back</h1>
                  <p className="text-muted-foreground">
                    Sign in to access your dashboard and manage your RSVPs
                  </p>
                </div>
                <div className="p-6">
                  <SignIn />
                </div>
              </div>
            </div>

            {/* Right side - Benefits */}
            <div className="order-1 lg:order-2 space-y-6">
              <div>
                <h2 className="text-h3 mb-2">Why sign in?</h2>
                <p className="text-muted-foreground">
                  Get the most out of your CNSL experience with a free account
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <Card
                      key={benefit.title}
                      className="border-border shadow-card transition-card hover:shadow-card-hover"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">
                              {benefit.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">New to CNSL?</strong>{" "}
                    Create an account to start registering for events and
                    connecting with the community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export const dynamic = "force-static";
