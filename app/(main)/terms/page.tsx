import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 section-spacing">
        <div className="max-w-3xl">
          <h1 className="text-h1 text-foreground">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

          <p className="mt-6 text-muted-foreground">These Terms govern your use of the Cloud Native Sri Lanka (CNSL) website, events, and services. By using the platform, you agree to these Terms and our Privacy Policy.</p>

          <h2 className="mt-8 text-h4">Eligibility</h2>
          <p className="mt-3 text-muted-foreground">You must be at least the age of majority in your jurisdiction and capable of entering into a binding agreement. You agree to provide accurate information.</p>

          <h2 className="mt-8 text-h4">Accounts</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>You are responsible for maintaining the security of your account and for all activities under it.</li>
            <li>We may restrict access or terminate accounts for misuse, policy violations, or security concerns.</li>
          </ul>

          <h2 className="mt-8 text-h4">Acceptable Use</h2>
          <p className="mt-3 text-muted-foreground">You agree not to misuse the platform, including by attempting unauthorized access, spamming, scraping, or interfering with services. You agree to comply with our <a href="/code-of-conduct" className="text-blue-400 hover:underline">Code of Conduct</a>.</p>

          <h2 className="mt-8 text-h4">Event Participation</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>Registration does not guarantee admission; capacity is limited and selection may apply.</li>
            <li>We may modify, postpone, or cancel events due to circumstances beyond our control.</li>
          </ul>

          <h2 className="mt-8 text-h4">Content</h2>
          <p className="mt-3 text-muted-foreground">You are responsible for any content you submit. You grant CNSL a non-exclusive license to use content submitted in connection with events and community operations.</p>

          <h2 className="mt-8 text-h4">Third-Party Services</h2>
          <p className="mt-3 text-muted-foreground">We may integrate with third-party services (e.g., authentication, email, hosting). Your use of those services is subject to their terms.</p>

          <h2 className="mt-8 text-h4">Disclaimers</h2>
          <p className="mt-3 text-muted-foreground">The platform is provided “as is” without warranties of any kind. To the fullest extent permitted by law, CNSL disclaims all warranties, express or implied.</p>

          <h2 className="mt-8 text-h4">Limitation of Liability</h2>
          <p className="mt-3 text-muted-foreground">To the extent permitted by law, CNSL will not be liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>

          <h2 className="mt-8 text-h4">Governing Law</h2>
          <p className="mt-3 text-muted-foreground">These Terms are governed by the laws of Sri Lanka, without regard to conflict-of-law provisions. Disputes will be subject to the exclusive jurisdiction of courts located in Sri Lanka.</p>

          <h2 className="mt-8 text-h4">Changes</h2>
          <p className="mt-3 text-muted-foreground">We may update these Terms from time to time. We will post updates with a new effective date. Continued use constitutes acceptance.</p>

          <h2 className="mt-8 text-h4">Contact</h2>
          <p className="mt-3 text-muted-foreground">For questions, contact <a href="mailto:legal@cloudnativesl.org" className="text-blue-400 hover:underline">legal@cloudnativesl.org</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export const dynamic = 'force-static'
