'use client'

export default function AboutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('About page error:', error)
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We encountered an error while loading the about page. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
