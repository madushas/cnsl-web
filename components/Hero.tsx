import {
  ArrowRight,
  BookOpen,
  Calendar,
  MapPin,
  Pin,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DatabaseEvent } from "@/lib/types";

interface HeroProps {
  readonly featuredEvent?: DatabaseEvent | null;
}

export default function Hero({ featuredEvent = null }: HeroProps) {
  return (
    <section className="relative py-40 overflow-hidden bg-gradient-to-b from-white to-cyan-200/25">
      {/* Subtle Asymmetrical Background Shapes - Added pointer-events-none */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-2/3 bg-secondary/5 pointer-events-none" />

      {/* Container Network Visualization */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="400" height="200" className="opacity-10 pointer-events-none" aria-hidden="true">
          <title>Cloud Native Network Visualization</title>
          <circle cx="50" cy="50" r="20" className="fill-primary" />
          <circle cx="200" cy="80" r="15" className="fill-secondary" />
          <circle cx="350" cy="60" r="18" className="fill-primary" />
          <circle cx="120" cy="150" r="12" className="fill-accent" />
          <circle cx="280" cy="140" r="16" className="fill-secondary" />
          <line x1="50" y1="50" x2="200" y2="80" className="stroke-primary" strokeWidth="2" opacity="0.4" />
          <line x1="200" y1="80" x2="350" y2="60" className="stroke-secondary" strokeWidth="2" opacity="0.4" />
          <line x1="200" y1="80" x2="120" y2="150" className="stroke-primary" strokeWidth="2" opacity="0.4" />
          <line x1="120" y1="150" x2="280" y2="140" className="stroke-secondary" strokeWidth="2" opacity="0.4" />
        </svg>
      </div>

      {/* Main content with higher z-index to ensure interactivity */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-16 relative z-20">
            <div className="inline-flex items-center space-x-2 bg-accent/20 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-ring/80">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Open For Outreach</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-7xl font-bold text-foreground leading-tight tracking-tight">
                Cloud Native
                <br />
                <span className="relative">
                  <span className="text-secondary">Sri Lanka</span>
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-secondary rounded-full" />
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Where DevOps meets community. Learn, build, and scale cloud-native applications with Sri Lanka&apos;s most active tech community.
              </p>
            </div>

            {/* Button container with explicit z-index and pointer-events */}
            <div className="flex flex-col sm:flex-row gap-4 relative z-30 pointer-events-auto">
              <Button 
                size="lg" 
                variant="default"
                className="transition-colors duration-200 relative z-30"
                asChild
              >
                <Link href="/about" className="pointer-events-auto">
                  Join Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="transition-colors duration-200 relative z-30"
                asChild
              >
                <Link href="/events" className="pointer-events-auto">View Events</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Interactive Cards */}
          <div className="relative z-20">
            <FeatureDisplay featuredEvent={featuredEvent} />
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center shadow-xl transform hover:rotate-12 transition-all duration-300 pointer-events-none z-40">
              <Pin className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FeatureDisplay = ({ featuredEvent }: HeroProps) => {
  if (featuredEvent) {
    return <EventCard event={featuredEvent} />;
  }
  return <CommunityFeatureCard />;
};

const EventCard = ({ event }: { event: DatabaseEvent }) => (
  <div className="bg-card/60 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 p-8 transform transition-all duration-300 hover:shadow-2xl relative z-20">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
        <Calendar className="h-6 w-6 text-foreground" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-card-foreground">Next Meetup</h3>
        <p className="text-muted-foreground font-medium">
          {new Date(event.eventDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
    <h4 className="text-lg font-semibold text-card-foreground mb-3">{event.title}</h4>
    <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">{event.description}</p>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-medium">
          {event.location || "Online"}
        </span>
      </div>
      <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 relative z-30">
        <Link href={`/events/${event.slug}`} className="pointer-events-auto">
          Register →
        </Link>
      </Button>
    </div>
  </div>
);

const CommunityFeatureCard = () => (
  <div className="bg-card/60 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 p-8 transform transition-all duration-300 hover:shadow-2xl relative overflow-hidden z-20">
    <div className="absolute inset-0 opacity-[0.03] [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)] pointer-events-none">
      <svg aria-hidden="true" className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70 pointer-events-none">
        <defs>
          <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse" x="50%" y="50%">
            <path d="M.5 71.5V.5H71.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid)" />
      </svg>
    </div>
    <div className="relative z-10">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
          <Users className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-card-foreground">Community Powered</h3>
          <p className="text-muted-foreground font-medium">Learn, Build, and Scale Together</p>
        </div>
      </div>
      <div className="space-y-4 my-8">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/20 text-primary"><Zap size={12} /></div>
          <span className="text-sm font-medium text-card-foreground">Hands-on Workshops & Meetups</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-secondary/20 text-secondary"><BookOpen size={12} /></div>
          <span className="text-sm font-medium text-card-foreground">Expert-led Mentorship Programs</span>
        </div>
      </div>
    </div>
  </div>
);