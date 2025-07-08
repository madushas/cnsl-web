// Centralized type definitions for the CNSL website

import { StaticImageData } from "next/image"

export const BLOG_CATEGORIES = [
  "All" as const,
  "Announcements" as const, 
  "Tutorials" as const,
  "Event Recaps" as const,
  "Member Stories" as const,
];

export interface Author {
  readonly id: string
  readonly name: string
  readonly title: string
  readonly bio: string
  readonly avatar: string | StaticImageData
  readonly social?: {
    readonly linkedin?: string
    readonly twitter?: string
    readonly github?: string
  }
}

export interface BlogPost {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly excerpt: string
  readonly content: string
  readonly author: string
  readonly authorDetails?: Author
  readonly date: string
  readonly readTime: string
  readonly category: typeof BLOG_CATEGORIES[number]
  readonly tags: readonly string[]
  readonly featured?: boolean
  readonly image: string | StaticImageData
}

// Legacy Event type (for backwards compatibility)
export interface Event {
  readonly id: string;
  readonly slug: string
  readonly title: string
  readonly date: string
  readonly time: string
  readonly location:string
  readonly description: string
  readonly longDescription?: string;
  readonly attendees: number
  readonly maxAttendees: number
  readonly featured?: boolean
  readonly image?: StaticImageData
  readonly registrationUrl?: string
  readonly eventType: 'meetup' | 'workshop' | 'conference' | 'webinar' | 'hackathon'
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced'
  readonly topics: readonly string[]
  readonly speaker?: string
  readonly speakerId?: string
}

// Database-compatible Event type
export interface DatabaseEvent {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly description: string
  readonly longDescription?: string
  readonly eventDate: string
  readonly eventTime: string
  readonly location: string
  readonly currentAttendees: number
  readonly maxAttendees: number
  readonly eventType: 'meetup' | 'workshop' | 'conference' | 'webinar' | 'hackathon'
  readonly difficulty?: 'beginner' | 'intermediate' | 'advanced'
  readonly topics?: readonly string[]
  readonly featured?: boolean
  readonly imageUrl?: string
  readonly registrationUrl?: string
  readonly published?: boolean
  readonly createdAt?: string
  readonly updatedAt?: string
  readonly speakerDetails: Speaker[]
  readonly gallery?: readonly string[] 
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  expertise: string[];
  image: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  newsletter: boolean
}

export interface SocialLink {
  readonly name: string
  readonly url: string
  readonly icon: string
}

export interface TeamMember {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly bio: string
  readonly imageUrl?: string
  readonly linkedinUrl?: string
  readonly twitterUrl?: string
  readonly githubUrl?: string
}

export interface Mentor {
  readonly id: string
  readonly name: string
  readonly title: string
  readonly company: string
  readonly expertise: readonly string[]
  readonly bio: string
  readonly imageUrl?: string
  readonly linkedinUrl?: string
}

export interface University {
  readonly id: string
  readonly name: string
  readonly location: string
  readonly visitDate?: string
  readonly studentsReached?: number
  readonly imageUrl?: string
}

export interface Statistic {
  readonly label: string
  readonly value: string
  readonly description?: string
  readonly icon?: string
}

// Animation and intersection observer types
export interface UseIntersectionObserverOptions {
  readonly threshold?: number
  readonly rootMargin?: string
  readonly triggerOnce?: boolean
}

export interface AnimationConfig {
  readonly duration: number
  readonly delay?: number
  readonly easing?: string
}

// Form validation types
export interface ValidationRule {
  readonly required?: boolean
  readonly minLength?: number
  readonly maxLength?: number
  readonly pattern?: RegExp
  readonly message: string
}

export interface FormValidationConfig {
  readonly [key: string]: readonly ValidationRule[]
}

export interface FormErrors {
  [key: string]: string
}
