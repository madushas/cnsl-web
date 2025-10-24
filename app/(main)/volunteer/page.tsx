import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Heart, Calendar, Code, Palette, Users, MessageSquare } from "lucide-react"

export const metadata = {
  title: 'Volunteer with CNSL | Help Build Sri Lanka\'s Cloud Native Community',
  description: 'Join our team of volunteers and help grow Sri Lanka\'s cloud-native technology community through events, content, and community engagement.',
}

export default function VolunteerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 section-spacing">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-h1 text-white mb-4">
            Help Build Sri Lanka's Cloud Native Community
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Volunteer with CNSL and make a real impact. Whether you have a few hours a month 
            or want to dive deeper, there's a role for you.
          </p>
        </div>

        {/* Why Volunteer */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-h2 text-white text-center mb-8">Why Volunteer?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-h4 text-white">Network & Learn</h3>
              </div>
              <p className="text-body text-gray-400">
                Connect with industry professionals, mentors, and peers. Learn by doing and expand your knowledge.
              </p>
            </div>

            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-h4 text-white">Make an Impact</h3>
              </div>
              <p className="text-body text-gray-400">
                Help students and professionals grow their careers. Your contribution directly supports the community.
              </p>
            </div>

            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-h4 text-white">Build Your Brand</h3>
              </div>
              <p className="text-body text-gray-400">
                Gain recognition, build your portfolio, and showcase your commitment to community building.
              </p>
            </div>
          </div>
        </div>

        {/* Volunteer Roles */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-h2 text-white text-center mb-8">Volunteer Roles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Event Operations */}
            <div className="border border-border/50 rounded-lg p-8 bg-card/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-h3 text-white">Event Operations</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Help organize and run our monthly meetups and special events
              </p>
              <h4 className="text-white font-semibold mb-2">What You'll Do:</h4>
              <ul className="space-y-2 text-gray-400 text-sm mb-4">
                <li>• Coordinate with venues and speakers</li>
                <li>• Manage RSVPs and attendee communications</li>
                <li>• Set up event spaces and registration</li>
                <li>• Help with check-ins and logistics</li>
                <li>• Capture photos and gather feedback</li>
              </ul>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Time commitment:</span>
                <span className="text-white">4-8 hours/month</span>
              </div>
            </div>

            {/* Content & Social Media */}
            <div className="border border-border/50 rounded-lg p-8 bg-card/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-h3 text-white">Content & Community</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Create content and engage with the community online
              </p>
              <h4 className="text-white font-semibold mb-2">What You'll Do:</h4>
              <ul className="space-y-2 text-gray-400 text-sm mb-4">
                <li>• Write blog posts and event recaps</li>
                <li>• Manage social media accounts</li>
                <li>• Create announcements and newsletters</li>
                <li>• Moderate online community channels</li>
                <li>• Interview speakers and community members</li>
              </ul>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Time commitment:</span>
                <span className="text-white">3-6 hours/month</span>
              </div>
            </div>

            {/* Design & Creativity */}
            <div className="border border-border/50 rounded-lg p-8 bg-card/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-h3 text-white">Design & Creativity</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Design visual assets and improve community branding
              </p>
              <h4 className="text-white font-semibold mb-2">What You'll Do:</h4>
              <ul className="space-y-2 text-gray-400 text-sm mb-4">
                <li>• Create event posters and social media graphics</li>
                <li>• Design presentation templates</li>
                <li>• Develop visual brand guidelines</li>
                <li>• Edit event photos and videos</li>
                <li>• Create infographics and diagrams</li>
              </ul>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Time commitment:</span>
                <span className="text-white">3-5 hours/month</span>
              </div>
            </div>

            {/* Tech & Platform */}
            <div className="border border-border/50 rounded-lg p-8 bg-card/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-h3 text-white">Tech & Platform</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Improve our website and technical infrastructure
              </p>
              <h4 className="text-white font-semibold mb-2">What You'll Do:</h4>
              <ul className="space-y-2 text-gray-400 text-sm mb-4">
                <li>• Contribute to website development</li>
                <li>• Fix bugs and add new features</li>
                <li>• Maintain documentation</li>
                <li>• Set up automation and integrations</li>
                <li>• Support event tech (streaming, recording)</li>
              </ul>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Time commitment:</span>
                <span className="text-white">Flexible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="border border-primary/20 rounded-lg p-8 bg-primary/5">
            <h2 className="text-h3 text-white text-center mb-8">Our Community Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-gray-400 text-sm">Events Organized</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">2,000+</div>
                <div className="text-gray-400 text-sm">Community Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <div className="text-gray-400 text-sm">Speakers Hosted</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">20+</div>
                <div className="text-gray-400 text-sm">Active Volunteers</div>
              </div>
            </div>
          </div>
        </div>

        {/* What We Provide */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-h2 text-white text-center mb-8">What We Provide</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="text-primary text-2xl">✓</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Training & Onboarding</h3>
                <p className="text-gray-400 text-sm">
                  We'll teach you everything you need to know to succeed in your role
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-primary text-2xl">✓</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Flexible Schedule</h3>
                <p className="text-gray-400 text-sm">
                  Work around your availability — we understand you have other commitments
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-primary text-2xl">✓</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Recognition & Certificates</h3>
                <p className="text-gray-400 text-sm">
                  Receive volunteer certificates and public acknowledgment for your contributions
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-primary text-2xl">✓</div>
              <div>
                <h3 className="text-white font-semibold mb-1">Community Access</h3>
                <p className="text-gray-400 text-sm">
                  Free entry to all events and exclusive volunteer networking sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-h2 text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-400 mb-8">
            Join our volunteer team and help us grow Sri Lanka's cloud-native community
          </p>
          <Link
            href="/contact?topic=Volunteer&ref=volunteer-page"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
          >
            <Heart className="w-5 h-5" />
            Apply to Volunteer
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            Questions? Email us at <a href="mailto:hello@cloudnative.lk" className="text-primary hover:underline">hello@cloudnative.lk</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
