import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Mic, Clock, Users, Sparkles } from "lucide-react"

export const metadata = {
  title: 'Speak at CNSL | Share Your Cloud Native Journey',
  description: 'Share your knowledge and experience with Sri Lanka\'s cloud-native community. Submit a talk proposal for our monthly meetups.',
}

export default function SpeakPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 section-spacing">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-h1 text-white mb-4">
            Share Your Cloud Native Journey
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have a story, project, or lesson learned to share? We'd love to hear from you. 
            Join our community of speakers at CNSL monthly meetups.
          </p>
        </div>

        {/* Talk Formats */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-h2 text-white text-center mb-8">Talk Formats</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-h4 text-white">Lightning Talk</h3>
              </div>
              <p className="text-body text-gray-400 mb-2">
                <span className="font-semibold text-white">10 minutes</span> — Quick insights, tips, or a single concept
              </p>
              <p className="text-sm text-gray-500">
                Perfect for beginners or busy professionals
              </p>
            </div>

            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-h4 text-white">Standard Talk</h3>
              </div>
              <p className="text-body text-gray-400 mb-2">
                <span className="font-semibold text-white">30 minutes</span> — Technical deep-dive, case study, or demo
              </p>
              <p className="text-sm text-gray-500">
                Our most common format
              </p>
            </div>

            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-h4 text-white">Workshop</h3>
              </div>
              <p className="text-body text-gray-400 mb-2">
                <span className="font-semibold text-white">60+ minutes</span> — Hands-on session with exercises
              </p>
              <p className="text-sm text-gray-500">
                Interactive learning experience
              </p>
            </div>
          </div>
        </div>

        {/* What We're Looking For */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-h2 text-white text-center mb-8">What We're Looking For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-primary pl-6 py-4">
              <h3 className="text-h4 text-white mb-2">Technical Topics</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Kubernetes, containers, and orchestration</li>
                <li>• CI/CD pipelines and DevOps practices</li>
                <li>• Cloud-native architecture patterns</li>
                <li>• Observability, monitoring, and logging</li>
                <li>• Security and best practices</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-6 py-4">
              <h3 className="text-h4 text-white mb-2">Experience Sharing</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Production war stories and lessons learned</li>
                <li>• Migration journeys (monolith → microservices)</li>
                <li>• Tool comparisons and recommendations</li>
                <li>• Career guidance and skill development</li>
                <li>• Open-source contribution experiences</li>
              </ul>
            </div>
          </div>
        </div>

        {/* The Process */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-h2 text-white text-center mb-8">The Process</h2>
          <div className="relative">
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border/30" />
            
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-right hidden md:block">
                  <h3 className="text-h4 text-white mb-2">1. Submit Proposal</h3>
                  <p className="text-gray-400">
                    Fill out the speaker form with your talk details
                  </p>
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1 md:hidden">
                  <h3 className="text-h4 text-white mb-2">1. Submit Proposal</h3>
                  <p className="text-gray-400">
                    Fill out the speaker form with your talk details
                  </p>
                </div>
                <div className="flex-1 md:block hidden" />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 hidden md:block" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-h4 text-white mb-2">2. Review Process</h3>
                  <p className="text-gray-400">
                    Our team reviews and selects talks for upcoming meetups (1-2 weeks)
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-right hidden md:block">
                  <h3 className="text-h4 text-white mb-2">3. Confirmation</h3>
                  <p className="text-gray-400">
                    We'll reach out to schedule your talk and provide support
                  </p>
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1 md:hidden">
                  <h3 className="text-h4 text-white mb-2">3. Confirmation</h3>
                  <p className="text-gray-400">
                    We'll reach out to schedule your talk and provide support
                  </p>
                </div>
                <div className="flex-1 md:block hidden" />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 hidden md:block" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-h4 text-white mb-2">4. Present!</h3>
                  <p className="text-gray-400">
                    Share your knowledge with the community and join our speaker network
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Speaker Benefits */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="border border-primary/20 rounded-lg p-8 bg-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-h3 text-white">Speaker Benefits</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div>✓ Build your personal brand and visibility</div>
              <div>✓ Connect with industry professionals</div>
              <div>✓ Receive speaker badge and recognition</div>
              <div>✓ Get feedback to improve your content</div>
              <div>✓ Recording shared on our YouTube channel</div>
              <div>✓ Join our exclusive speaker community</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-h2 text-white mb-4">Ready to Share?</h2>
          <p className="text-gray-400 mb-8">
            Submit your talk proposal and we'll get back to you within 1-2 weeks
          </p>
          <Link
            href="/contact?topic=Speaking&ref=speak-page"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
          >
            <Mic className="w-5 h-5" />
            Propose a Talk
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
