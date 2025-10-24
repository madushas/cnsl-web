"use client"

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AccountSettings } from '@stackframe/stack'
import { ProfileForm } from '@/components/profile-form'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AccountPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/account'
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 pt-12 pb-20">
        <div className="grid gap-8">
          <div className="rounded-2xl border border-border bg-card p-0 overflow-hidden">
            <AccountSettings />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-h4 mb-4">Community Profile</h2>
            <p className="text-sm text-muted-foreground mb-4">Add links and basic info to help organizers understand your background. Most fields are optional.</p>
            <ProfileForm onSaved={() => router.push(next)} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
