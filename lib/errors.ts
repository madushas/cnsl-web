import 'server-only'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

export function handleApiError(e: unknown) {
  // Validation errors
  if (e instanceof ZodError) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  }

  // Known typed errors
  if (e instanceof AppError) {
    return NextResponse.json({ error: e.message, code: e.code }, { status: e.statusCode })
  }

  // Common auth/permission cases thrown as plain Errors
  if (e instanceof Error) {
    const msg = e.message.toLowerCase()
    if (msg.includes('unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (msg.includes('forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (msg.includes('not found')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }

  // Unexpected
  logger.error('Unexpected API error', { error: e instanceof Error ? e : String(e) })
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
