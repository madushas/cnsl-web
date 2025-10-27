// Sentry Server Configuration for Node.js Runtime
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const IS_PRODUCTION = ENVIRONMENT === "production";
const IS_DEVELOPMENT = ENVIRONMENT === "development";

// Only initialize Sentry if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    
    // Performance monitoring - lower sample rate for server
    tracesSampleRate: IS_PRODUCTION ? 0.05 : 1.0,
    
    // Debug mode
    debug: IS_DEVELOPMENT,
    
    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA,

    enableLogs: true,
    
    // Server-specific configuration
    maxBreadcrumbs: 50,
    attachStacktrace: true,
    
    // Filter out expected Next.js errors and noise
    ignoreErrors: [
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
      "DYNAMIC_SERVER_USAGE",
      /NotFoundError/,
      /RedirectError/,
    ],
    
    // Custom error filtering
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (IS_DEVELOPMENT && !process.env.SENTRY_DEBUG) {
        return null;
      }
      
      const error = hint.originalException;
      
      // Filter out authentication errors (expected behavior)
      if (error && typeof error === "object" && "message" in error) {
        const message = String(error.message).toLowerCase();
        if (
          message.includes("unauthorized") ||
          message.includes("not authenticated") ||
          message.includes("invalid token") ||
          message.includes("session expired") ||
          message.includes("csrf") ||
          message.includes("forbidden")
        ) {
          return null;
        }
      }
      
      // Filter out database connection errors in development
      if (IS_DEVELOPMENT && error && typeof error === "object" && "code" in error) {
        const code = String(error.code);
        if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
          return null;
        }
      }
      
      return event;
    },
    
    // Add server context
    initialScope: {
      tags: {
        component: "server",
        runtime: "nodejs",
      },
    },
  });
}

export {};
