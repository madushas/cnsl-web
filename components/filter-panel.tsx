"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export type FilterOption = {
  type: "select" | "search";
  label: string;
  value: string;
  options?: string[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export type FilterStats = {
  label: string;
  value: number | string;
};

export type FilterPanelProps = {
  filters: FilterOption[];
  stats?: FilterStats[];
  onReset: () => void;
  appliedCount?: number;
};

function FilterContent({ filters, stats, onReset, appliedCount }: FilterPanelProps) {
  return (
    <div className="filter-sidebar space-y-6">
      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="bg-card border rounded-lg p-4 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Overview
          </h3>
          <div className="space-y-1.5">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{stat.label}</span>
                <span className="font-medium text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Filters
            {appliedCount && appliedCount > 0 ? (
              <Badge variant="secondary" className="ml-2 text-xs">
                {appliedCount}
              </Badge>
            ) : null}
          </h3>
          {appliedCount && appliedCount > 0 ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset}
              className="h-auto px-2 py-1 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Button>
          ) : null}
        </div>

        <div className="space-y-4">
          {filters.map((filter, idx) => (
            <div key={idx}>
              <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {filter.label}
              </label>
              
              {filter.type === "search" ? (
                <Input
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                  className="bg-background border-border text-sm"
                  aria-label={`Search ${filter.label}`}
                />
              ) : (
                <div className="space-y-1">
                  {filter.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => filter.onChange(option)}
                      className={`filter-item ${
                        filter.value === option
                          ? "filter-item-active"
                          : "filter-item-inactive"
                      }`}
                      aria-current={filter.value === option ? "true" : "false"}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FilterPanel(props: FilterPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: Always visible sidebar */}
      <aside className="hidden lg:block">
        <FilterContent {...props} />
      </aside>

      {/* Mobile: Sheet drawer */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto mb-4"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {props.appliedCount && props.appliedCount > 0 ? (
                <Badge variant="secondary" className="ml-2">
                  {props.appliedCount}
                </Badge>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
