import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 pt-12 pb-20 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 rounded-md bg-white/10" />
        <Skeleton className="h-5 w-80 rounded-md bg-white/10" />
      </div>

      {/* Next Up card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-0 md:grid-cols-2">
          <Skeleton className="aspect-video w-full bg-white/10" />
          <div className="card-padding md:card-padding-lg space-y-3">
            <Skeleton className="h-5 w-24 bg-white/10" />
            <Skeleton className="h-7 w-3/4 bg-white/10" />
            <Skeleton className="h-4 w-1/2 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-10 w-28 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20 bg-white/10" />
            <Skeleton className="h-9 w-full bg-white/10" />
          </div>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <Skeleton className="aspect-video w-full bg-white/10" />
            <div className="card-padding space-y-2">
              <Skeleton className="h-6 w-3/4 bg-white/10" />
              <Skeleton className="h-4 w-1/2 bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-9 w-24 rounded-full bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
