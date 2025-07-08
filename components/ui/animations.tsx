'use client'

import { useEffect, useCallback } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface AnimationProps {
  readonly children: React.ReactNode
  readonly delay?: number
  readonly className?: string
}

// Memoize the reduced motion check
const getReducedMotionPreference = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function FadeIn({ children, delay = 0, className = '' }: AnimationProps) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ 
    triggerOnce: true,
    threshold: 0.1
  })

  const handleAnimation = useCallback(() => {
    if (!ref.current || !isIntersecting) return;
    
    const prefersReducedMotion = getReducedMotionPreference();
    
    if (!prefersReducedMotion) {
      ref.current.style.animationDelay = `${delay}ms`
      ref.current.classList.add('animate')
    } else {
      // Immediately show content without animation
      ref.current.style.opacity = '1'
      ref.current.style.transform = 'translateY(0)'
    }
  }, [isIntersecting, delay, ref])

  useEffect(() => {
    handleAnimation()
  }, [handleAnimation])

  return (
    <div 
      ref={ref}
      className={`scroll-fade-in ${className}`}
    >
      {children}
    </div>
  )
}

export function SlideIn({ children, delay = 0, className = '' }: AnimationProps) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ 
    triggerOnce: true,
    threshold: 0.1
  })

  const handleAnimation = useCallback(() => {
    if (!ref.current || !isIntersecting) return;
    
    const prefersReducedMotion = getReducedMotionPreference();
    
    if (!prefersReducedMotion) {
      ref.current.style.animationDelay = `${delay}ms`
      ref.current.classList.add('animate')
    } else {
      // Immediately show content without animation
      ref.current.style.opacity = '1'
      ref.current.style.transform = 'translateY(0)'
    }
  }, [isIntersecting, delay, ref])

  useEffect(() => {
    handleAnimation()
  }, [handleAnimation])

  return (
    <div 
      ref={ref}
      className={`scroll-slide-up ${className}`}
    >
      {children}
    </div>
  )
}

export function ScaleIn({ children, delay = 0, className = '' }: AnimationProps) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ triggerOnce: true })

  const handleAnimation = useCallback(() => {
    if (!ref.current || !isIntersecting) return;
    
    const prefersReducedMotion = getReducedMotionPreference();
    
    if (!prefersReducedMotion) {
      ref.current.style.animationDelay = `${delay}ms`
      ref.current.classList.add('animate')
    } else {
      ref.current.style.opacity = '1'
      ref.current.style.transform = 'scale(1)'
    }
  }, [isIntersecting, delay, ref])

  useEffect(() => {
    handleAnimation()
  }, [handleAnimation])

  return (
    <div 
      ref={ref}
      className={`scroll-scale-in ${className}`}
    >
      {children}
    </div>
  )
}

export function FloatingCard({ children, className = '' }: AnimationProps) {
  return (
    <div className={`animate-float ${className}`}>
      {children}
    </div>
  )
}

// Stagger animation for lists
export function StaggerContainer({ children, className = '' }: AnimationProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function StaggerItem({ children, index = 0, className = '' }: AnimationProps & { readonly index?: number }) {
  return (
    <SlideIn delay={index * 100} className={className}>
      {children}
    </SlideIn>
  )
}
