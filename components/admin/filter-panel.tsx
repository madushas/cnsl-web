"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IconFilter } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  children: ReactNode;
  className?: string;
};

export function FilterPanel({ children, className }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <IconFilter className="size-4" />
          {isOpen ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {isOpen && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
