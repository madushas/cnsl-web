import Header from '@/components/Header'
import Blog from '@/components/Blog'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Cloud Native Sri Lanka',
  description: 'Read our latest announcements, technical tutorials, event recaps, and member stories. Stay updated with the cloud-native ecosystem in Sri Lanka.',
  keywords: ['cnsl blog', 'cloud native tutorials', 'kubernetes guides', 'devops articles', 'tech blog sri lanka'],
  openGraph: {
    title: 'Blog - Cloud Native Sri Lanka',
    description: 'Read our latest announcements, technical tutorials, event recaps, and member stories. Stay updated with the cloud-native ecosystem in Sri Lanka.',
    url: 'https://cloudnativesl.com/blog',
  },
  alternates: {
    canonical: 'https://cloudnativesl.com/blog',
  },
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Blog />
      <Footer />
    </main>
  )
}
