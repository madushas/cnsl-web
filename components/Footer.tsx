import {
  FaceBookIcon,
  LinkedInIcon,
  MeetupIcon,
  TwitterIcon,
} from "@/components/ui/SocialIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    Community: [
      { name: "About Us", href: "/about" },
      { name: "Events", href: "/events" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    Programs: [
      { name: "CNSL Connect", href: "/cnsl-connect" },
      { name: "University Outreach", href: "/university-outreach" },
    ],
    Connect: [
      { name: "Become a Speaker", href: "/contact" },
      { name: "Partner with Us", href: "/contact" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: TwitterIcon, url: "https://x.com/cloudnativesl" },
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      url: "https://www.linkedin.com/company/90470053/",
    },
    {
      name: "Facebook",
      icon: FaceBookIcon,
      url: "https://web.facebook.com/CloudNativeSL/",
    },
    {
      name: "Meetup",
      icon: MeetupIcon,
      url: "https://www.meetup.com/cloud-native-sri-lanka/",
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Brand & Newsletter Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">CN</span>
                </div>
                <span className="font-bold text-xl text-foreground">
                  Cloud Native Sri Lanka
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed max-w-md">
                Empowering Sri Lanka&apos;s tech community through cloud-native
                education, mentorship, and collaborative events. Join us in
                building the future of cloud computing.
              </p>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Stay Updated
                </h3>
                <p className="text-sm text-muted-foreground">
                  Subscribe to our newsletter for the latest updates, events,
                  and cloud native insights.
                </p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <div className="flex-grow">
                    <label htmlFor="footer-email" className="sr-only">
                      Email for newsletter
                    </label>
                    <Input
                      id="footer-email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-background border-2 border-border focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground text-foreground shadow-sm hover:border-primary transition-all duration-300 rounded-lg px-4 py-2.5"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-secondary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-6 py-2.5 rounded-lg border-0"
                  >
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>

            {/* Links Sections */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {category}
                  </h3>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm flex items-center group"
                        >
                          <span className="h-0.5 w-2 bg-gradient-to-r from-primary to-secondary mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"></span>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} Cloud Native Sri Lanka. All
                rights reserved.
              </p>
              <div className="hidden md:block w-px h-4 bg-border"></div>
              <div className="flex items-center gap-4">
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">
                Follow us:
              </span>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-card p-3 rounded-full border-2 border-border text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
