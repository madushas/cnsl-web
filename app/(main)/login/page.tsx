"use client"

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SignIn } from '@stackframe/stack'
import React from 'react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 pt-12 pb-20">
        <div className="card-padding">
          <SignIn extraInfo={<>By signing in, you agree to our <a className="text-blue-400 underline" href="/terms">Terms</a> and <a className="text-blue-400 underline" href="/privacy">Privacy</a>.</>} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
