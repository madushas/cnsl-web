import Header from '@/components/Header'
import Events from '@/components/Events'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events - Cloud Native Sri Lanka',
  description: 'Join our regular meetups, workshops, and special events. Connect, learn, and grow with the Cloud Native Sri Lanka community.',
  keywords: ['cnsl events', 'cloud native meetups', 'kubernetes workshops', 'devops events', 'sri lanka tech events'],
  openGraph: {
    title: 'Events - Cloud Native Sri Lanka',
    description: 'Join our regular meetups, workshops, and special events. Connect, learn, and grow with the Cloud Native Sri Lanka community.',
    url: 'https://cloudnativesl.com/events',
  },
  alternates: {
    canonical: 'https://cloudnativesl.com/events',
  },
}

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Events />
      <Footer />
    </main>
  )
}
