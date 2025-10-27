import { GraduationCap, Users, Calendar, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import Link from "next/link";

const initiatives = [
  {
    icon: Users,
    title: "CNSL Connect",
    subtitle: "Mentorship Program",
    description:
      "Learn directly from industry mentors. Connect with experienced professionals who guide you through your tech journey.",
    link: "/programs/cnsl-connect",
  },
  {
    icon: GraduationCap,
    title: "University Outreach",
    subtitle: "Campus Programs",
    description:
      "Workshops, hackathons, and awareness sessions across campuses. Bringing tech education to students nationwide.",
    link: "/programs/university-outreach",
  },
  {
    icon: Calendar,
    title: "Monthly Meetups",
    subtitle: "Community Events",
    description:
      "Casual tech meetups every month with talks and networking. Build connections that last a lifetime.",
    link: "/events",
  },
];

export function InitiativesSection() {
  return (
    <section className="container mx-auto px-4 section-spacing">
      <Reveal className="mb-12 md:mb-16 text-center">
        <h2 className="mb-4 text-h2 text-foreground">Our Core Initiatives</h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Empowering Sri Lanka’s tech community through mentorship, education,
          and collaboration
        </p>
      </Reveal>

      <div className="grid gap-8 md:grid-cols-3">
        {initiatives.map((initiative, index) => (
          <Reveal key={initiative.title} delay={index * 60}>
            <Card className="group relative overflow-hidden bg-card border-border">
              <CardHeader className="relative">
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-4 border border-primary/20">
                  <initiative.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">
                  {initiative.title}
                </CardTitle>
                <div className="text-sm font-semibold text-primary/70">
                  {initiative.subtitle}
                </div>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-muted-foreground leading-relaxed mb-4">
                  {initiative.description}
                </CardDescription>
                <Button asChild variant="outline" className="gap-2">
                  <Link
                    href={initiative.link}
                    aria-label={`Learn more about ${initiative.title}`}
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
