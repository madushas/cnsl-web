import 'server-only'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Standardized API response types following the audit recommendations
 */

export type ApiSuccess<T = any> = {
  success: true
  data: T
  meta?: {
    pagination?: { page: number; total: number; pageSize: number; totalPages: number }
    requestId?: string
  }
}

export type ApiError = {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
  }
  meta?: {
    requestId?: string
  }
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'INVALID_CONTENT_TYPE'
  | 'BAD_REQUEST'

/**
 * Generate a request ID for tracing
 */
export function generateRequestId(): string {
  return crypto.randomUUID()
}

/**
 * Create a standardized success response
 */
export function apiSuccess<T>(
  data: T,
  status: number = 200,
  meta?: ApiSuccess<T>['meta']
): NextResponse<ApiSuccess<T>> {
  const requestId = meta?.requestId || generateRequestId()
  
  return NextResponse.json(
    {
      success: true,
      data,
      meta: { ...meta, requestId }
    },
    {
      status,
      headers: {
        'X-Request-ID': requestId
      }
    }
  )
}

/**
 * Create a standardized error response
 */
export function apiError(
  code: ErrorCode,
  message: string,
  status: number = 400,
  details?: Array<{ field: string; message: string }>,
  requestId?: string
): NextResponse<ApiError> {
  const reqId = requestId || generateRequestId()
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details })
      },
      meta: { requestId: reqId }
    },
    {
      status,
      headers: {
        'X-Request-ID': reqId
      }
    }
  )
}

/**
 * Handle Zod validation errors
 */
export function validationError(error: ZodError<any>, requestId?: string): NextResponse<ApiError> {
  const details = error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message
  }))
  
  return apiError('VALIDATION_ERROR', 'Validation failed', 400, details, requestId)
}

/**
 * Standard 204 No Content response (for DELETE operations)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Standard 201 Created response
 */
export function created<T>(data: T, meta?: ApiSuccess<T>['meta']): NextResponse<ApiSuccess<T>> {
  return apiSuccess(data, 201, meta)
}

/**
 * Helper for pagination metadata
 */
export function paginationMeta(page: number, pageSize: number, total: number) {
  return {
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}

/**
 * Parse and validate pagination query params
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '20')))
  
  return {
    page,
    limit,
    offset: (page - 1) * limit
  }
}
