import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";

type ActiveFilterBadgeProps = {
  label: string;
  value: string | number;
  onClear: () => void;
};

export function ActiveFilterBadge({
  label,
  value,
  onClear,
}: ActiveFilterBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="gap-1.5 pr-1 hover:bg-secondary/80 transition-colors text-sm font-normal group"
    >
      <span className="text-xs font-medium text-muted-foreground">
        {label}:
      </span>
      <span className="font-medium">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 ml-0.5 hover:bg-secondary-foreground/10 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        aria-label={`Clear ${label} filter`}
      >
        <IconX className="h-3 w-3" />
      </Button>
    </Badge>
  );
}

type ActiveFiltersBarProps = {
  filters: Array<{
    label: string;
    value: string | number;
    onClear: () => void;
  }>;
  onClearAll?: () => void;
};

export function ActiveFiltersBar({
  filters,
  onClearAll,
}: ActiveFiltersBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border animate-in fade-in-50 duration-200">
      <span className="text-sm text-muted-foreground shrink-0">
        Active filters:
      </span>

      {filters.map((filter, index) => (
        <ActiveFilterBadge
          key={`${filter.label}-${index}`}
          label={filter.label}
          value={filter.value}
          onClear={filter.onClear}
        />
      ))}

      {onClearAll && filters.length > 1 && (
        <>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs hover:text-destructive"
          >
            Clear all
          </Button>
        </>
      )}
    </div>
  );
}
