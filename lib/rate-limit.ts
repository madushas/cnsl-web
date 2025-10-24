/**
 * Enhanced rate limiting for expensive operations
 * SEC-05 fix: Prevent admin abuse/accidents on resource-intensive endpoints
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory fallback for development
const expensiveOpsHits = new Map<string, { ts: number; count: number }>()

/**
 * Check rate limit for expensive operations (bulk email, QR generation)
 * 
 * @param key - Unique identifier (e.g., "admin:userId:bulk-email")
 * @param limit - Max requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns true if allowed, false if rate limited
 */
export async function checkExpensiveOpLimit(
  key: string,
  limit: number = 1,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  // Try Upstash Redis if configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        analytics: true,
        prefix: '@upstash/ratelimit/expensive',
      })
      
      const result = await ratelimit.limit(key)
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetAt: new Date(result.reset),
      }
    } catch (error) {
      console.warn('Upstash rate limit check failed, using in-memory fallback', error)
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const existing = expensiveOpsHits.get(key)
  
  if (!existing || now - existing.ts >= windowMs) {
    // New window or expired
    expensiveOpsHits.set(key, { ts: now, count: 1 })
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(now + windowMs),
    }
  }

  // Within window
  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.ts + windowMs),
    }
  }

  // Increment count
  existing.count++
  expensiveOpsHits.set(key, existing)
  
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: new Date(existing.ts + windowMs),
  }
}

/**
 * Cleanup old entries (call periodically if using in-memory)
 */
export function cleanupExpensiveOpsCache() {
  const now = Date.now()
  const maxAge = 5 * 60 * 1000 // 5 minutes
  
  for (const [key, value] of expensiveOpsHits.entries()) {
    if (now - value.ts > maxAge) {
      expensiveOpsHits.delete(key)
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpensiveOpsCache, 5 * 60 * 1000)
}
