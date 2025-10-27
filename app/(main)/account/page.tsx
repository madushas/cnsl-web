"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AccountSettings } from "@stackframe/stack";
import { ProfileForm } from "@/components/profile-form";
import { useRouter, useSearchParams } from "next/navigation";
import { AccountHeader } from "@/components/account/account-header";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <AccountHeader />

          <Separator />

          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
              <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4">
                <h2 className="text-h4">Authentication & Security</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your login credentials and security settings
                </p>
              </div>
              <div className="p-0">
                <AccountSettings />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-card">
              <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4">
                <h2 className="text-h4">Community Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add links and basic info to help organizers understand your
                  background. Most fields are optional.
                </p>
              </div>
              <div className="p-6">
                <ProfileForm onSaved={() => router.push(next)} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
