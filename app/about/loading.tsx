export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card" aria-label="Loading about page">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" aria-hidden="true"></div>
        <p className="text-foreground text-lg font-medium">Loading about CNSL...</p>
      </div>
    </div>
  )
}
