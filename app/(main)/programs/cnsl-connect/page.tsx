import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Users,
  Target,
  Calendar,
  Award,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CNSL Connect | Cloud Native Mentorship Program",
  description:
    "Connect with experienced cloud-native professionals through our structured mentorship program. Build skills, gain insights, and accelerate your career.",
};

export default function CNSLConnectPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 section-spacing">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Users className="w-4 h-4" />
            <span>Cloud Native Mentorship Program</span>
          </div>
          <h1 className="text-h1 text-white mb-4">CNSL Connect</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A structured mentorship program connecting experienced cloud-native
            professionals with aspiring engineers and students across Sri Lanka.
          </p>
        </div>

        {/* Program Status Banner */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="border border-primary/30 rounded-lg p-6 bg-primary/5 text-center">
            <h2 className="text-h3 text-white mb-2">
              Program Currently in Development
            </h2>
            <p className="text-gray-400 mb-4">
              We&#39;re building the infrastructure for cohort-based mentorship.
              Applications will open soon.
            </p>
            <Link
              href="/contact?topic=CNSL%20Connect&ref=cnsl-connect-page"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Get notified when applications open{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* What is CNSL Connect */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-h2 text-white text-center mb-8">
            What is CNSL Connect?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-h4 text-white">For Mentees</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Get personalized guidance from experienced professionals to
                accelerate your cloud-native journey
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>1-on-1 mentorship sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Career guidance & skill development</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Project feedback & code reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Industry insights & best practices</span>
                </li>
              </ul>
            </div>

            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-h4 text-white">For Mentors</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Share your expertise, give back to the community, and develop
                your leadership skills
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Make a meaningful impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Build your professional brand</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Expand your network</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Stay current with new perspectives</span>
                </li>
              </ul>
            </div>

            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-primary/10">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-h4 text-white">For Community</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Strengthen Sri Lanka&#39;s cloud-native ecosystem through
                knowledge sharing and collaboration
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Bridge industry-academia gap</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Build local talent pipeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Foster collaboration culture</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Accelerate skill development</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Program Timeline */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-h2 text-white text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="text-h4 text-white mb-2">Apply</h3>
              <p className="text-sm text-gray-400">
                Submit your application with goals and background
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="text-h4 text-white mb-2">Match</h3>
              <p className="text-sm text-gray-400">
                We pair you with a mentor based on skills and goals
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="text-h4 text-white mb-2">Connect</h3>
              <p className="text-sm text-gray-400">
                3-month structured program with regular sessions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-white font-bold">
                4
              </div>
              <h3 className="text-h4 text-white mb-2">Showcase</h3>
              <p className="text-sm text-gray-400">
                Present your learnings and earn a certificate
              </p>
            </div>
          </div>
        </div>

        {/* Program Details */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-h3 text-white mb-4">Program Structure</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Duration</div>
                    <div className="text-sm">3 months per cohort</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Sessions</div>
                    <div className="text-sm">
                      Bi-weekly 1-on-1 meetings (6-8 sessions total)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Focus Areas</div>
                    <div className="text-sm">
                      Kubernetes, DevOps, Cloud Architecture, Career Development
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Recognition</div>
                    <div className="text-sm">
                      Completion certificate & showcase opportunity
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-h3 text-white mb-4">Eligibility</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    For Mentees:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>
                      • University students (final year) or recent graduates
                    </li>
                    <li>• Basic understanding of cloud computing concepts</li>
                    <li>• Commitment to attend regular sessions</li>
                    <li>• Working on or planning a cloud-native project</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    For Mentors:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>• 3+ years experience in cloud-native technologies</li>
                    <li>
                      • Currently working with Kubernetes, containers, or cloud
                      platforms
                    </li>
                    <li>• Willing to commit 2-3 hours per month</li>
                    <li>• Passionate about knowledge sharing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-h2 text-white mb-4">Interested in Joining?</h2>
          <p className="text-gray-400 mb-8">
            Applications will open when we launch the program. Leave your
            details to get notified.
          </p>
          <Link
            href="/contact?topic=CNSL%20Connect&ref=cnsl-connect-page"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
          >
            <Users className="w-5 h-5" />
            Get Notified
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
