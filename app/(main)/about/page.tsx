import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Linkedin, Twitter, Github, Globe } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { db, schema } from "@/db"
import { eq } from "drizzle-orm"

export const revalidate = 60


export const dynamic = 'force-static'
export default async function AboutPage() {
  const [organizers, advisors] = await Promise.all([
    db.select().from(schema.people).where(eq(schema.people.category, 'organizer')),
    db.select().from(schema.people).where(eq(schema.people.category, 'advisor')),
  ])
  const people = { organizers, advisors }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 pt-12 pb-20 space-y-20">
        {/* Hero */}
        <section className="max-w-4xl">
          <Reveal>
            <h1 className="text-h1 text-foreground">Cloud Native Sri Lanka</h1>
            <p className="mt-5 text-xl text-muted-foreground leading-relaxed">
              A volunteer-driven community recognized by CNCF. We bring together students, professionals, and researchers to learn,
              share, and build a strong cloud-native ecosystem in Sri Lanka.
            </p>
          </Reveal>
        </section>

        {/* Who we are */}
        <section className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              Create a thriving local community where practitioners and learners can grow, collaborate, and contribute to the global
              cloud-native ecosystem.
            </CardContent>
          </Card>
          </Reveal>
          <Reveal delay={60}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              Establish Sri Lanka as a recognized hub for cloud-native expertise in South Asia, contributing talent and innovation to the
              global landscape.
            </CardContent>
          </Card>
          </Reveal>
        </section>

        {/* What we do */}
        <section className="space-y-6">
          <h2 className="text-h2 text-foreground">What we do</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Monthly Meetups", d: "Talks, panels, and networking across cities." },
              { t: "CNSL Connect", d: "Mentorship cohorts for practical career growth." },
              { t: "University Outreach", d: "Campus sessions, workshops, and hackathons." },
              { t: "Open Source", d: "Encouraging contributions and collaboration." },
            ].map((x) => (
              <Card key={x.t} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-foreground">{x.t}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{x.d}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Visual story */}
        <section className="space-y-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Mosaic */}
            <Reveal className="order-2 lg:order-1 lg:col-span-7">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 overflow-hidden rounded-2xl border border-border relative h-64">
                  <Image src="/cnsl-placeholder.svg" alt="Community meetup" fill sizes="(max-width: 1024px) 100vw, 700px" className="object-cover" />
                </div>
                <div className="col-span-6 overflow-hidden rounded-2xl border border-border relative h-40">
                  <Image src="/cnsl-placeholder.svg" alt="Hands-on workshop" fill sizes="(max-width: 1024px) 50vw, 350px" className="object-cover" />
                </div>
                <div className="col-span-6 overflow-hidden rounded-2xl border border-border relative h-40">
                  <Image src="/cnsl-placeholder.svg" alt="Mentor-mentee discussion" fill sizes="(max-width: 1024px) 50vw, 350px" className="object-cover" />
                </div>
              </div>
            </Reveal>

            {/* Narrative */}
            <Reveal className="order-1 lg:order-2 lg:col-span-5" delay={80}>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400 border border-blue-500/20">Our story</span>
              <h2 className="mt-3 text-h2 text-foreground">A community built on learning and contribution</h2>
              <p className="mt-3 text-muted-foreground">
                We started with a vision to make cloud-native knowledge accessible, actionable, and impactful. Our meetups and mentorship
                cohorts help members grow skills, showcase projects, and connect with opportunities.
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-border bg-card card-padding-sm">
                  <div className="text-sm font-semibold text-foreground">Inclusive</div>
                  <div className="text-sm text-muted-foreground">Open to students, professionals, and researchers.</div>
                </div>
                <div className="rounded-xl border border-border bg-card card-padding-sm">
                  <div className="text-sm font-semibold text-foreground">Hands-on</div>
                  <div className="text-sm text-muted-foreground">Workshops, labs, and demos to build real skills.</div>
                </div>
                <div className="rounded-xl border border-border bg-card card-padding-sm">
                  <div className="text-sm font-semibold text-foreground">Outcome-focused</div>
                  <div className="text-sm text-muted-foreground">Talks, showcases, and partner connections.</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Programs snapshot */}
        <section className="space-y-4">
          <h2 className="text-h2 text-foreground">Programs</h2>
          <p className="text-muted-foreground max-w-3xl">Explore our core initiatives designed for impact.</p>
          <div>
            <Link href="/initiatives" className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              View Initiatives
            </Link>
          </div>
        </section>

        {/* Impact band */}
        <section className="rounded-3xl border border-border bg-card card-padding-lg">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { n: "500+", l: "Participants engaged" },
              { n: "25+", l: "Meetups & workshops" },
              { n: "40+", l: "Mentor/mentee matches" },
            ].map((x) => (
              <div key={x.l} className="text-center">
                <div className="text-4xl font-bold text-foreground">{x.n}</div>
                <div className="text-sm text-muted-foreground">{x.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Community structure */}
        <section className="space-y-4">
          <h2 className="text-h2 text-foreground">Community structure</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Core Organizers", d: "Lead initiatives, events, and partnerships." },
              { t: "Volunteers", d: "Operations, logistics, content, and outreach." },
              { t: "Mentors", d: "Guide mentees through structured mentorship." },
              { t: "Members", d: "Open to anyone interested in cloud-native tech." },
            ].map((x) => (
              <Card key={x.t} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-foreground">{x.t}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{x.d}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Future plans */}
        <section className="space-y-4">
          <h2 className="text-h2 text-foreground">Future plans</h2>
          <ul className="grid gap-3 text-muted-foreground md:grid-cols-2">
            <li>Bi-annual CNSL Connect cohorts with showcases.</li>
            <li>Certification support groups (CKA, CKAD, CKS).</li>
            <li>Annual Sri Lanka Cloud Native Summit.</li>
            <li>Deeper university and industry partnerships.</li>
            <li>Open-source contribution drives.</li>
          </ul>
        </section>

        {/* Organizers */}
        <section className="space-y-6">
          <h2 className="text-h2 text-foreground">Organizers</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {people.organizers.map((p: any) => (
              <Card key={p.name} className="border-border bg-card transition-card hover:shadow-card-hover">
                <CardContent className="card-padding flex flex-col items-center text-center gap-3">
                  <img src={p.photo || "/professional-headshot-placeholder.svg"} alt={p.name} className="h-20 w-20 rounded-full object-cover border-2 border-blue-500/20" />
                  <div>
                    <div className="font-semibold text-foreground">{p.name}</div>
                    <div className="text-sm text-blue-400">{p.role}</div>
                    <div className="text-xs text-muted-foreground">{[p.title, p.company].filter(Boolean).join(" @ ")}</div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {p.linkedin && (
                      <a href={p.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on LinkedIn`} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-muted-foreground hover:bg-blue-600 hover:text-white transition-quick">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {p.twitter && (
                      <a href={p.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on Twitter`} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-muted-foreground hover:bg-blue-600 hover:text-white transition-quick">
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on GitHub`} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-muted-foreground hover:bg-blue-600 hover:text-white transition-quick">
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} website`} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-muted-foreground hover:bg-blue-600 hover:text-white transition-quick">
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Advisors */}
        {(people.advisors || []).length > 0 && (
          <section className="space-y-6">
            <h2 className="text-h2 text-foreground">Advisors</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {people.advisors.map((p: any) => (
                <Card key={p.name} className="border-border bg-card transition-card hover:shadow-card-hover">
                  <CardContent className="card-padding flex flex-col items-center text-center gap-3">
                    <img src={p.photo || "/professional-headshot-placeholder.svg"} alt={p.name} className="h-20 w-20 rounded-full object-cover border-2 border-blue-500/20" />
                    <div>
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-sm text-blue-400">{p.role}</div>
                      <div className="text-xs text-muted-foreground">{[p.title, p.company].filter(Boolean).join(" @ ")}</div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {p.linkedin && (
                        <a href={p.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on LinkedIn`} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-muted-foreground hover:bg-blue-600 hover:text-white transition-quick">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {p.twitter && (
                        <a href={p.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on Twitter`} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-muted-foreground hover:bg-blue-600 hover:text-white transition-quick">
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {p.github && (
                        <a href={p.github} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on GitHub`} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-muted-foreground hover:bg-blue-600 hover:text-white transition-quick">
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} website`} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-muted-foreground hover:bg-blue-600 hover:text-white transition-quick">
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Get involved */}
        <section className="rounded-3xl border border-border bg-card card-padding-lg">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-h2 text-foreground">Get involved</h2>
              <p className="mt-2 text-muted-foreground">Speak, volunteer, mentor, or partner with CNSL.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Get Involved</Link>
              <Link href="/contact" className="inline-flex items-center rounded-lg border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-white/5">Contact</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
