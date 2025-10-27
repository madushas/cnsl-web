/**
 * CheckpointTabs Component
 *
 * Tab-based checkpoint selector for the scanner UI
 * Displays checkpoint type, icon, and current count
 */

"use client";

import {
  CheckpointType,
  CheckpointLabels,
  CheckpointIcons,
  CheckpointColors,
} from "@/lib/types/checkpoint";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CheckpointTabsProps {
  activeCheckpoint: CheckpointType;
  onCheckpointChange: (checkpoint: CheckpointType) => void;
  stats?: {
    entry: number;
    refreshment: number;
    swag: number;
  };
  className?: string;
}

export function CheckpointTabs({
  activeCheckpoint,
  onCheckpointChange,
  stats,
  className,
}: CheckpointTabsProps) {
  const checkpoints: CheckpointType[] = ["entry", "refreshment", "swag"];

  return (
    <Tabs
      value={activeCheckpoint}
      onValueChange={(value) => onCheckpointChange(value as CheckpointType)}
      className={cn("w-full", className)}
    >
      <TabsList className="grid w-full grid-cols-3 h-auto">
        {checkpoints.map((checkpoint) => {
          const colors = CheckpointColors[checkpoint];
          const isActive = activeCheckpoint === checkpoint;
          const count = stats?.[checkpoint] ?? 0;

          return (
            <TabsTrigger
              key={checkpoint}
              value={checkpoint}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:shadow-sm transition-all",
                isActive &&
                  cn(colors.bg, colors.text, colors.border, "border-2"),
              )}
            >
              <span
                className="text-2xl"
                role="img"
                aria-label={CheckpointLabels[checkpoint]}
              >
                {CheckpointIcons[checkpoint]}
              </span>
              <span className="text-xs font-medium leading-none">
                {CheckpointLabels[checkpoint].replace(" ", "\n").split("\n")[0]}
              </span>
              {stats && (
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums px-2 py-0.5 rounded-full",
                    isActive
                      ? cn(colors.bg, colors.text)
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
