import Header from '@/components/Header'
import UniversityOutreach from '@/components/UniversityOutreach'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'University Outreach - Cloud Native Sri Lanka',
  description: 'Educational sessions at universities to introduce students to cloud-native technologies, providing foundational knowledge and hands-on experience.',
  keywords: ['university outreach', 'cloud native education', 'kubernetes basics', 'student programs', 'tech education'],
  openGraph: {
    title: 'University Outreach - Cloud Native Sri Lanka',
    description: 'Educational sessions at universities to introduce students to cloud-native technologies, providing foundational knowledge and hands-on experience.',
    url: 'https://cloudnativesl.com/university-outreach',
  },
  alternates: {
    canonical: 'https://cloudnativesl.com/university-outreach',
  },
}

export default function UniversityOutreachPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <UniversityOutreach />
      <Footer />
    </main>
  )
}
