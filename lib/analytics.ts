/**
 * Analytics utilities for CNSL website
 * Provides privacy-focused analytics and user interaction tracking
 */

export interface AnalyticsEvent {
  readonly name: string
  readonly properties?: Record<string, string | number | boolean>
  readonly timestamp?: number
}

export interface UserSession {
  readonly sessionId: string
  readonly userId?: string
  readonly startTime: number
  pageViews: number
  readonly events: AnalyticsEvent[]
}

/**
 * Privacy-focused analytics manager
 */
class Analytics {
  private session: UserSession | null = null
  private isEnabled = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private init() {
    // Check for user consent (GDPR compliant)
    const consent = this.getConsent()
    if (consent) {
      this.isEnabled = true
      this.createSession()
    }
  }

  private getConsent(): boolean {
    // Check localStorage for consent
    const consent = localStorage.getItem('cnsl-analytics-consent')
    return consent === 'true'
  }

  public setConsent(enabled: boolean) {
    localStorage.setItem('cnsl-analytics-consent', enabled.toString())
    this.isEnabled = enabled
    
    if (enabled && !this.session) {
      this.createSession()
    } else if (!enabled) {
      this.clearSession()
    }
  }

  private createSession() {
    this.session = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 0,
      events: []
    }
  }

  private clearSession() {
    this.session = null
    localStorage.removeItem('cnsl-session')
  }

  private generateSessionId(): string {
    return `cnsl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Track page view
   */
  public trackPageView(page: string, title?: string) {
    if (!this.isEnabled || !this.session) return

    this.session.pageViews++
    this.track('page_view', {
      page,
      title: title || document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: Date.now()
    })
  }

  /**
   * Track custom event
   */
  public track(eventName: string, properties?: Record<string, unknown>) {
    if (!this.isEnabled || !this.session) return

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        session_id: this.session.sessionId,
        page: window.location.pathname,
        ...properties
      },
      timestamp: Date.now()
    }

    this.session.events.push(event)
    this.sendEvent(event)
  }

  private sendEvent(event: AnalyticsEvent) {
    // In development, just log
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event)
      return
    }

    // Send to analytics service
    // Example: Google Analytics 4
    if ('gtag' in window) {
      // @ts-expect-error - gtag is added dynamically by Google Analytics
      window.gtag('event', event.name, event.properties)
    }

    // Example: Send to custom analytics endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).catch(error => {
      console.warn('Failed to send analytics event:', error)
    })
  }

  /**
   * Track user interaction
   */
  public trackInteraction(element: string, action: string, value?: string | number) {
    this.track('user_interaction', {
      element,
      action,
      value,
      timestamp: Date.now()
    })
  }

  /**
   * Track form submission
   */
  public trackFormSubmission(formName: string, success: boolean, errors?: string[]) {
    this.track('form_submission', {
      form_name: formName,
      success,
      errors: errors?.join(', '),
      timestamp: Date.now()
    })
  }

  /**
   * Track download
   */
  public trackDownload(fileName: string, fileType: string) {
    this.track('download', {
      file_name: fileName,
      file_type: fileType,
      timestamp: Date.now()
    })
  }

  /**
   * Track scroll depth
   */
  public trackScrollDepth(depth: number) {
    this.track('scroll_depth', {
      depth,
      page: window.location.pathname,
      timestamp: Date.now()
    })
  }

  /**
   * Track time on page
   */
  public trackTimeOnPage(timeInSeconds: number) {
    this.track('time_on_page', {
      time_seconds: timeInSeconds,
      page: window.location.pathname,
      timestamp: Date.now()
    })
  }

  /**
   * Get session data
   */
  public getSession(): UserSession | null {
    return this.session
  }
}

// Create singleton instance
export const analytics = new Analytics()

/**
 * React hook for analytics
 */
export function useAnalytics() {
  const trackEvent = (name: string, properties?: Record<string, unknown>) => {
    analytics.track(name, properties)
  }

  const trackPageView = (page: string, title?: string) => {
    analytics.trackPageView(page, title)
  }

  const trackInteraction = (element: string, action: string, value?: string | number) => {
    analytics.trackInteraction(element, action, value)
  }

  return {
    trackEvent,
    trackPageView,
    trackInteraction,
    setConsent: analytics.setConsent.bind(analytics),
    getSession: analytics.getSession.bind(analytics)
  }
}

/**
 * Simple analytics page tracking function
 */
export function trackPageAnalytics(pageName: string) {
  if (typeof window !== 'undefined') {
    analytics.trackPageView(pageName)
  }
}

/**
 * Scroll depth tracker
 */
export function initializeScrollTracking() {
  if (typeof window === 'undefined') return

  let maxScrollDepth = 0
  const scrollDepthSent = new Set<number>()

  const trackScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    const scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100)
    
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth
      
      // Track at 25%, 50%, 75%, and 100%
      const milestones = [25, 50, 75, 100]
      milestones.forEach(milestone => {
        if (scrollDepth >= milestone && !scrollDepthSent.has(milestone)) {
          analytics.trackScrollDepth(milestone)
          scrollDepthSent.add(milestone)
        }
      })
    }
  }

  let ticking = false
  const scrollHandler = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        trackScroll()
        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener('scroll', scrollHandler, { passive: true })
  
  return () => {
    window.removeEventListener('scroll', scrollHandler)
  }
}

/**
 * Time on page tracker
 */
export function initializeTimeTracking() {
  if (typeof window === 'undefined') return

  const startTime = Date.now()
  let timeTracked = false

  const trackTimeOnPage = () => {
    if (timeTracked) return
    
    const timeOnPage = Math.round((Date.now() - startTime) / 1000)
    analytics.trackTimeOnPage(timeOnPage)
    timeTracked = true
  }

  // Track time when user leaves page
  window.addEventListener('beforeunload', trackTimeOnPage)
  window.addEventListener('pagehide', trackTimeOnPage)
  
  return () => {
    window.removeEventListener('beforeunload', trackTimeOnPage)
    window.removeEventListener('pagehide', trackTimeOnPage)
  }
}
