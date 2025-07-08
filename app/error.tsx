'use client';

import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  console.error('Application error:', error)
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="alert" aria-live="assertive">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-destructive/10 p-3">
          <svg
            className="h-6 w-6 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Something went wrong!
        </h2>
        <p className="mb-6 text-muted-foreground">
          We apologize for the inconvenience. An error occurred while processing your request.
        </p>
        <Button
          onClick={reset}
          className="inline-flex items-center gap-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Retry
        </Button>
      </div>
    </div>
  )
}