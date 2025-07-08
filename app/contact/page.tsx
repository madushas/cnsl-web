import Header from '@/components/Header'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Cloud Native Sri Lanka',
  description: 'Get in touch with Cloud Native Sri Lanka. Join our community, ask questions, or learn more about our events and mentorship programs.',
  keywords: ['contact cnsl', 'join cloud native sri lanka', 'get in touch', 'community contact', 'cnsl connect'],
  openGraph: {
    title: 'Contact Us - Cloud Native Sri Lanka',
    description: 'Get in touch with Cloud Native Sri Lanka. Join our community, ask questions, or learn more about our events and mentorship programs.',
    url: 'https://cloudnativesl.com/contact',
  },
  alternates: {
    canonical: 'https://cloudnativesl.com/contact',
  },
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Contact />
      <Footer />
    </main>
  )
}
