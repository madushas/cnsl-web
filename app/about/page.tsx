import Header from '@/components/Header'
import About from '@/components/About'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Cloud Native Sri Lanka',
  description: 'Learn about Cloud Native Sri Lanka (CNSL), our mission, community focus, and how we\'re empowering the future of cloud-native technologies in Sri Lanka.',
  keywords: ['about cnsl', 'cloud native sri lanka', 'mission', 'community', 'devops', 'kubernetes'],
  openGraph: {
    title: 'About Us - Cloud Native Sri Lanka',
    description: 'Learn about Cloud Native Sri Lanka (CNSL), our mission, community focus, and how we\'re empowering the future of cloud-native technologies in Sri Lanka.',
    url: 'https://cloudnativesl.com/about',
  },
  alternates: {
    canonical: 'https://cloudnativesl.com/about',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <About />
      <Footer />
    </main>
  )
}
