import { PartnersCarousel } from "@/components/partners-carousel"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"
import Link from "next/link"

export function PartnersSection() {
  const partners = [
    { name: "CNCF", category: "Foundation", logo: "/logos/cncf-gray.svg" },
    { name: "Amazon Web Services", category: "Cloud Partner", logo: "/logos/aws-gray.svg" },
    { name: "Google Cloud", category: "Cloud Partner", logo: "/logos/gcp-gray.svg" },
    { name: "Microsoft Azure", category: "Cloud Partner", logo: "/logos/azure-gray.svg" },
    { name: "University of Colombo", category: "Education", logo: "/logos/uoc-gray.svg" },
    { name: "University of Moratuwa", category: "Education", logo: "/logos/uom-gray.svg" },
    { name: "WSO2", category: "Industry Partner", logo: "/logos/wso2-gray.svg" },
    { name: "99x", category: "Industry Partner", logo: "/logos/99x-gray.svg" },
  ]

  return (
    <section className="w-full section-spacing">
      <Reveal className="container mx-auto px-4 mb-12 text-center">
        <h2 className="mb-4 text-h2 text-foreground">Our Valued Partners</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Working together to build a thriving cloud-native ecosystem in Sri Lanka
        </p>
      </Reveal>

      {/* Full-bleed carousel */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <PartnersCarousel items={partners} />
      </div>

      {/* Partner CTA */}
      <div className="mt-16 text-center">
        <Reveal>
        <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-8 py-8 max-w-2xl shadow-card transition-card">
          <h3 className="text-h3 text-foreground">Become a Partner</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Join us in empowering Sri Lanka’s tech community. Partner with CNSL to support education, mentorship, and innovation.
          </p>
          <Button asChild>
            <Link href="/contact" className="gap-2">
              Partner With Us
            </Link>
          </Button>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
