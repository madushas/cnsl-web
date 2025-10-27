"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SignUp } from "@stackframe/stack";
import React from "react";
import { Sparkles, Zap, Shield, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const features = [
    {
      icon: Sparkles,
      title: "Quick Registration",
      description: "One-click RSVP for events once your profile is complete",
    },
    {
      icon: Zap,
      title: "Instant Updates",
      description: "Get notified about new events and important updates",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected and never shared without consent",
    },
    {
      icon: Heart,
      title: "Community First",
      description: "Join a vibrant community of developers and tech enthusiasts",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left side - Sign up form */}
            <div className="order-2 lg:order-1">
              <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-6">
                  <h1 className="text-h2 mb-2">Join CNSL</h1>
                  <p className="text-muted-foreground">
                    Create your free account to start attending events
                  </p>
                </div>
                <div className="p-6">
                  <SignUp
                    fullPage={false}
                    automaticRedirect={true}
                    firstTab="password"
                    extraInfo={
                      <p className="text-xs text-muted-foreground">
                        By signing up, you agree to our{" "}
                        <a className="text-primary hover:underline" href="/terms">
                          Terms
                        </a>{" "}
                        and{" "}
                        <a className="text-primary hover:underline" href="/privacy">
                          Privacy Policy
                        </a>
                        .
                      </p>
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right side - Features */}
            <div className="order-1 lg:order-2 space-y-6">
              <div>
                <h2 className="text-h3 mb-2">Start your journey</h2>
                <p className="text-muted-foreground">
                  Join hundreds of developers in Sri Lanka's premier cloud native community
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card
                      key={feature.title}
                      className="border-border shadow-card"
                    >
                      <CardContent className="p-5">
                        <div className="mb-3 rounded-lg bg-primary/10 p-2.5 w-fit">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1.5 text-sm">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-success" />
                    Free Forever
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    CNSL is a community-driven initiative. All our events and
                    resources are completely free for everyone.
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
