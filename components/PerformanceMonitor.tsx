'use client'

import { useEffect } from 'react'
import { initializeWebVitals, trackPageLoad } from '@/lib/performance'

export default function PerformanceMonitor() {
  useEffect(() => {
    // Initialize web vitals tracking
    initializeWebVitals()
    
    // Track initial page load
    trackPageLoad(window.location.pathname)
    
    // Track route changes for SPA navigation
    const handleRouteChange = () => {
      trackPageLoad(window.location.pathname)
    }
    
    // Listen for history changes (Next.js router navigation)
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  // This component doesn't render anything
  return null
}
