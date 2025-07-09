"use client";

import {
  Heart,
  Users,
  Clock,
  Award,
  Target,
  CheckCircle,
  ArrowRight,
  Calendar,
  Star,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConnectMentorship() {
  const programFeatures = [
    {
      icon: Clock,
      title: "6-Month Program",
      description:
        "Comprehensive mentorship journey connecting mentees with industry experts.",
    },
    {
      icon: Users,
      title: "One-on-One Mentoring",
      description:
        "Personalized guidance from experienced DevOps and cloud-native professionals.",
    },
    {
      icon: Target,
      title: "DevOps & Cloud Native Focus",
      description:
        "Learn DevOps practices, Kubernetes, containers, microservices, and cloud technologies.",
    },
    {
      icon: Award,
      title: "Career Growth",
      description:
        "Networking opportunities, hands-on learning, and career advancement support.",
    },
  ];

  const benefits = [
    "Hands-on learning with real-world projects",
    "Networking opportunities with industry professionals",
    "Career growth and development guidance",
    "Access to exclusive workshops and events",
    "Portfolio development and review",
    "Interview preparation and job search support",
    "Certificate of completion",
    "Lifetime access to CNSL community",
  ];

  const timeline = [
    {
      phase: "Mentor Registration",
      date: "October 20, 2024",
      status: "Open",
      description:
        "Industry experts can apply to become mentors in the CNSL Connect program",
    },
    {
      phase: "Mentee Applications",
      date: "November 13, 2024",
      status: "Coming Soon",
      description:
        "Aspiring developers can apply to join the 6-month mentorship program",
    },
    {
      phase: "Program Kickoff",
      date: "October 1, 2025",
      status: "Upcoming",
      description: "Official launch event introducing mentors and mentees",
    },
  ];

  const successStories = [
    {
      quote:
        "CNSL Connect helped me transition to a DevOps role and advance my career significantly.",
      author: "Past Mentee",
      role: "DevOps Engineer",
      company: "Tech Company",
    },

    {
      quote:
        "The mentorship program provided me with hands-on experience and valuable industry connections.",
      author: "Program Graduate",
      role: "Cloud Engineer",
      company: "Startup",
    },

    {
      quote:
        "Through CNSL Connect, I gained the skills and confidence needed to land my dream job.",
      author: "Former Mentee",
      role: "Platform Engineer",
      company: "Enterprise",
    },
  ];

  return (
    <section
      id="mentorship"
      className="py-20 bg-background"
      aria-labelledby="mentorship-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-20">
          <h2
            id="mentorship-title"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6"
          >
            CNSL <span className="text-primary">Connect</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            A 6-month program connecting mentees with industry experts to learn
            DevOps and cloud-native technologies.
          </p>

          <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Calendar aria-hidden="true" className="h-4 w-4 mr-2" />
            Applications open November 13, 2024
          </div>
        </header>

        {/* Program Overview */}
        <section aria-labelledby="overview-title" className="mb-20">
          <div className="text-center mb-12">
            <h3
              id="overview-title"
              className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
            >
              Program Overview
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              CNSL Connect is designed to bridge the gap between learning and
              real-world application in cloud-native technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 sm:gap-8">
            {programFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
          <Card
            key={feature.title}
            className="text-center bg-card border-border hover:border-primary transition-all duration-300"
          >
            <CardHeader>
              <div className="mx-auto mb-0 md:mb-4 p-3 bg-primary/10 rounded-lg text-primary w-fit">
                <IconComponent aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <CardTitle className="text-lg sm:text-xl text-foreground">
                {feature.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
              );
            })}
          </div>
        </section>

        {/* Application Timeline */}

        <section aria-labelledby="timeline-title" className="mb-20">
          <h3
            id="timeline-title"
            className="text-3xl font-bold text-center text-foreground mb-12"
          >
            Application Process
          </h3>
          <div className="max-w-4xl mx-auto space-y-8">
            {timeline.map((phase) => (
              <Card
                key={phase.phase}
                className="flex flex-col md:flex-row items-center bg-card border-border"
              >
                <div className="p-6 w-full md:w-1/4 text-center md:text-left border-b md:border-b-0 md:border-r">
                  <Badge
                    variant={phase.status === "Open" ? "default" : "secondary"}
                  >
                    {phase.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">
                    {phase.date}
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <CardTitle className="text-xl mb-2">{phase.phase}</CardTitle>

                  <CardDescription>{phase.description}</CardDescription>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits & Success Stories */}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-20">
          {/* Benefits */}

          <section aria-labelledby="benefits-title" className="lg:col-span-3">
            <h3
              id="benefits-title"
              className="text-3xl font-bold text-foreground mb-8"
            >
              Program Benefits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center space-x-3">
                  <CheckCircle
                    aria-hidden="true"
                    className="h-5 w-5 text-secondary shrink-0"
                  />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Success Stories */}
          <section
            aria-labelledby="success-stories-title"
            className="lg:col-span-2"
          >
            <h3
              id="success-stories-title"
              className="text-3xl font-bold text-foreground mb-8"
            >
              Success Stories
            </h3>
            <div className="space-y-8">
              {successStories.map((story) => (
                <Card
                  key={story.author}
                  className="bg-muted border-l-4 border-primary"
                >
                  <CardContent className="p-6">
                    <div
                      className="flex mb-2"
                      role="img"
                      aria-label="5 out of 5 stars"
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          aria-hidden="true"
                          className="h-5 w-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>

                    <blockquote className="text-foreground italic mb-4">
                      &ldquo;{story.quote}&rdquo;
                    </blockquote>

                    <div>
                      <p className="font-semibold text-foreground">
                        {story.author}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {story.role} at {story.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Call to Action */}

        <section className="text-center">
          <div className="bg-primary p-8 md:p-12 rounded-2xl text-primary-foreground">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Transform Your Career?
            </h3>

            <p className="text-base md:text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join CNSL Connect and take the next step in your cloud-native
              journey with expert mentorship and hands-on learning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-background text-primary hover:bg-background/90 font-semibold shadow-lg"
                asChild
              >
                <Link href="/contact">
                  Apply for Mentorship
                  <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-primary hover:text-primary-foreground font-semibold shadow-lg"
                asChild
              >
                <Link href="/contact">
                  Become a Mentor
                  <Heart aria-hidden="true" className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
