import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { InitiativesSection } from "@/components/initiatives-section";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function InitiativesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="container mx-auto px-4 section-spacing">
          <h1 className="text-h2 text-foreground">Our Initiatives</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Explore CNSL Connect mentorship, University Outreach, and Monthly
            Meetups. These programs create pathways for learning, collaboration,
            and career growth across Sri Lanka.
          </p>
        </section>
        <InitiativesSection />

        {/* Why these initiatives */}
        <section className="container mx-auto px-4 pb-20">
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card card-padding">
              <h3 className="text-h4 text-foreground">Hands-on Learning</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Workshops, mentorship, and meetups focused on practical
                outcomes.
              </p>
            </Card>
            <Card className="border-border bg-card card-padding">
              <h3 className="text-h4 text-foreground">Community & Network</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect with mentors, peers, and hiring partners across the
                island.
              </p>
            </Card>
            <Card className="border-border bg-card card-padding">
              <h3 className="text-h4 text-foreground">Pathways to Impact</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Contribute to open-source, speak at meetups, and mentor others.
              </p>
            </Card>
          </div>
        </section>

        {/* Asymmetric Visual Storytelling */}
        <section className="container mx-auto px-4 pb-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Mosaic (Right on desktop) */}
            <div className="order-2 lg:order-2 lg:col-span-7">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 overflow-hidden rounded-2xl border border-border relative h-64">
                  <Image
                    src="/cnsl-placeholder.svg"
                    alt="Workshop hands-on"
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover"
                  />
                </div>
                <div className="col-span-6 overflow-hidden rounded-2xl border border-border relative h-40">
                  <Image
                    src="/cnsl-placeholder.svg"
                    alt="Mentorship"
                    fill
                    sizes="(max-width: 1024px) 50vw, 350px"
                    className="object-cover"
                  />
                </div>
                <div className="col-span-6 overflow-hidden rounded-2xl border border-border relative h-40">
                  <Image
                    src="/cnsl-placeholder.svg"
                    alt="Community networking"
                    fill
                    sizes="(max-width: 1024px) 50vw, 350px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Content (Left on desktop) */}
            <div className="order-1 lg:order-1 lg:col-span-5">
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400 border border-blue-500/20">
                How it connects
              </span>
              <h2 className="mt-3 text-h2 text-foreground">
                Programs that ladder up to outcomes
              </h2>
              <p className="mt-3 text-muted-foreground">
                Each initiative complements the others: mentorship accelerates
                learning, university outreach grows the pipeline, and monthly
                meetups showcase progress and open doors. Together, they create
                pathways from interest to impact.
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-border bg-card card-padding-sm">
                  <div className="text-sm font-semibold text-foreground">
                    CNSL Connect
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cohort-based mentorship with showcases.
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card card-padding-sm">
                  <div className="text-sm font-semibold text-foreground">
                    University Outreach
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Labs, workshops, and campus talks.
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card card-padding-sm">
                  <div className="text-sm font-semibold text-foreground">
                    Monthly Meetups
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Talks, panels, and networking across cities.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export const dynamic = "force-static";
