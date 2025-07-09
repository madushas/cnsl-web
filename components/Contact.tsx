"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Mail,
  MessageSquare,
  Users,
  ExternalLink,
  Send,
  RocketIcon,
  Users2,
} from "lucide-react";

import Link from "next/link";
import {
  FaceBookIcon,
  LinkedInIcon,
  MeetupIcon,
  TwitterIcon,
} from "./ui/SocialIcons";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Reset form
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);

    // In a real application, you would send the data to your backend
    alert("Thank you for your message! We&apos;ll get back to you soon.");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const socialLinks = [
    {
      name: "Twitter",
      url: "https://x.com/cloudnativesl",
      icon: TwitterIcon,
      description: "Follow for updates",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/90470053/",
      icon: LinkedInIcon,
      description: "Connect professionally",
    },
    {
      name: "Facebook",
      url: "https://web.facebook.com/CloudNativeSL/",
      icon: FaceBookIcon,
      description: "Join our community",
    },
    {
      name: "Meetup",
      url: "https://www.meetup.com/cloud-native-sri-lanka/",
      icon: MeetupIcon,
      description: "Attend our events",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-20 mt-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}

        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about our community, events, or mentorship program?
            We&apos;d love to hear from you!
          </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}

          <div className="lg:col-span-3">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail aria-hidden="true" className="h-6 w-6 text-primary" />
                  Send us a Message
                </CardTitle>

                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you within
                  24 hours.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>

                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                      aria-describedby="name-help"
                      autoComplete="name"
                      className="active:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                    <div id="name-help" className="sr-only">
                      Enter your full name for contact purposes
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      aria-describedby="email-help"
                      autoComplete="email"
                    />
                    <div id="email-help" className="sr-only">
                      Enter a valid email address for us to respond to your
                      message
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>

                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your interest in cloud-native technologies or ask any questions..."
                      rows={5}
                      required
                      aria-describedby="message-help"
                    />
                    <div id="message-help" className="sr-only">
                      Share your questions, feedback, or interest in
                      cloud-native technologies
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send aria-hidden="true" className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & Social Links */}

          <div className="lg:col-span-2 space-y-8">
            {/* Community CTAs */}

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users aria-hidden="true" className="h-6 w-6 text-primary" />
                  Join Our Community
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <Link
                  href="/cnsl-connect"
                  className="block p-4 bg-muted rounded-lg hover:bg-primary/10 transition-colors group"
                >
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary">
                    <Users2
                      aria-hidden="true"
                      className="h-5 w-5 inline-block mr-1"
                    />
                    CNSL Connect Mentorship
                  </h3>

                  <p className="text-muted-foreground text-sm">
                    Apply for our 6-month mentorship program.
                  </p>
                </Link>

                <Link
                  href="/events"
                  className="block p-4 bg-muted rounded-lg hover:bg-primary/10 transition-colors group"
                >
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary">
                    <RocketIcon
                      aria-hidden="true"
                      className="h-5 w-5 inline-block mr-1"
                    />
                    Upcoming Events
                  </h3>

                  <p className="text-muted-foreground text-sm">
                    Join our monthly meetups and workshops.
                  </p>
                </Link>
              </CardContent>
            </Card>

            {/* Social Media */}

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageSquare
                    aria-hidden="true"
                    className="h-6 w-6 text-primary"
                  />
                  Connect With Us
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-5 w-5 text-muted-foreground group-hover:text-primary"
                        />

                        <div className="flex-1">
                          <div className="font-medium text-foreground group-hover:text-primary">
                            {social.name}
                          </div>
                        </div>

                        <ExternalLink
                          aria-hidden="true"
                          className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary"
                        />
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
