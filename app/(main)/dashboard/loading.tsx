import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 pt-12 pb-20 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 rounded-md bg-white/10" />
        <Skeleton className="h-5 w-80 rounded-md bg-white/10" />
      </div>

      {/* Upcoming list placeholder */}
      <div>
        <Skeleton className="h-6 w-40 mb-3 bg-white/10" />
        <ul className="space-y-3">
          {[0,1,2].map(i => (
            <li key={i} className="rounded-md border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-5 w-56 bg-white/10" />
                  <Skeleton className="h-3 w-72 bg-white/10" />
                  <Skeleton className="h-3 w-32 bg-white/10" />
                </div>
                <Skeleton className="h-8 w-24 rounded-md bg-white/10" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Past list placeholder */}
      <div>
        <Skeleton className="h-6 w-36 mb-3 bg-white/10" />
        <ul className="space-y-3">
          {[0,1].map(i => (
            <li key={i} className="rounded-md border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-5 w-56 bg-white/10" />
                  <Skeleton className="h-3 w-72 bg-white/10" />
                </div>
                <Skeleton className="h-8 w-28 rounded-md bg-white/10" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
