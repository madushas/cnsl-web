"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Filter, Loader2, MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { withCSRF } from "@/lib/csrf"
import { CheckpointStatsOverview } from "@/components/admin/checkpoint-stats-overview"
import { CheckpointActivityFeed } from "@/components/admin/checkpoint-activity-feed"

type RSVP = {
  id: string
  name: string
  email: string
  status: string
  checkpoints?: {
    hasEntry: boolean
    hasRefreshment: boolean
    hasSwag: boolean
  }
}

type Props = {
  slug: string
}

export default function EventRSVPsCheckpoints({ slug }: Props) {
  const { toast } = useToast()
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRsvps, setSelectedRsvps] = useState<Set<string>>(new Set())
  const [checkpointFilter, setCheckpointFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [processingRsvp, setProcessingRsvp] = useState<string | null>(null)
  
  // Bulk job state
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkJob, setBulkJob] = useState<{ id: string; status: string; progress: number; total: number; successCount?: number; errorCount?: number; skippedCount?: number } | null>(null)
  const bulkEsRef = useRef<EventSource | null>(null)
  const bulkDoneRef = useRef<boolean>(false)

  useEffect(() => {
    const ab = new AbortController()
    fetchData(ab.signal)
    return () => ab.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, checkpointFilter, page])

  async function fetchData(signal?: AbortSignal) {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (checkpointFilter !== 'all') params.set('checkpoint', checkpointFilter)
      const res = await fetch(`/api/admin/events/${slug}/rsvps?${params.toString()}`, { cache: 'no-store', signal })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Failed to load')
      const payload = data?.data || data
      setRsvps(Array.isArray(payload.items) ? payload.items : [])
      setTotal(Number(payload.total || 0))
    } catch (error: any) {
      if (error.name === 'AbortError') return
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
      setProcessingRsvp(null)
    }
  }

  async function bulkCheckpoint(action: 'mark' | 'undo', checkpointType: 'entry' | 'refreshment' | 'swag') {
    if (!selectedRsvps.size) {
      toast({ title: 'No selection', description: 'Select RSVPs first.', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch(`/api/admin/events/${slug}/checkpoints/bulk`, {
        method: 'POST',
        headers: withCSRF({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ rsvpIds: Array.from(selectedRsvps), action, checkpointType, scanMethod: 'manual' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Failed to start bulk job')
      const jobId = (data?.data?.jobId || data?.jobId) as string
      if (!jobId) throw new Error('Missing jobId')
      setBulkJob({ id: jobId, status: 'queued', progress: 0, total: selectedRsvps.size })
      setBulkOpen(true)
      bulkDoneRef.current = false
      startBulkStream(jobId)
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to start bulk job', variant: 'destructive' })
    }
  }

  function startBulkStream(jobId: string) {
    try { bulkEsRef.current?.close() } catch {}
    const es = new EventSource(`/api/admin/jobs/${jobId}/stream`)
    bulkEsRef.current = es
    bulkDoneRef.current = false
    const onStatus = (evt: MessageEvent) => {
      try {
        const payload = JSON.parse(evt.data || '{}') as any
        const job = payload.job || payload
        setBulkJob(j => ({ id: jobId, status: String(job.status || j?.status || 'running'), progress: Number(job.progress || 0), total: Number(job.total || j?.total || 0), successCount: job.meta?.successCount, errorCount: job.meta?.errorCount, skippedCount: job.meta?.skippedCount }))
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
          try { es.close() } catch {}
          bulkEsRef.current = null
          void fetchData()
          if (!bulkDoneRef.current) {
            const sc = Number(job.meta?.successCount || 0)
            const ec = Number(job.meta?.errorCount || 0)
            const kc = Number(job.meta?.skippedCount || 0)
            const status: string = String(job.status)
            const description = `${status === 'completed' ? 'Completed' : status === 'cancelled' ? 'Cancelled' : 'Failed'} · Success ${sc} · Errors ${ec} · Skipped ${kc}`
            toast({ title: `Bulk job ${status}`, description, variant: status === 'failed' ? 'destructive' : undefined })
            setBulkOpen(false)
            bulkDoneRef.current = true
          }
        }
      } catch {}
    }
    es.addEventListener('status', onStatus)
    es.onmessage = onStatus
    es.onerror = () => {
      try { es.close() } catch {}
      bulkEsRef.current = null
    }
  }

  async function markCheckpoint(rsvpId: string, checkpointType: string) {
    setProcessingRsvp(rsvpId)
    try {
      const res = await fetch(`/api/admin/events/${slug}/checkpoints`, {
        method: 'POST',
        headers: withCSRF({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ identifier: { id: rsvpId }, checkpointType, scanMethod: 'manual' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Failed to mark checkpoint')
      toast({ title: 'Checkpoint Marked', description: `Successfully marked ${checkpointType}` })
      await fetchData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to mark checkpoint', variant: 'destructive' })
    } finally {
      setProcessingRsvp(null)
    }
  }

  async function undoCheckpoint(rsvpId: string, checkpointType: string) {
    setProcessingRsvp(rsvpId)
    try {
      const res = await fetch(`/api/admin/events/${slug}/rsvps/${rsvpId}/checkpoints/${checkpointType}`, {
        method: 'DELETE',
        headers: withCSRF(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Failed to undo checkpoint')
      toast({ title: 'Checkpoint Undone', description: `Successfully undone ${checkpointType}` })
      await fetchData()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to undo checkpoint', variant: 'destructive' })
    } finally {
      setProcessingRsvp(null)
    }
  }

  function toggleRsvpSelection(id: string) {
    const newSelection = new Set(selectedRsvps)
    if (newSelection.has(id)) newSelection.delete(id)
    else newSelection.add(id)
    setSelectedRsvps(newSelection)
  }

  function selectAll() {
    if (selectedRsvps.size === rsvps.length) setSelectedRsvps(new Set())
    else setSelectedRsvps(new Set(rsvps.map(r => r.id)))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Stats and Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <CheckpointStatsOverview slug={slug} />
        <CheckpointActivityFeed slug={slug} />
      </div>

      {/* Checkpoint Management */}
      <Card>
        <CardHeader>
          <CardTitle>Checkpoint Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            <Select value={checkpointFilter} onValueChange={(v)=>{ setSelectedRsvps(new Set()); setCheckpointFilter(v) }}>
              <SelectTrigger className="w-[250px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by checkpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attendees</SelectItem>
                <SelectItem value="entry">Entry Done</SelectItem>
                <SelectItem value="refreshment">Refreshment Done</SelectItem>
                <SelectItem value="swag">Swag Done</SelectItem>
                <SelectItem value="missing-entry">Missing Entry</SelectItem>
                <SelectItem value="missing-refreshment">Missing Refreshment</SelectItem>
                <SelectItem value="missing-swag">Missing Swag</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedRsvps.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <span className="text-sm font-medium">{selectedRsvps.size} selected</span>
              <div className="flex-1" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">Bulk Checkpoint</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => bulkCheckpoint('mark', 'entry')}>Mark Entry</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkCheckpoint('mark', 'refreshment')}>Mark Refreshment</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkCheckpoint('mark', 'swag')}>Mark Swag</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => bulkCheckpoint('undo', 'entry')}>Undo Entry</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkCheckpoint('undo', 'refreshment')}>Undo Refreshment</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkCheckpoint('undo', 'swag')}>Undo Swag</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox checked={rsvps.length > 0 && selectedRsvps.size === rsvps.length} onCheckedChange={selectAll} />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">📥 Entry</TableHead>
                  <TableHead className="text-center">🍕 Food</TableHead>
                  <TableHead className="text-center">🎁 Swag</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rsvps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No attendees found</TableCell>
                  </TableRow>
                ) : (
                  rsvps.map((rsvp) => (
                    <TableRow key={rsvp.id}>
                      <TableCell>
                        <Checkbox checked={selectedRsvps.has(rsvp.id)} onCheckedChange={() => toggleRsvpSelection(rsvp.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{rsvp.name}</TableCell>
                      <TableCell>{rsvp.email}</TableCell>
                      <TableCell>
                        <Badge variant={rsvp.status === 'approved' ? 'default' : 'outline'}>{rsvp.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {rsvp.checkpoints?.hasEntry ? <CheckCircle className="h-4 w-4 text-green-600 inline" /> : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {rsvp.checkpoints?.hasRefreshment ? <CheckCircle className="h-4 w-4 text-orange-600 inline" /> : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {rsvp.checkpoints?.hasSwag ? <CheckCircle className="h-4 w-4 text-green-600 inline" /> : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={processingRsvp === rsvp.id}>
                              {processingRsvp === rsvp.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => markCheckpoint(rsvp.id, 'entry')} disabled={rsvp.checkpoints?.hasEntry}>Mark Entry</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => markCheckpoint(rsvp.id, 'refreshment')} disabled={rsvp.checkpoints?.hasRefreshment}>Mark Refreshment</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => markCheckpoint(rsvp.id, 'swag')} disabled={rsvp.checkpoints?.hasSwag}>Mark Swag</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => undoCheckpoint(rsvp.id, 'entry')} disabled={!rsvp.checkpoints?.hasEntry}>Undo Entry</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => undoCheckpoint(rsvp.id, 'refreshment')} disabled={!rsvp.checkpoints?.hasRefreshment}>Undo Refreshment</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => undoCheckpoint(rsvp.id, 'swag')} disabled={!rsvp.checkpoints?.hasSwag}>Undo Swag</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total / pageSize))} · {total} total</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={()=>setPage(1)} disabled={page<=1}>First</Button>
              <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Prev</Button>
              <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.min(Math.max(1, Math.ceil(total / pageSize)),p+1))} disabled={page>=Math.max(1, Math.ceil(total / pageSize))}>Next</Button>
              <Button variant="outline" size="sm" onClick={()=>setPage(Math.max(1, Math.ceil(total / pageSize)))} disabled={page>=Math.max(1, Math.ceil(total / pageSize))}>Last</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Job Progress Dialog */}
      <Dialog open={bulkOpen} onOpenChange={(v)=>{ setBulkOpen(v); if (!v) { try { bulkEsRef.current?.close() } catch {}; bulkEsRef.current = null } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Checkpoint Operation</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>Status: <span className="font-mono">{bulkJob?.status || '...'}</span></div>
            <div>Progress: {bulkJob?.progress || 0} / {bulkJob?.total || 0}</div>
            <Progress value={Math.round(((bulkJob?.progress || 0) * 100) / Math.max(1, bulkJob?.total || 1))} />
            {(bulkJob?.successCount != null || bulkJob?.errorCount != null) && (
              <div>
                Success: {bulkJob?.successCount ?? 0} · Errors: {bulkJob?.errorCount ?? 0}
                {bulkJob?.skippedCount != null ? ` · Skipped: ${bulkJob?.skippedCount}` : ''}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={async ()=>{
                try {
                  if (!bulkJob) return
                  const res = await fetch(`/api/admin/jobs/${bulkJob.id}/cancel`, { method: 'POST', headers: withCSRF() })
                  const data = await res.json().catch(()=>({}))
                  if (!res.ok) throw new Error(data?.error || 'Failed to cancel job')
                } catch (e: any) {
                  toast({ title: 'Cancel failed', description: e.message || 'Unable to cancel job', variant: 'destructive' })
                }
              }}
              disabled={!bulkJob || ['completed','failed','cancelled'].includes(bulkJob.status)}
            >
              Cancel Job
            </Button>
            <Button variant="outline" onClick={()=>{ setBulkOpen(false) }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
