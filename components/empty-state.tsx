import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "Nothing to show",
  subtitle = "Try adjusting your filters or check back later.",
  actionHref,
  actionLabel,
}: {
  title?: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card card-padding-lg text-center gap-3">
      <div className="text-lg font-semibold text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground max-w-md">{subtitle}</div>
      {actionHref && actionLabel && (
        <Button asChild className="mt-2">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
