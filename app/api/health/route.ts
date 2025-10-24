import 'server-only'
import { NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

interface HealthCheck {
  status: HealthStatus
  timestamp: string
  uptime: number
  checks: {
    database: {
      status: 'up' | 'down'
      responseTime?: number
      error?: string
    }
    redis?: {
      status: 'up' | 'down'
      responseTime?: number
      error?: string
    }
  }
  version: string
}

export async function GET() {
  const startTime = Date.now()
  const checks: HealthCheck['checks'] = {
    database: { status: 'down' },
  }

  let overallStatus: HealthStatus = 'healthy'

  // Check database
  try {
    const dbStart = Date.now()
    await db.execute(sql`SELECT 1`)
    checks.database = {
      status: 'up',
      responseTime: Date.now() - dbStart,
    }
  } catch (error: any) {
    checks.database = {
      status: 'down',
      error: error.message || 'Database connection failed',
    }
    overallStatus = 'unhealthy'
  }

  // Check Redis (optional - only if UPSTASH_REDIS_REST_URL is set)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const redisStart = Date.now()
      const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      })
      if (response.ok) {
        checks.redis = {
          status: 'up',
          responseTime: Date.now() - redisStart,
        }
      } else {
        throw new Error('Redis ping failed')
      }
    } catch (error: any) {
      checks.redis = {
        status: 'down',
        error: error.message || 'Redis connection failed',
      }
      // Redis failure is degraded, not unhealthy (it's for rate limiting only)
      if (overallStatus === 'healthy') overallStatus = 'degraded'
    }
  }

  const health: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
  }

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
