import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { Reveal } from "@/components/reveal"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-blue-950/10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="container relative mx-auto px-4 section-spacing-lg">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400 border border-blue-500/20">
              <Sparkles className="h-4 w-4" />
              <span>Join Sri Lanka’s Premier Tech Community</span>
            </div>

            <h1 className="text-h1 leading-tight text-foreground">
              Connecting Sri Lanka’s <span className="text-blue-400">Future Tech Leaders</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Join CNSL to connect with industry experts, attend hands-on workshops, and accelerate your cloud-native journey.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="group bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 rounded-lg px-8"
              >
                <Link href="/contact" aria-label="Join the CNSL community">
                  Join the Community
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-lg border-2 border-blue-500/50 bg-transparent text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 transition-all px-8"
              >
                <Link href="/events" aria-label="Register for the next CNSL meetup">
                  Register for Next Meetup
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div>
                <div className="text-3xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Events Hosted</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">20+</div>
                <div className="text-sm text-muted-foreground">Partner Companies</div>
              </div>
            </div>
          </Reveal>

          <Reveal className="flex justify-center lg:justify-end" delay={100}>
            <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl ring-1 ring-white/10">
              <Image
                src="/3d-interlocking-rings-abstract-sculpture-grayscale.jpg"
                alt="3D interlocking rings representing connection and collaboration"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
                priority
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
