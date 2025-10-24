"use client"

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SignIn } from '@stackframe/stack'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 pt-12 pb-20">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4">
            <h1 className="text-h2">Sign in</h1>
            <p className="text-muted-foreground">Access your dashboard and manage your RSVPs.</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <SignIn />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export const dynamic = 'force-static'
