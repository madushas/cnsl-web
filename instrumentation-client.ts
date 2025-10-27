// Sentry Client Configuration for Browser
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development";
const IS_PRODUCTION = ENVIRONMENT === "production";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

// Only initialize Sentry if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    
    // Performance monitoring
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,
    
    // Session replay for debugging
    replaysOnErrorSampleRate: IS_PRODUCTION ? 1.0 : 1.0,
    replaysSessionSampleRate: IS_PRODUCTION ? 0.01 : 0.1,
    
    // Debug mode
    debug: IS_DEVELOPMENT,

    enableLogs: true,
    
    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: IS_PRODUCTION,
        blockAllMedia: IS_PRODUCTION,
        maskAllInputs: IS_PRODUCTION,
      }),
    ],
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    
    // Filter out noise and sensitive errors
    ignoreErrors: [
      // Browser extensions
      "Non-Error promise rejection captured",
      "ResizeObserver loop limit exceeded",
      "Script error.",
      
      // Network errors that are expected
      "NetworkError",
      "Failed to fetch",
      "Load failed",
      "ChunkLoadError",
      
      // Browser quirks
      "AbortError",
      "NotAllowedError",
      
      // Third-party errors
      /extension\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
    
    // Filter transactions
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (IS_DEVELOPMENT && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
        return null;
      }
      
      // Filter out authentication-related errors that are expected
      const error = hint.originalException;
      if (error && typeof error === "object" && "message" in error) {
        const message = String(error.message).toLowerCase();
        if (
          message.includes("unauthorized") ||
          message.includes("not authenticated") ||
          message.includes("invalid token") ||
          message.includes("session expired")
        ) {
          return null;
        }
      }
      
      return event;
    },
    
    // Add user context
    initialScope: {
      tags: {
        component: "client",
        runtime: "browser",
      },
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
