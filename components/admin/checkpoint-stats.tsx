/**
 * CheckpointStats Component
 *
 * Displays real-time checkpoint statistics with progress bars
 * Auto-refreshes every 5 seconds
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckpointType,
  CheckpointLabels,
  CheckpointIcons,
  CheckpointColors,
} from "@/lib/types/checkpoint";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckpointStatsProps {
  slug: string;
  activeCheckpoint?: CheckpointType;
  onRefresh?: (stats: StatsData) => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface StatsData {
  total: number;
  entry: number;
  refreshment: number;
  swag: number;
  entryPercentage: number;
  refreshmentPercentage: number;
  swagPercentage: number;
}

export function CheckpointStats({
  slug,
  activeCheckpoint,
  onRefresh,
  autoRefresh = true,
  refreshInterval = 5000,
}: CheckpointStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const res = await fetch(
        `/api/admin/events/${encodeURIComponent(slug)}/checkpoints/stats`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await res.json();
      const newStats = data.data?.stats;

      if (newStats) {
        const formatted: StatsData = {
          total: newStats.total,
          entry: newStats.entry.count,
          refreshment: newStats.refreshment.count,
          swag: newStats.swag.count,
          entryPercentage: newStats.entry.percentage,
          refreshmentPercentage: newStats.refreshment.percentage,
          swagPercentage: newStats.swag.percentage,
        };

        setStats(formatted);
        setLastUpdated(new Date());
        onRefresh?.(formatted);
      }
    } catch (err: any) {
      console.error("[CheckpointStats] Error fetching stats:", err);
      setError(err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [slug, autoRefresh, refreshInterval]);

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading statistics...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-destructive">
            Error loading stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchStats}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const checkpoints: {
    type: CheckpointType;
    count: number;
    percentage: number;
  }[] = [
    { type: "entry", count: stats.entry, percentage: stats.entryPercentage },
    {
      type: "refreshment",
      count: stats.refreshment,
      percentage: stats.refreshmentPercentage,
    },
    { type: "swag", count: stats.swag, percentage: stats.swagPercentage },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Live Statistics</CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={fetchStats}
              disabled={loading}
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center py-2 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">
            Total Approved RSVPs
          </div>
        </div>

        <div className="space-y-3">
          {checkpoints.map((checkpoint) => {
            const colors = CheckpointColors[checkpoint.type];
            const isActive = activeCheckpoint === checkpoint.type;

            return (
              <div
                key={checkpoint.type}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isActive &&
                    cn(
                      colors.bg,
                      "ring-2",
                      colors.border.replace("border-", "ring-"),
                    ),
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" role="img">
                      {CheckpointIcons[checkpoint.type]}
                    </span>
                    <span className="text-xs font-medium">
                      {CheckpointLabels[checkpoint.type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        colors.text,
                      )}
                    >
                      {checkpoint.count}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({checkpoint.percentage}%)
                    </span>
                  </div>
                </div>
                <Progress
                  value={checkpoint.percentage}
                  className={cn("h-2", colors.bg)}
                  indicatorClassName={colors.text.replace("text-", "bg-")}
                />
              </div>
            );
          })}
        </div>

        {autoRefresh && (
          <div className="text-xs text-center text-muted-foreground pt-2">
            Auto-refreshing every {refreshInterval / 1000}s
          </div>
        )}
      </CardContent>
    </Card>
  );
}
