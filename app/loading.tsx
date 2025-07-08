import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background" role="status" aria-label="Loading page content">
      <span className="sr-only">Loading...</span>
      
      {/* Header skeleton */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Hero section skeleton */}
          <div className="text-center">
            <Skeleton className="mx-auto mb-4 h-12 w-3/4" />
            <Skeleton className="mx-auto mb-6 h-6 w-1/2" />
            <Skeleton className="mx-auto h-10 w-32" />
          </div>

          {/* Content grid skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border p-6">
              <Skeleton className="mb-4 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="rounded-lg border border-border p-6">
              <Skeleton className="mb-4 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="rounded-lg border border-border p-6">
              <Skeleton className="mb-4 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="rounded-lg border border-border p-6">
              <Skeleton className="mb-4 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="rounded-lg border border-border p-6">
              <Skeleton className="mb-4 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="rounded-lg border border-border p-6">
              <Skeleton className="mb-4 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
