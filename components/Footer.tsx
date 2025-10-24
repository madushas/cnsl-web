import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import LinkedInIcon from "./icons/linkedin"
import NewTwitterIcon from "./icons/newTwitterIcon"
import GithubIcon from "./icons/githubIcon"
import YouTubeIcon from "./icons/youTubeicon"
import FacebookIcon from "./icons/facebook"
import WhatsAppIcon from "./icons/whatsappIcon"

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
                  <LinkedInIcon />
                </Link>
                <Link
                  href="https://twitter.com/cloudnativesl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="X (Twitter)"
                >
                  <NewTwitterIcon />
                </Link>
                <Link
                  href="https://github.com/cloud-native-sri-lanka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="GitHub"
                >
                  <GithubIcon />
                </Link>
                <Link
                  href="https://youtube.com/@cloudnativesl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="YouTube"
                >
                  <YouTubeIcon />
                </Link>
                <Link
                  href="https://facebook.com/cloudnativesl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </Link>
                <Link
                  href="https://whatsapp.com/channel/0029VaAPW3dH5JM68Rbkmr2j"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                  aria-label="Contact Us"
                >
                  <WhatsAppIcon />
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
          </div>
        </div>
      </div>
    </footer>
  )
}
