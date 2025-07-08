export const imageConfig = {
  formats: ['image/webp', 'image/jpeg'],
  sizes: {
    hero: '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw',
    card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw',
    avatar: '(max-width: 768px) 80px, 96px',
    feature: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  }
} as const;

export const placeholderImages = {
  hero: '/images/hero.jpeg',
  cloudNative: '/images/cloudNative.jpeg',
  kubernetes: '/images/k8s.jpeg',
  meetup: '/images/meetup.jpeg',
  team: '/images/team.jpeg',
  networking: '/images/networking.jpeg',
  workshop: '/images/workshop.jpeg',
  university: '/images/university.jpeg',
  mentorship: '/images/mentorship.jpeg',
  community: '/images/community.jpeg'
} as const;

export type ImageKey = keyof typeof placeholderImages;