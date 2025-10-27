"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProfileForm } from "@/components/profile-form";

export default function WelcomePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        id="main-content"
        className="container mx-auto px-4 section-spacing"
      >
        <div className="max-w-3xl">
          <h1 className="text-h2 text-foreground">
            Welcome — complete your community profile
          </h1>
          <p className="mt-3 text-muted-foreground">
            Tell us a bit more about you. Most fields are optional. You can edit
            this later in your account.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <ProfileForm onSaved={() => router.push(next)} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            We use this information to improve event curation and community
            safety. See our{" "}
            <a href="/privacy" className="text-blue-400 hover:underline">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="/code-of-conduct"
              className="text-blue-400 hover:underline"
            >
              Code of Conduct
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
