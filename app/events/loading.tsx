export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-card">
      <div className="text-center" aria-live="polite" aria-label="Loading events">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" aria-hidden="true"></div>
        <p className="text-foreground text-lg font-medium">Loading Events...</p>
      </div>
    </div>
  )
}
