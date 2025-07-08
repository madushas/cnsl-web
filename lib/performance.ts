/**
 * Performance monitoring utilities for CNSL website
 * Provides client-side performance tracking and analytics
 */

export interface PerformanceMetrics {
  readonly name: string
  readonly value: number
  readonly rating: 'good' | 'needs-improvement' | 'poor'
  readonly timestamp: number
}

export interface WebVitalThresholds {
  readonly good: number
  readonly needsImprovement: number
}

export const WEB_VITAL_THRESHOLDS: Record<string, WebVitalThresholds> = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 }
}

/**
 * Calculates performance rating based on thresholds
 */
export function getPerformanceRating(
  metricName: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITAL_THRESHOLDS[metricName]
  if (!thresholds) return 'good'

  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}

/**
 * Tracks and reports web vitals
 */
export function reportWebVital(metric: PerformanceMetrics): void {
  // In production, send to analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      timestamp: new Date(metric.timestamp).toISOString()
    })
  }

  // Example: Send to Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-expect-error - gtag is added dynamically by Google Analytics
    window.gtag('event', metric.name, {
      custom_parameter_value: metric.value,
      custom_parameter_rating: metric.rating
    })
  }
}

/**
 * Monitors Core Web Vitals using dynamic import
 */
export function initializeWebVitals(): void {
  if (typeof window === 'undefined') return

  // Dynamic import to avoid SSR issues and missing dependency
  const loadWebVitals = async () => {
    try {
      // Use eval to prevent TypeScript from complaining about missing module
      const webVitals = await eval('import("web-vitals")')
      const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = webVitals

      const handleMetric = (metric: { name: string; value: number; id: string; delta: number; rating: string }) => {
        const performanceMetric: PerformanceMetrics = {
          name: metric.name,
          value: metric.value,
          rating: getPerformanceRating(metric.name, metric.value),
          timestamp: Date.now()
        }
        reportWebVital(performanceMetric)
      }

      onCLS(handleMetric)
      onFID(handleMetric)
      onFCP(handleMetric)
      onLCP(handleMetric)
      onTTFB(handleMetric)
      onINP(handleMetric)
    } catch {
      console.warn('web-vitals not available - install with: npm install web-vitals')
    }
  }

  loadWebVitals()
}

/**
 * Tracks page load performance
 */
export function trackPageLoad(pageName: string): void {
  if (typeof window === 'undefined') return

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  if (navigation) {
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      connection: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.fetchStart
    }

    console.log(`[Performance] Page Load - ${pageName}:`, metrics)
  }
}

/**
 * Measures and tracks custom timing
 */
export function measureCustomTiming(name: string, fn: () => void | Promise<void>): void {
  const start = performance.now()
  
  try {
    const result = fn()
    
    if (result instanceof Promise) {
      result.finally(() => {
        const duration = performance.now() - start
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      })
    } else {
      const duration = performance.now() - start
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    }
  } catch (error) {
    const duration = performance.now() - start
    console.log(`[Performance] ${name} (error): ${duration.toFixed(2)}ms`)
    throw error
  }
}

/**
 * Monitors memory usage (if available)
 */
export function trackMemoryUsage(): void {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  try {
    const memory = (performance as unknown as { memory?: { usedJSHeapSize?: number; totalJSHeapSize?: number; jsHeapSizeLimit?: number } }).memory
    if (memory && typeof memory === 'object') {
      const memoryInfo = {
        used: memory.usedJSHeapSize || 0,
        total: memory.totalJSHeapSize || 0,
        limit: memory.jsHeapSizeLimit || 0,
        usage: memory.jsHeapSizeLimit && memory.usedJSHeapSize
          ? ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)
          : '0'
      }

      console.log('[Performance] Memory Usage:', memoryInfo)
    }
  } catch (error) {
    console.warn('[Performance] Memory tracking not available:', error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Debounced performance observer for animations
 */
export function observeAnimationPerformance(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

  let animationFrames = 0
  let lastTime = performance.now()

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      if (entry.entryType === 'measure' && entry.name.includes('animation')) {
        console.log(`[Performance] Animation: ${entry.name} - ${entry.duration.toFixed(2)}ms`)
      }
    })
  })

  observer.observe({ entryTypes: ['measure'] })

  // Monitor frame rate
  function checkFrameRate() {
    animationFrames++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((animationFrames * 1000) / (currentTime - lastTime))
      if (fps < 30) {
        console.warn(`[Performance] Low FPS detected: ${fps}fps`)
      }
      
      animationFrames = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(checkFrameRate)
  }
  
  requestAnimationFrame(checkFrameRate)
}
