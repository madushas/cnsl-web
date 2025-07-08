import type { Metadata } from 'next'
import { Inter, Roboto } from 'next/font/google'
import './globals.css'

// Guide.md compliant fonts: Inter primary, Roboto fallback
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const roboto = Roboto({ 
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CNSL - Cloud Native Sri Lanka',
  description: 'CNSL is Sri Lanka\'s first community for Cloud Native & DevOps professionals. Connect. Learn. Build. Join CNSL Connect now.',
  keywords: ['cloud native', 'kubernetes', 'containers', 'microservices', 'sri lanka', 'devops', 'serverless', 'CNSL'],
  authors: [{ name: 'Cloud Native Sri Lanka' }],
  creator: 'Cloud Native Sri Lanka',
  metadataBase: new URL('https://cloudnativesl.com'),
  alternates: {
    canonical: 'https://cloudnativesl.com',
  },
  openGraph: {
    title: 'CNSL - Cloud Native Sri Lanka',
    description: 'CNSL is Sri Lanka\'s first community for Cloud Native & DevOps professionals. Connect. Learn. Build.',
    url: 'https://cloudnativesl.com',
    siteName: 'CNSL - Cloud Native Sri Lanka',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cloud Native Sri Lanka Community',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CNSL - Cloud Native Sri Lanka',
    description: 'CNSL is Sri Lanka\'s first community for Cloud Native & DevOps professionals. Connect. Learn. Build.',
    creator: '@cloudnativesl',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
