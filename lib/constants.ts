// CNSL Website Constants and Configuration

export const SITE_CONFIG = {
  name: 'CNSL',
  fullName: 'Cloud Native Sri Lanka',
  description: 'Sri Lanka\'s premier community for Cloud Native & DevOps professionals. Join our meetups, mentorship programs, and grow your career.',
  url: 'https://cnsl.lk',
  links: {
    twitter: 'https://x.com/cloudnativesl',
    linkedin: 'https://www.linkedin.com/company/90470053/',
    facebook: 'https://web.facebook.com/CloudNativeSL/',
    meetup: 'https://www.meetup.com/cloud-native-sri-lanka/',
    github: 'https://github.com/cloudnativesl'
  }
} as const

export const SEO_DEFAULTS = {
  title: 'CNSL - Cloud Native Sri Lanka',
  description: 'Sri Lanka\'s premier community for Cloud Native & DevOps professionals. Join our meetups, mentorship programs, and grow your career.',
  keywords: ['cloud native', 'kubernetes', 'devops', 'sri lanka', 'containers', 'microservices', 'serverless'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'CNSL - Cloud Native Sri Lanka'
  }
} as const

export const BRAND_COLORS = {
  // Guide.md aligned color palette
  primary: '#0077B6',        // Bright blue for buttons, links
  secondary: '#00B4D8',      // Lighter blue for CTAs, hover states  
  accent: '#90E0EF',         // Light blue for highlights
  background: '#F8F9FA',     // Light gray for main background
  text: '#212529',           // Dark gray for readable text
  
  // Additional colors for depth
  primaryDark: '#005577',
  primaryLight: '#0099DD',
  muted: '#E9ECEF',
  border: '#DEE2E6'
} as const

export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  intersection: 100
} as const

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const
