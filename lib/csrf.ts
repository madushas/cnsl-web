"use client"

export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null
  const entry = document.cookie.split('; ').find((c) => c.startsWith('csrf-token='))
  return entry ? decodeURIComponent(entry.split('=')[1]) : null
}

export function withCSRF(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFToken()
  if (!token) return headers
  return { ...(headers as any), 'x-csrf-token': token }
}
