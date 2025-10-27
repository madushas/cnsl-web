import "server-only";

// Enhanced structured logger with sanitization
interface LogMeta extends Record<string, unknown> {
  duration?: number;
  userId?: string;
  ip?: string;
  endpoint?: string;
  statusCode?: number;
  error?: Error | string;
}

const SENSITIVE_FIELDS = [
  "password",
  "token",
  "apiKey",
  "secret",
  "authorization",
  "cookie",
  "hp",
];

// Endpoint-level info/warn/api logs are disabled by default.
// Set ENABLE_ENDPOINT_LOGS='true' in environment to enable them.
const ENABLE_ENDPOINT_LOGS = process.env.ENABLE_ENDPOINT_LOGS === "true";

// Sanitize sensitive data from logs
function sanitize(meta?: LogMeta): LogMeta {
  if (!meta) return {};

  const cleaned: LogMeta = {};
  for (const [key, value] of Object.entries(meta)) {
    const keyLower = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((field) => keyLower.includes(field))) {
      cleaned[key] = "[REDACTED]";
    } else if (value instanceof Error) {
      cleaned[key] = {
        message: value.message,
        stack: process.env.NODE_ENV === "development" ? value.stack : undefined,
        name: value.name,
      };
    } else if (typeof value === "object" && value !== null) {
      cleaned[key] = sanitize(value as LogMeta);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export const logger = {
  info: (msg: string, meta?: LogMeta) => {
    if (!ENABLE_ENDPOINT_LOGS) return; // endpoint logs disabled by default
    if (process.env.NODE_ENV !== "test") {
      const timestamp = new Date().toISOString();
      console.log(
        JSON.stringify({
          level: "INFO",
          timestamp,
          message: msg,
          ...sanitize(meta),
        }),
      );
    }
  },

  warn: (msg: string, meta?: LogMeta) => {
    if (!ENABLE_ENDPOINT_LOGS) return; // endpoint logs disabled by default
    if (process.env.NODE_ENV !== "test") {
      const timestamp = new Date().toISOString();
      console.warn(
        JSON.stringify({
          level: "WARN",
          timestamp,
          message: msg,
          ...sanitize(meta),
        }),
      );
    }
  },

  error: (msg: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV !== "test") {
      const timestamp = new Date().toISOString();
      console.error(
        JSON.stringify({
          level: "ERROR",
          timestamp,
          message: msg,
          ...sanitize(meta),
        }),
      );
    }
  },

  // Log slow database queries
  slowQuery: (query: string, duration: number, meta?: LogMeta) => {
    if (duration > 1000) {
      // Log if >1s
      logger.warn("Slow database query", {
        query: query.substring(0, 200),
        duration,
        ...meta,
      });
    }
  },

  // Log API request/response
  api: (
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    meta?: LogMeta,
  ) => {
    if (!ENABLE_ENDPOINT_LOGS) return; // endpoint logs disabled by default
    if (statusCode >= 400 || duration > 3000) {
      logger.warn("API request", {
        method,
        endpoint,
        statusCode,
        duration,
        ...meta,
      });
    } else if (process.env.LOG_ALL_REQUESTS === "true") {
      logger.info("API request", {
        method,
        endpoint,
        statusCode,
        duration,
        ...meta,
      });
    }
  },
};
