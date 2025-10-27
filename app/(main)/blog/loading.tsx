import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 pt-12 pb-20 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 rounded-md bg-white/10" />
        <Skeleton className="h-5 w-80 rounded-md bg-white/10" />
      </div>

      <div className="grid gap-0 md:grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card">
        <Skeleton className="aspect-video w-full bg-white/10" />
        <div className="card-padding md:card-padding-lg space-y-3">
          <Skeleton className="h-6 w-40 bg-white/10" />
          <Skeleton className="h-7 w-3/4 bg-white/10" />
          <Skeleton className="h-4 w-1/2 bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <Skeleton className="aspect-4/3 w-full bg-white/10" />
            <div className="card-padding space-y-2">
              <Skeleton className="h-6 w-3/4 bg-white/10" />
              <Skeleton className="h-4 w-1/2 bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
