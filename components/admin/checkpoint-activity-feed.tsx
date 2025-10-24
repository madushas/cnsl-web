"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CheckpointIcons, CheckpointColors, type CheckpointType } from "@/lib/types/checkpoint"

type HistoryItem = {
  id: string
  checkpointType: CheckpointType
  scannedAt: string
  scannedBy: string | null
  scanMethod: string | null
  notes: string | null
  attendeeName: string
  attendeeEmail: string
}

type Props = {
  slug: string
  className?: string
}

export function CheckpointActivityFeed({ slug, className }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | CheckpointType>("all")

  const fetchHistory = async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("limit", "30")
      if (filter !== "all") params.set("type", filter)
      const res = await fetch(`/api/admin/events/${encodeURIComponent(slug)}/checkpoints/history?${params.toString()}`, { cache: "no-store", signal })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to fetch history")
      const history = Array.isArray(data.data?.history) ? data.data.history : []
      setItems(history.map((h: any) => ({
        id: h.id,
        checkpointType: h.checkpointType,
        scannedAt: h.scannedAt,
        scannedBy: h.scannedBy ?? null,
        scanMethod: h.scanMethod ?? null,
        notes: h.notes ?? null,
        attendeeName: h.attendeeName,
        attendeeEmail: h.attendeeEmail,
      })))
    } catch (e) {
      // silent fail in UI; can log in console
      console.error("[CheckpointActivityFeed]", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ab = new AbortController()
    void fetchHistory(ab.signal)
    const int = setInterval(() => void fetchHistory(), 30000)
    return () => {
      ab.abort()
      clearInterval(int)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, filter])

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">Recent Checkpoint Activity</CardTitle>
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="entry">Entry</SelectItem>
              <SelectItem value="refreshment">Refreshment</SelectItem>
              <SelectItem value="swag">Swag</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading && items.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6">Loading activity...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6">No recent scans</div>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="divide-y">
              {items.map((it) => {
                const colors = CheckpointColors[it.checkpointType]
                return (
                  <li key={it.id} className="py-3 flex items-start gap-3">
                    <div className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-md ${colors.bg}`}>
                      <span className="text-base" role="img" aria-label={it.checkpointType}>{CheckpointIcons[it.checkpointType]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-medium truncate">{it.attendeeName}</div>
                        <div className="text-xs text-muted-foreground truncate">{it.attendeeEmail}</div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className={colors.text}>{it.checkpointType}</span>
                        {it.scanMethod ? <Badge variant="outline" className="h-5 px-1.5">{it.scanMethod}</Badge> : null}
                        {it.scannedBy ? <span>by <span className="font-mono">{it.scannedBy}</span></span> : null}
                        <span>at {new Date(it.scannedAt).toLocaleString()}</span>
                        {it.notes ? <span className="italic">({it.notes})</span> : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
