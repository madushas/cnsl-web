// This file configures Sentry for the server (Node.js/Edge runtime)
// To enable: Install @sentry/nextjs and uncomment this code

/*
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  environment: process.env.NODE_ENV,
  
  // Filter out noise
  ignoreErrors: [
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
  
  beforeSend(event, hint) {
    // Don't send authentication errors to Sentry
    const error = hint.originalException
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message)
      if (message.includes('Unauthorized') || message.includes('Not authenticated')) {
        return null
      }
    }
    return event
  },
})
*/

export {}
