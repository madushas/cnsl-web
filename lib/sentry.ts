import * as Sentry from "@sentry/nextjs";

/**
 * Capture an exception with additional context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a message with additional context
 */
export function captureMessage(
  message: string, 
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>
) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}) {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category: category || "custom",
    level: level || "info",
    data,
  });
}

/**
 * Start a new span for performance monitoring
 */
export function startSpan<T>(
  name: string,
  op: string = "custom",
  fn: (span: Sentry.Span) => T
): T {
  return Sentry.startSpan({ name, op }, fn);
}

/**
 * Wrap an async function with error tracking
 */
export function withSentry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        captureException(error, context);
      }
      throw error;
    }
  }) as T;
}

/**
 * Wrap a sync function with error tracking
 */
export function withSentrySync<T extends (...args: any[]) => any>(
  fn: T,
  context?: Record<string, any>
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        captureException(error, context);
      }
      throw error;
    }
  }) as T;
}

/**
 * Track API route performance and errors
 */
export function withSentryAPI<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  routeName: string
): T {
  return (async (...args: Parameters<T>) => {
    return await Sentry.startSpan(
      { 
        name: `API ${routeName}`, 
        op: "http.server",
        attributes: {
          "http.route": routeName,
        }
      },
      async (span) => {
        try {
          const response = await handler(...args);
          
          // Set span attributes
          span.setAttributes({
            "http.status_code": response.status,
            "http.response.status_code": response.status,
          });
          
          // Set span status based on response
          if (response.status >= 400) {
            span.setStatus({ code: 2, message: "internal_error" });
          } else {
            span.setStatus({ code: 1, message: "ok" });
          }
          
          return response;
        } catch (error) {
          span.setStatus({ code: 2, message: "internal_error" });
          
          if (error instanceof Error) {
            captureException(error, {
              route: routeName,
              args: args.length > 0 ? { argsCount: args.length } : undefined,
            });
          }
          
          throw error;
        }
      }
    );
  }) as T;
}

export { Sentry };