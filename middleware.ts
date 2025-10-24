import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Production-ready rate limiter with Upstash Redis (with fallback to in-memory)
let ratelimit: Ratelimit | null = null

// Disable rate limiting in development/test environments
const isProduction = process.env.NODE_ENV === 'production'
const RATE_LIMIT_ENABLED = isProduction && process.env.DISABLE_RATE_LIMIT !== 'true'

if (RATE_LIMIT_ENABLED) {
  // Try to initialize Upstash Redis rate limiting
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
        analytics: true,
        prefix: '@upstash/ratelimit',
      })
      console.log('✅ Upstash Redis rate limiting enabled')
    } catch (error) {
      console.warn('⚠️ Upstash Redis initialization failed, falling back to in-memory rate limiting', error)
    }
  } else {
    console.log('ℹ️  Using in-memory rate limiting (set UPSTASH_REDIS_REST_URL for production)')
  }
} else {
  console.log('⚠️  Rate limiting DISABLED (development/test mode)')
}

// Fallback: Simple in-memory rate limiter for development
const RATE_WINDOW_MS = 10_000 // 10 seconds
const RATE_MAX = 10 // max requests per window per IP
const ipHits = new Map<string, number[]>()
const actorHits = new Map<string, number[]>() // user-based keys

function allowRequestInMemory(key: string, map: Map<string, number[]>, max = RATE_MAX): boolean {
  const now = Date.now()
  const bucket = map.get(key) || []
  const recent = bucket.filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  map.set(key, recent)
  return recent.length <= max
}

async function checkRateLimitKey(key: string, max = RATE_MAX): Promise<boolean> {
  // Use Upstash if available, otherwise fall back to in-memory
  if (ratelimit) {
    const { success } = await ratelimit.limit(key)
    return success
  }
  // Use a separate map for user keys vs IP keys to avoid collisions
  const useMap = key.startsWith('user:') ? actorHits : ipHits
  return allowRequestInMemory(key, useMap, max)
}

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf
  return '127.0.0.1'
}

export const config = {
  // Apply to admin, API, and all app routes except static assets and Next internals
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/((?!_next|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const secure = request.nextUrl.protocol === 'https:'

  // Base response we may mutate (e.g., set cookies)
  let response = NextResponse.next()

  // Basic API rate limit (skip in development)
  if (isApi && RATE_LIMIT_ENABLED) {
    const ip = getClientIp(request)
    const allowed = await checkRateLimitKey(`ip:${ip}`)
    if (!allowed) {
      console.warn(`[RATE_LIMIT] ${ip} → ${pathname}`)
      return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
    }

    // CSRF/Origin check for state-changing requests
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
      const origin = request.headers.get('origin') || ''
      const host = request.headers.get('host') || ''
      try {
        const originHost = origin ? new URL(origin).host : ''
        if (!originHost || originHost !== host) {
          console.warn(`[CSRF_FAIL] origin=${originHost}, host=${host}, path=${pathname}`)
          return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
        }
      } catch {
        console.warn(`[CSRF_ERROR] Invalid origin header for ${pathname}`)
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
      }

      // Enforce CSRF token (double submit cookie pattern)
      const csrfHeader = request.headers.get('x-csrf-token') || ''
      const csrfCookie = request.cookies.get('csrf-token')?.value || ''
      if (!csrfCookie || !csrfHeader || csrfHeader !== csrfCookie) {
        console.warn(`[CSRF_TOKEN_FAIL] path=${pathname}`)
        return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
      }
    }

    // Per-user rate limiting for general API (skip admin; it's handled below) (skip in development)
    if (RATE_LIMIT_ENABLED && !isAdminPath && !pathname.startsWith('/api/me')) {
      try {
        const meUrl = new URL('/api/me', request.url)
        const meRes = await fetch(meUrl, {
          headers: {
            cookie: request.headers.get('cookie') || '',
            authorization: request.headers.get('authorization') || '',
            'x-auth-token': request.headers.get('x-auth-token') || '',
          },
          cache: 'no-store',
        })
        if (meRes.ok) {
          const meJson = await meRes.json()
          const mePayload = meJson?.data ?? meJson
          const userId: string | undefined = mePayload?.user?.id ? String(mePayload.user.id) : undefined
          if (userId) {
            const allowedUser = await checkRateLimitKey(`user:${userId}`)
            if (!allowedUser) {
              console.warn(`[RATE_LIMIT_USER] user=${userId} → ${pathname}`)
              return new NextResponse(JSON.stringify({ error: 'Too Many Requests (user)' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
            }
          }
        }
      } catch {
        // Ignore errors here; endpoint-specific auth will handle permissions
      }
    }
  }

  // Admin route protection
  if (isAdminPath) {
    try {
      const meUrl = new URL('/api/me', request.url)
      const res = await fetch(meUrl, {
        headers: {
          cookie: request.headers.get('cookie') || '',
          authorization: request.headers.get('authorization') || '',
          'x-auth-token': request.headers.get('x-auth-token') || '',
        },
        cache: 'no-store',
      })
      if (!res.ok) {
        if (isApi) {
          return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      const meJson = await res.json()
      const mePayload = meJson?.data ?? meJson
      const roles: string[] = Array.isArray(mePayload?.roles) ? mePayload.roles : []
      // Allow 'checkin' role for scanner UI and check-in API
      const isScannerUI = /^\/admin\/events\/[^/]+\/scan$/.test(pathname)
      const isCheckinAPI = pathname === '/api/admin/rsvps/checkin'
      const allowCheckin = (isScannerUI || isCheckinAPI) && roles.includes('checkin')
      if (!roles.includes('admin') && !allowCheckin) {
        if (isApi) {
          return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // Per-user rate limiting for admin endpoints (skip in development)
      if (RATE_LIMIT_ENABLED) {
        const userId: string | undefined = mePayload?.user?.id ? String(mePayload.user.id) : undefined
        if (userId) {
          const allowedUser = await checkRateLimitKey(`user:${userId}`)
          if (!allowedUser) {
            console.warn(`[RATE_LIMIT_USER] user=${userId} → ${pathname}`)
            return new NextResponse(JSON.stringify({ error: 'Too Many Requests (user)' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
          }
        }
      }
    } catch {
      if (isApi) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // NOTE: Profile completion check moved to client-side AuthProvider
  // to avoid performance bottleneck (fetching /api/me/profile on every page load)
  // See app/providers.tsx for implementation

  // Ensure CSRF cookie is set for subsequent requests
  if (!request.cookies.get('csrf-token')) {
    const token = crypto.randomUUID()
    response.cookies.set('csrf-token', token, {
      httpOnly: false,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  }

  return response
}
