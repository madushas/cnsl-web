import 'server-only'
import { logger } from './logger'

/**
 * Centralized request logger utility
 *
 * - Sanitizes headers and nested objects to avoid logging secrets
 * - Provides helpers to log incoming requests and errors in a consistent, structured way
 *
 * Usage:
 *   import { logRequest, logError } from '@/lib/request-logger'
 *
 *   logRequest({
 *     method: req.method,
 *     path: req.url,
 *     headers: Object.fromEntries(req.headers.entries()),
 *     query: Object.fromEntries(new URL(req.url).searchParams.entries()),
 *     ip: ipValue,
 *     user: safeUserObject,
 *     body: maybeBody,
 *   })
 *
 * Notes:
 * - This module intentionally avoids logging raw cookies, auth tokens, passwords, API keys, etc.
 * - It will redact fields that match the SENSITIVE_KEYWORDS list (case-insensitive substring match).
 */

/* -------------------------------------------------------------------------- */
/* Configuration                                                               */
/* -------------------------------------------------------------------------- */

const SENSITIVE_KEYWORDS = [
  'password',
  'pwd',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'api_key',
  'apikey',
  'secret',
  'set-cookie',
  'cookie',
  'hp',
]

const MAX_STRING_LOG_LENGTH = 1024
const MAX_OBJECT_RECURSION = 3

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type RequestMeta = {
  method?: string
  path?: string
  query?: Record<string, string> | null
  headers?: Record<string, string | undefined> | Headers | null
  ip?: string | undefined
  origin?: string | undefined
  userAgent?: string | undefined
  body?: any
  user?: { id?: string; email?: string | null; name?: string | null } | any
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function isSensitiveKey(key: string) {
  const k = (key || '').toLowerCase()
  return SENSITIVE_KEYWORDS.some((kw) => k.includes(kw))
}

/**
 * Convert a Headers object or a plain record to a normalized plain object of strings
 */
export function normalizeHeaders(
  headers?: Record<string, string | undefined> | Headers | null,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  if (!headers) return out

  if (typeof (headers as Headers).entries === 'function') {
    // Headers-like
    for (const [k, v] of (headers as Headers).entries()) {
      out[k] = v
    }
    return out
  }

  for (const [k, v] of Object.entries(headers as Record<string, string | undefined>)) {
    out[k] = v
  }
  return out
}

/**
 * Sanitize headers by redacting sensitive header values.
 */
export function sanitizeHeaders(
  headers?: Record<string, string | undefined> | Headers | null,
): Record<string, string> {
  const normalized = normalizeHeaders(headers)
  const safe: Record<string, string> = {}
  for (const [k, v] of Object.entries(normalized)) {
    const key = k.toLowerCase()
    if (isSensitiveKey(key)) {
      safe[k] = '[REDACTED]'
      continue
    }
    if (v === undefined || v === null) {
      safe[k] = ''
      continue
    }
    // Avoid logging extremely long header values
    safe[k] = typeof v === 'string' && v.length > MAX_STRING_LOG_LENGTH
      ? `${v.slice(0, MAX_STRING_LOG_LENGTH)}...[TRUNCATED]`
      : v
  }
  return safe
}

/**
 * Recursively sanitize an object by redacting sensitive keys and truncating large strings.
 * Keeps recursion bounded to avoid pathological structures.
 */
export function sanitizeObject(obj: any, depth = 0): any {
  if (depth > MAX_OBJECT_RECURSION) {
    return '[REDACTED-DEPTH]'
  }
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') {
    if (obj.length > MAX_STRING_LOG_LENGTH) {
      return obj.slice(0, MAX_STRING_LOG_LENGTH) + '...[TRUNCATED]'
    }
    return obj
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) {
    return obj.map((v) => sanitizeObject(v, depth + 1))
  }
  if (typeof obj === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (isSensitiveKey(k)) {
        out[k] = '[REDACTED]'
      } else {
        out[k] = sanitizeObject(v, depth + 1)
      }
    }
    return out
  }
  // fallback
  try {
    return String(obj)
  } catch {
    return '[UNSERIALIZABLE]'
  }
}

/**
 * Extract a minimal safe representation of a user/session object
 */
export function safeUserView(user: any) {
  if (!user) return undefined
  try {
    return {
      id: user?.id ?? user?.userId ?? undefined,
      email: user?.email ?? undefined,
      name: user?.name ?? undefined,
    }
  } catch {
    return undefined
  }
}

/* -------------------------------------------------------------------------- */
/* Logging API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Log an incoming request (sanitized).
 *
 * This uses the shared `logger` so logs are structured and consistent across the app.
 */
export function logRequest(meta: RequestMeta) {
  try {
    const {
      method,
      path,
      query,
      headers,
      ip,
      origin,
      userAgent,
      body,
      user,
    } = meta

    const safeHeaders = sanitizeHeaders(headers ?? null)
    const safeBody = typeof body === 'object' ? sanitizeObject(body) : sanitizeObject(String(body ?? ''))
    const safeUser = safeUserView(user)

    logger.info('request.incoming', {
      method: method ?? undefined,
      path: path ?? undefined,
      query: query ?? undefined,
      ip: ip ?? undefined,
      origin: origin ?? undefined,
      userAgent: userAgent ?? safeHeaders['user-agent'] ?? undefined,
      headers: safeHeaders,
      body: safeBody,
      user: safeUser,
    })
  } catch (e) {
    // Keep the fallback minimal — don't throw from logging code
    try {
      logger.warn('request.incoming.failed', { error: e instanceof Error ? e.message : String(e) })
    } catch {}
  }
}

/**
 * Log an error related to a request/operation.
 *
 * `context` should be a brief string describing where/what failed (e.g. "admin.ticketTemplates.POST")
 */
export function logError(context: string, error: unknown, meta?: Record<string, any>) {
  try {
    const errMsg = error instanceof Error ? error.message : String(error ?? 'unknown')
    const errStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined
    logger.error(context, {
      error: errMsg,
      stack: errStack,
      meta: meta ? sanitizeObject(meta) : undefined,
    })
  } catch (e) {
    try {
      console.error(`[request-logger] failed to log error for ${context}`, e)
    } catch {}
  }
}

/* -------------------------------------------------------------------------- */
/* Convenience helpers                                                         */
/* -------------------------------------------------------------------------- */

export default {
  logRequest,
  logError,
  sanitizeHeaders,
  sanitizeObject,
  safeUserView,
}
