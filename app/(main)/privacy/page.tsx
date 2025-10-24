import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 section-spacing">
        <div className="max-w-3xl">
          <h1 className="text-h1 text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

          <p className="mt-6 text-muted-foreground">Cloud Native Sri Lanka (CNSL) respects your privacy. This policy describes what we collect, how we use it, and your choices.</p>

          <h2 className="mt-8 text-h4">Information We Collect</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>Account data: name, email, and profile image from your identity provider.</li>
            <li>Optional profile: LinkedIn, GitHub, website, company, title, and phone/WhatsApp.</li>
            <li>Event data: RSVPs, check-in timestamps, and ticket numbers.</li>
            <li>Technical data: IP address and device information for security and rate-limiting.</li>
          </ul>

          <h2 className="mt-8 text-h4">How We Use Your Information</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>To operate the platform and facilitate event registration and check-in.</li>
            <li>To communicate about events, updates, and community programs.</li>
            <li>To improve safety, detect abuse, and enforce our Code of Conduct.</li>
            <li>To generate anonymized insights about community engagement.</li>
          </ul>

          <h2 className="mt-8 text-h4">Sharing & Disclosure</h2>
          <p className="mt-3 text-muted-foreground">We do not sell your data. We may share limited information with:</p>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>Service providers (e.g., hosting, email delivery) under contractual obligations.</li>
            <li>Event co-organizers solely for event operations.</li>
            <li>Authorities when required by law or to protect safety.</li>
          </ul>

          <h2 className="mt-8 text-h4">Data Retention</h2>
          <p className="mt-3 text-muted-foreground">We retain your information as long as necessary for the purposes above, and delete or anonymize it when no longer needed.</p>

          <h2 className="mt-8 text-h4">Your Choices</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>Access and update your profile at any time on the <strong>Account</strong> page.</li>
            <li>Request data export or deletion by contacting us.</li>
            <li>Opt out of non-essential communications by using provided unsubscribe links.</li>
          </ul>

          <h2 className="mt-8 text-h4">Security</h2>
          <p className="mt-3 text-muted-foreground">We use appropriate technical and organizational measures (rate limiting, CSRF protections, role-based access) to protect your data. However, no system is 100% secure.</p>

          <h2 className="mt-8 text-h4">International Transfers</h2>
          <p className="mt-3 text-muted-foreground">Your data may be processed outside your country by our service providers, subject to appropriate safeguards.</p>

          <h2 className="mt-8 text-h4">Contact</h2>
          <p className="mt-3 text-muted-foreground">Questions or requests: <a href="mailto:hello@cloudnativesl.org" className="text-blue-400 hover:underline">hello@cloudnativesl.org</a></p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
