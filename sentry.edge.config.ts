// Sentry Edge Runtime Configuration for Middleware and Edge Routes
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

    // Lower sample rate for edge runtime due to resource constraints
    tracesSampleRate: IS_PRODUCTION ? 0.01 : 0.1,

    // Debug mode
    debug: IS_DEVELOPMENT,

    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA,

    enableLogs: true,

    // Edge runtime has limited capabilities
    maxBreadcrumbs: 20,

    // Filter out middleware noise
    ignoreErrors: [
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
      /NotFoundError/,
      /RedirectError/,
    ],

    // Minimal error filtering for edge runtime
    beforeSend(event, hint) {
      // Don't send events in development
      if (IS_DEVELOPMENT && !process.env.SENTRY_DEBUG) {
        return null;
      }

      return event;
    },

    // Add edge context
    initialScope: {
      tags: {
        component: "edge",
        runtime: "edge",
      },
    },
  });
}

export { };
