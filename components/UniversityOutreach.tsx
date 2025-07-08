"use client";

import {
  GraduationCap,
  BookOpen,
  Award,
  School,
  TrendingUp,
} from "lucide-react";

import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

export default function UniversityOutreach() {
  const { ref: sectionRef, isIntersecting } =
    useIntersectionObserver<HTMLDivElement>({
      threshold: 0.1,

      triggerOnce: true,
    });

  const programs = [
    {
      icon: BookOpen,

      title: "Introduction to Cloud Native",

      description:
        "Foundational sessions covering containers, microservices, and cloud computing basics.",

      duration: "2-3 hours",

      format: "Interactive Workshop",
    },

    {
      icon: Award,

      title: "Hands-on Labs",

      description:
        "Practical exercises with Docker, Kubernetes, and deployment strategies.",

      duration: "4-6 hours",

      format: "Lab Session",
    },

    {
      icon: TrendingUp,

      title: "Career Guidance",

      description:
        "Industry insights, career paths, and job market trends in cloud technologies.",

      duration: "1-2 hours",

      format: "Panel Discussion",
    },
  ];

  const benefits = [
    "Hands-on experience with cutting-edge technologies",

    "Industry exposure and networking opportunities",

    "Career guidance from experienced professionals",

    "Free access to learning resources and materials",

    "Certification preparation support",

    "CNSL Connect program eligibility",
  ];

  const stats = [
    { value: "3", label: "Universities Visited" },

    { value: "295+", label: "Students Reached" },

    { value: "25+", label: "Sessions Conducted" },

    { value: "15+", label: "Industry Speakers" },
  ];

  const getTransitionStyles = (index: number) => ({
    transition: `opacity 0.5s ease-out ${
      index * 100
    }ms, transform 0.5s ease-out ${index * 100}ms`,

    opacity: isIntersecting ? 1 : 0,

    transform: isIntersecting ? "translateY(0)" : "translateY(20px)",
  });

  return (
    <section
      ref={sectionRef}
      id="university-outreach"
      className="py-20 bg-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}

        <header className="text-center mb-20" style={getTransitionStyles(0)}>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            University <span className="text-primary">Outreach</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Bridging the gap between academia and industry by bringing cloud
            native technologies directly to university campuses across Sri
            Lanka.
          </p>
        </header>

        {/* Stats Section */}

        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center"
                style={getTransitionStyles(index + 1)}
              >
                <div className="text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>

                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Programs Section */}

        <div className="mb-20">
          <h3
            className="text-3xl font-bold text-foreground text-center mb-12"
            style={getTransitionStyles(5)}
          >
            Our Programs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card
                key={program.title}
                className="group bg-card border-border hover:border-primary transition-all duration-300"
                style={getTransitionStyles(index + 6)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      <program.icon aria-hidden="true" className="h-6 w-6" />
                    </div>

                    <CardTitle className="text-lg font-semibold text-foreground">
                      {program.title}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="leading-relaxed">
                    {program.description}
                  </CardDescription>

                  <div className="flex justify-between items-center text-sm">
                    <Badge variant="secondary">{program.format}</Badge>

                    <span className="text-muted-foreground">
                      Duration: {program.duration}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits & Partnerships Section */}

        <div className="bg-muted rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Benefits */}

            <div style={getTransitionStyles(9)}>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <GraduationCap
                  aria-hidden="true"
                  className="h-6 w-6 text-primary mr-3"
                />
                Student Benefits
              </h3>

              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 shrink-0" />

                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partnership Info */}

            <div className="space-y-6" style={getTransitionStyles(10)}>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                <School
                  aria-hidden="true"
                  className="h-6 w-6 text-primary mr-3"
                />
                Partnership Opportunities
              </h3>

              <Card className="border-l-4 border-primary bg-background">
                <CardContent className="pt-6">
                  <CardTitle className="text-lg font-semibold mb-2">
                    For Universities
                  </CardTitle>

                  <CardDescription className="leading-relaxed">
                    Partner with us to enhance your curriculum with
                    industry-relevant cloud native technologies and provide
                    students with practical experience.
                  </CardDescription>
                </CardContent>
              </Card>

              <div className="pt-4">
                <Button size="lg" className="w-full md:w-auto">
                  Request a University Visit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
