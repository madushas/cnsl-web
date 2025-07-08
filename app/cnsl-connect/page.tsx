import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import ConnectMentorship from '@/components/ConnectMentorship'

export const metadata: Metadata = {
  title: 'Connect with Mentors - Cloud Native Sri Lanka',
  description: 'Join our mentorship program to connect with experienced cloud-native professionals in Sri Lanka. Get guidance, support, and insights to advance your career in cloud-native technologies.',
  keywords: ['cnsl mentorship', 'cloud native mentors', 'kubernetes guidance', 'devops mentorship', 'tech career sri lanka'],
  openGraph: {
    title: 'Connect with Mentors - Cloud Native Sri Lanka',
    description: 'Join our mentorship program to connect with experienced cloud-native professionals in Sri Lanka. Get guidance, support, and insights to advance your career in cloud-native technologies.',
    url: 'https://cloudnativesl.com/cnsl-connect',
  },
  alternates: {
    canonical: 'https://cloudnativesl.com/cnsl-connect',
  },
}

export default function CNSLConnectPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ConnectMentorship />
      <Footer />
    </main>
  )
}
