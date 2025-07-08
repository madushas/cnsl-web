import { Metadata } from 'next'
import { SITE_CONFIG, SEO_DEFAULTS } from './constants'

interface PageSEOProps {
  title?: string
  description?: string
  keywords?: readonly string[]
  path?: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
}

export function generatePageMetadata({
  title,
  description = SEO_DEFAULTS.description,
  keywords = SEO_DEFAULTS.keywords,
  path = '',
  image = '/og-image.jpg',
  type = 'website',
  publishedTime,
  modifiedTime
}: PageSEOProps = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_CONFIG.name}` : SEO_DEFAULTS.title
  const url = `${SITE_CONFIG.url}${path}`
  const imageUrl = image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`

  return {
    title: pageTitle,
    description,
    keywords: keywords.join(', '),
    
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: SITE_CONFIG.fullName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: 'en_US',
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [imageUrl],
      creator: '@cloudnativesl',
      site: '@cloudnativesl',
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
    
    alternates: {
      canonical: url,
    },
  }
}

// JSON-LD structured data generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.fullName,
    alternateName: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      SITE_CONFIG.links.twitter,
      SITE_CONFIG.links.linkedin,
      SITE_CONFIG.links.facebook,
      SITE_CONFIG.links.meetup,
      SITE_CONFIG.links.github,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Community Support',
      url: `${SITE_CONFIG.url}/contact`,
    },
  }
}

export function generateEventSchema(event: {
  name: string
  description: string
  startDate: string
  endDate?: string
  location: {
    name: string
    address?: string
  }
  organizer: string
  url?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    ...(event.endDate && { endDate: event.endDate }),
    location: {
      '@type': 'Place',
      name: event.location.name,
      ...(event.location.address && { address: event.location.address }),
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer,
      url: SITE_CONFIG.url,
    },
    ...(event.url && { url: event.url }),
    ...(event.image && { image: event.image }),
  }
}

export function generateBlogPostSchema(post: {
  title: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  url: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.fullName,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    datePublished: post.datePublished,
    ...(post.dateModified && { dateModified: post.dateModified }),
    url: post.url,
    ...(post.image && { 
      image: {
        '@type': 'ImageObject',
        url: post.image,
      },
    }),
  }
}
