'use client'

import { Button } from '@/components/ui/button'

export default function EventsError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  console.error('Events page error:', error)
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Events Temporarily Unavailable</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load the events page. Please try refreshing or check back later.
        </p>
        <Button
          onClick={reset}
          className="bg-gradient-to-r from-primary to-secondary text-white transition-all duration-300 hover:shadow-lg transform hover:scale-105"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}
