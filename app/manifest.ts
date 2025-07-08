import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cloud Native Sri Lanka',
    short_name: 'CNSL',
    description: 'Cloud Native Sri Lanka - Empowering the cloud native community in Sri Lanka',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6d28d9',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
