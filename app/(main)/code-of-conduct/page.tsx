import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CodeOfConductPage() {
  const lastUpdated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 section-spacing">
        <div className="max-w-3xl">
          <h1 className="text-h1 text-foreground">Code of Conduct</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

          <p className="mt-6 text-muted-foreground">CNSL is a professional, inclusive community. We expect all participants to help create a welcoming, safe environment for everyone regardless of gender identity, sexual orientation, disability, neurotype, physical appearance, body size, race, ethnicity, religion (or lack thereof), or technology choices.</p>

          <h2 className="mt-8 text-h4">Expected Behavior</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>Be respectful, considerate, and constructive.</li>
            <li>Use inclusive language and be mindful of different backgrounds.</li>
            <li>Help newcomers; share knowledge generously.</li>
            <li>Comply with event staff instructions and venue policies.</li>
          </ul>

          <h2 className="mt-8 text-h4">Unacceptable Behavior</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>Harassment, discrimination, or derogatory comments.</li>
            <li>Intimidation, stalking, or unwanted sexual attention.</li>
            <li>Disruptive or unsafe behavior; recording/photography where prohibited.</li>
            <li>Doxxing, spamming, or commercial solicitation without consent.</li>
          </ul>

          <h2 className="mt-8 text-h4">Reporting & Enforcement</h2>
          <p className="mt-3 text-muted-foreground">If you experience or witness a violation, please report it to organizers immediately (in person or via <a href="/contact" className="text-blue-400 hover:underline">Contact</a> or email <a href="mailto:safety@cloudnativesl.org" className="text-blue-400 hover:underline">safety@cloudnativesl.org</a>).</p>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>Organizers may warn, remove, or ban participants at their discretion.</li>
            <li>We may contact venue security or law enforcement if needed.</li>
            <li>Serious or repeated violations may result in a long-term ban.</li>
          </ul>

          <h2 className="mt-8 text-h4">Scope</h2>
          <p className="mt-3 text-muted-foreground">This policy applies to all CNSL spaces—events, online platforms, and affiliated gatherings—both during and outside official activities.</p>

          <h2 className="mt-8 text-h4">Attribution</h2>
          <p className="mt-3 text-muted-foreground">Inspired by best practices from open-source communities and conferences. We welcome suggestions to improve this policy.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
