import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 section-spacing-sm">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24 bg-white/10" />
          <Skeleton className="h-10 w-3/4 bg-white/10" />
          <Skeleton className="h-4 w-1/2 bg-white/10" />
        </div>
        <Skeleton className="aspect-video w-full rounded-xl bg-white/10" />
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
