import Link from "next/link"
import { Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 section-spacing">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <div className="relative">
                <svg
                  className="h-8 w-8 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-blue-500">
                CNSL
              </span>
            </div>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
              Empowering Sri Lanka’s cloud-native community through mentorship, education, and collaboration.
            </p>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Newsletter</p>
              <div className="flex gap-2">
                <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter</label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email"
                  aria-label="Email address for newsletter subscription"
                  className="h-10 bg-white/5 text-foreground placeholder:text-muted-foreground border-border focus:border-blue-500/50"
                />
                <Button className="h-10 bg-blue-600 text-white hover:bg-blue-700 px-6" aria-label="Subscribe to newsletter">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h3 className="mb-6 text-sm font-bold text-foreground uppercase tracking-wider">Programs</h3>
            <nav className="flex flex-col gap-3">
              <Link href="/programs/cnsl-connect" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                CNSL Connect (Mentorship)
              </Link>
              <Link href="/programs/university-outreach" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                University Outreach
              </Link>
              <Link href="/programs/monthly-meetups" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                Monthly Meetups
              </Link>
              <Link href="/events" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                Upcoming Events
              </Link>
            </nav>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-6 text-sm font-bold text-foreground uppercase tracking-wider">Community</h3>
            <nav className="flex flex-col gap-3">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                About Us
              </Link>
              <Link href="/events" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                Events
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                Blog & Updates
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="mb-6 text-sm font-bold text-foreground uppercase tracking-wider">Legal & Connect</h3>
            <nav className="flex flex-col gap-3 mb-6">
              <Link href="/code-of-conduct" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                Code of Conduct
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
            </nav>
            <div>
              <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Follow Us</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="https://linkedin.com/company/cloudnativesl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="LinkedIn"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </Link>
                <Link
                  href="https://twitter.com/cloudnativesl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Link>
                <Link
                  href="https://github.com/cloudnativesl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="GitHub"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </Link>
                <Link
                  href="https://youtube.com/@cloudnativesl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="YouTube"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </Link>
                <Link
                  href="https://facebook.com/cloudnativesl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="Contact Us"
                >
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-1">
            <span>© {new Date().getFullYear()} Cloud Native Sri Lanka.</span>
            <span className="hidden md:inline">•</span>
            <span>Part of the CNCF Community Groups.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://cncf.io" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors text-muted-foreground">
              CNCF Ecosystem
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
