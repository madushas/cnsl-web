"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";

interface AboutClientProps {
  readonly aboutContent: {
    readonly mission: { readonly statement: string };
    readonly highlights: ReadonlyArray<{
      readonly stat: string;
      readonly label: string;
      readonly description: string;
    }>;
    readonly timeline: ReadonlyArray<{
      readonly year: string;
      readonly title: string;
      readonly description: string;
    }>;
    readonly team: ReadonlyArray<{
      readonly name: string;
      readonly role: string;
      readonly bio: string;
      readonly image?: string;
    }>;
  };
}

export default function AboutClient({ aboutContent }: AboutClientProps) {
  const [expandedTeamMember, setExpandedTeamMember] = useState<string | null>(null);

  return (
    <>
      {/* Mission Section */}
      <div className="mb-20">
        <Card className="bg-muted border-border">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-3xl font-bold text-center text-foreground mb-6">Our Mission</h3>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto text-center">
              {aboutContent.mission.statement}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Highlights Grid */}
      <div className="mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {aboutContent.highlights.map((highlight) => (
            <Card key={`${highlight.stat}-${highlight.label}`} className="text-center border-border hover:border-primary transition-colors duration-300">
              <CardContent className="pt-6 pb-6">
                <div className="text-4xl font-bold text-primary mb-2">{highlight.stat}</div>
                <div className="text-lg font-semibold text-foreground mb-2">{highlight.label}</div>
                <div className="text-sm text-muted-foreground">{highlight.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-20">
        <h3 className="text-3xl font-bold text-center text-foreground mb-12">Our Journey</h3>
        <div className="space-y-8">
          {aboutContent.timeline.map((item) => (
            <Card key={item.year} className="border-border hover:border-primary transition-colors duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-lg px-4 py-2 bg-primary text-primary-foreground">
                    {item.year}
                  </Badge>
                  <CardTitle className="text-xl text-foreground">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div>
        <h3 className="text-3xl font-bold text-center text-foreground mb-12">Our Community</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {aboutContent.team.map((member) => (
            <Card 
              key={member.name} 
              className="border-border hover:border-primary transition-colors duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground">{member.name}</CardTitle>
                    <Badge variant="secondary" className="mt-2">{member.role}</Badge>
                  </div>
                  <Button
                    onClick={() => setExpandedTeamMember(
                      expandedTeamMember === member.name ? null : member.name
                    )}
                    variant="ghost"
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-expanded={expandedTeamMember === member.name}
                    aria-label={`${expandedTeamMember === member.name ? 'Collapse' : 'Expand'} details for ${member.name}`}
                  >
                    {expandedTeamMember === member.name ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedTeamMember === member.name && (
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
