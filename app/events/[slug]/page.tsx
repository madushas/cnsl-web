import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { events } from '@/lib/events-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ExternalLink, 
  ArrowLeft,
  Award,
  Target,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DatabaseEvent, Speaker } from '@/lib/types';
import { isPastEvent, cn } from '@/lib/utils';
import { GitHubIcon, LinkedInIcon, TwitterIcon } from '@/components/ui/SocialIcons';

export async function generateStaticParams() {
  return events.map((event: DatabaseEvent) => ({ slug: event.slug }));
}

export default async function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const event = events.find((e: DatabaseEvent) => e.slug === slug);
  if (!event) return notFound();

  const speakerDetails = event.speakerDetails || [];

  const getAttendanceText = () => {
    if (isPastEvent(event)) return `${event.currentAttendees} attended`;
    if (event.maxAttendees) return `Up to ${event.maxAttendees} attendees`;
    return 'Open registration';
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-muted/30 py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
          {/* Event Image */}
          <div className="relative w-full md:w-1/2 h-64 md:h-80 overflow-hidden rounded-lg shadow-lg">
            <Image
              src={event.imageUrl || '/events/default.jpg'}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Event Details */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground border-none capitalize text-sm">
                {event.eventType}
              </Badge>
              <Badge
                className={cn(
                  'border-none capitalize text-white text-sm',
                  {
                    'bg-green-600': event.difficulty === 'beginner',
                    'bg-yellow-600': event.difficulty === 'intermediate',
                    'bg-red-600': event.difficulty === 'advanced',
                    'bg-gray-600': !['beginner', 'intermediate', 'advanced'].includes(
                      event.difficulty ?? ''
                    ),
                  }
                )}
              >
                {event.difficulty}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.title}</h1>
            <p className="text-muted-foreground text-lg">{event.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              <time dateTime={event.eventDate}>{event.eventDate}</time>
              <span className="text-muted-foreground/60">•</span>
              <Clock className="h-5 w-5 text-primary" />
              <span>{event.eventTime}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Button variant="outline" asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Events
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.longDescription || event.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  What You&apos;ll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.topics?.map((topic: string) => (
                    <Badge key={topic} variant="secondary" className="text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {speakerDetails.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    About the Speakers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {speakerDetails.map((speaker: Speaker) => (
                      <div key={speaker.id} className="flex flex-col items-center text-center">
                        <Image
                          src={speaker.image}
                          alt={speaker.name}
                          width={96}
                          height={96}
                          className="rounded-full object-cover border-4 border-primary/20"
                        />
                        <h3 className="text-xl font-bold mt-4">{speaker.name}</h3>
                        <p className="text-primary font-semibold">
                          {speaker.title} at {speaker.company}
                        </p>
                        <p className="text-muted-foreground mt-2">{speaker.bio}</p>
                        <div className="flex gap-4 mt-4">
                          {speaker.social.linkedin && (
                            <Link
                              href={speaker.social.linkedin}
                              target="_blank"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <LinkedInIcon className="h-5 w-5" />
                            </Link>
                          )}
                          {speaker.social.github && (
                            <Link
                              href={speaker.social.github}
                              target="_blank"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <GitHubIcon className="h-5 w-5" />
                            </Link>
                          )}
                          {speaker.social.twitter && (
                            <Link
                              href={speaker.social.twitter}
                              target="_blank"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <TwitterIcon className="h-5 w-5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Event Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Image
                      key={index}
                      src={event.gallery?.[index] || '/events/default.jpg'}
                      alt={`Gallery image ${index + 1}`}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            {!isPastEvent(event) && event.registrationUrl && (
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Register for this Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-white text-primary hover:bg-background text-lg py-6"
                    asChild
                  >
                    <Link href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                      Secure Your Spot
                      <ExternalLink className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <p className="text-center text-sm text-primary-foreground/80 mt-3">
                    Registration is free and open to all!
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">Date & Time</div>
                    <div className="text-muted-foreground">
                      {event.eventDate} at {event.eventTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">Location</div>
                    <div className="text-muted-foreground">{event.location}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">Attendance</div>
                    <div className="text-muted-foreground">{getAttendanceText()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
