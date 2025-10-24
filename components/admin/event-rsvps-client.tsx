"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, Search, Loader2, CheckCircle, Linkedin, Twitter, Github, Globe, MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { withCSRF } from "@/lib/csrf"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { CheckpointStatsOverview } from "@/components/admin/checkpoint-stats-overview"
// import { CheckpointIcons } from "@/lib/types/checkpoint" // not needed here
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckpointActivityFeed } from "@/components/admin/checkpoint-activity-feed"

type RSVP = {
  id: string
  accountId?: string
  name: string
  email: string
  status: string
  createdAt: string
  notifiedAt?: string
  ticketNumber?: string
  checkedInAt?: string
  affiliation?: string
  qrCode?: string
  checkpoints?: {
    hasEntry: boolean
    hasRefreshment: boolean
    hasSwag: boolean
    entryScannedAt?: string | null
    refreshmentScannedAt?: string | null
    swagScannedAt?: string | null
  }
  profile?: {
    linkedin?: string | null
    twitter?: string | null
    github?: string | null
    website?: string | null
    company?: string | null
    title?: string | null
  } | null
}

type Props = {
  slug: string
  capacity: number
  title: string
}

export default function EventRSVPsClient({ slug, capacity, title }: Props) {
  const { toast } = useToast()
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRsvps, setSelectedRsvps] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [checkpointFilter, setCheckpointFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RSVP | null>(null)
  const [profileForm, setProfileForm] = useState({
    linkedin: '', twitter: '', github: '', website: '', company: '', title: ''
  })
  const [processingRsvp, setProcessingRsvp] = useState<string | null>(null)
  // M3: Import dialog state
  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ ok: boolean; updated?: number; total?: number } | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  // Bulk checkpoint job state
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkJob, setBulkJob] = useState<{ id: string; status: string; progress: number; total: number; successCount?: number; errorCount?: number; skippedCount?: number } | null>(null)
  const bulkEsRef = useRef<EventSource | null>(null)
  const bulkDoneRef = useRef<boolean>(false)

  useEffect(() => {
    const ab = new AbortController()
    fetchData(ab.signal)
    return () => ab.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, searchQuery, statusFilter, checkpointFilter, page, pageSize])

  async function fetchData(signal?: AbortSignal) {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (searchQuery.trim()) params.set('q', searchQuery.trim())
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (checkpointFilter !== 'all') params.set('checkpoint', checkpointFilter)
      const res = await fetch(`/api/admin/events/${slug}/rsvps?${params.toString()}`, { cache: 'no-store', signal })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Failed to load RSVPs')
      const payload = data?.data || data
      setRsvps(Array.isArray(payload.items) ? payload.items : [])
      setTotal(Number(payload.total || 0))
      setApprovedCount(Number(payload.approvedCount || 0))
      setPendingCount(Number(payload.pendingCount || 0))
    } catch (error: any) {
      if (error.name === 'AbortError') return
      toast({ title: 'Error', description: error.message || 'Failed to load RSVPs', variant: 'destructive' })
    } finally {
      setLoading(false)
      setProcessingRsvp(null)
    }
  }

  // M3: build export URLs
  const exportAllUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (checkpointFilter !== 'all') params.set('checkpoint', checkpointFilter)
    return `/api/admin/events/${slug}/rsvps/export?${params.toString()}`
  }, [slug, searchQuery, statusFilter, checkpointFilter])

  const exportSelectedUrl = useMemo(() => {
    if (!selectedRsvps.size) return null
    const params = new URLSearchParams()
    params.set('ids', Array.from(selectedRsvps).join(','))
    return `/api/admin/events/${slug}/rsvps/export?${params.toString()}`
  }, [slug, selectedRsvps])

  function openEdit(r: RSVP) {
    if (!r.accountId) {
      toast({ title: 'Unavailable', description: 'No linked account for this RSVP.', variant: 'destructive' })
      return
    }
    setEditTarget(r)
    setProfileForm({
      linkedin: r.profile?.linkedin || '',
      twitter: r.profile?.twitter || '',
      github: r.profile?.github || '',
      website: r.profile?.website || '',
      company: r.profile?.company || '',
      title: r.profile?.title || '',
    })
    setEditOpen(true)
  }

  async function saveProfile() {
    if (!editTarget?.accountId) return
    try {
      const res = await fetch(`/api/admin/users/${editTarget.accountId}/profile`, {
        method: 'PATCH',
        headers: withCSRF({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save profile')
      toast({ title: 'Saved', description: 'Profile updated.' })
      setEditOpen(false)
      setEditTarget(null)
      await fetchData()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to save profile', variant: 'destructive' })
    }
  }

  // Bulk checkpoint operations
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
          // refresh data
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

  // server-side filtered; no client filter needed

  // Mark a checkpoint for an RSVP
  async function markCheckpoint(rsvpId: string, checkpointType: string) {
    setProcessingRsvp(rsvpId)
    try {
      const res = await fetch(`/api/admin/events/${slug}/checkpoints`, {
        method: 'POST',
        headers: withCSRF({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          identifier: { id: rsvpId },
          checkpointType,
          scanMethod: 'manual',
        }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Failed to mark checkpoint')
      
      toast({
        title: 'Checkpoint Marked',
        description: `Successfully marked ${checkpointType} checkpoint for ${data?.data?.attendee?.name || data?.attendee?.name || 'attendee'}`,
      })
      
      // Refresh the data to update the UI
      await fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark checkpoint',
        variant: 'destructive',
      })
    } finally {
      setProcessingRsvp(null)
    }
  }

  // Undo a checkpoint for an RSVP
  async function undoCheckpoint(rsvpId: string, checkpointType: string) {
    setProcessingRsvp(rsvpId)
    try {
      const res = await fetch(`/api/admin/events/${slug}/rsvps/${rsvpId}/checkpoints/${checkpointType}`, {
        method: 'DELETE',
        headers: withCSRF(),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Failed to undo checkpoint')
      
      toast({
        title: 'Checkpoint Undone',
        description: `Successfully undone ${checkpointType} checkpoint`,
      })
      
      // Refresh the data to update the UI
      await fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to undo checkpoint',
        variant: 'destructive',
      })
    } finally {
      setProcessingRsvp(null)
    }
  }

  function toggleRsvpSelection(id: string) {
    const newSelection = new Set(selectedRsvps)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRsvps(newSelection)
  }

  function selectAll() {
    if (selectedRsvps.size === rsvps.length) setSelectedRsvps(new Set())
    else setSelectedRsvps(new Set(rsvps.map(r => r.id)))
  }

  // Offline ticket pipeline preferred; removing legacy invite action

  async function bulkUpdateStatus(status: string) {
    if (selectedRsvps.size === 0) {
      toast({
        title: "No RSVPs selected",
        description: "Please select at least one RSVP to update",
        variant: "destructive",
      })
      return
    }
    try {
      const response = await fetch(`/api/admin/events/${slug}/select`, {
        method: "POST",
        headers: withCSRF({ "Content-Type": "application/json" }),
        body: JSON.stringify({ rsvpIds: Array.from(selectedRsvps), status }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error?.message || result?.error || "Failed to update status")
      }
      const payload = result?.data || result
      toast({
        title: "Status Updated",
        description: `Updated ${payload.updated || 0} RSVPs${payload.skipped?.length ? `, skipped ${payload.skipped.length} (capacity)` : ''}`,
      })
      await fetchData()
      setSelectedRsvps(new Set())
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }
  const stats = {
    total,
    pending: pendingCount,
    approved: approvedCount,
    invited: rsvps.filter((r) => r.status === 'invited').length,
    waitlist: rsvps.filter((r) => r.status === 'waitlist').length,
    checkedIn: rsvps.filter((r) => r.checkedInAt).length,
  }
  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div>
        <h1 className="text-h2">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">Capacity {capacity || 0} · Approved {approvedCount}</p>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invited}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waitlist}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
          </CardContent>
        </Card>
      </div>

      {/* Checkpoint Status Overview + Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <CheckpointStatsOverview slug={slug} />
        <CheckpointActivityFeed slug={slug} />
      </div>
      {/* RSVP Management */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            Manage event registrations, send invites, and track attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Capacity Banner */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <p className="text-sm font-medium">
              Capacity: {capacity || 0} · Approved: {approvedCount}
            </p>
          </div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => { setSelectedRsvps(new Set()); setSearchQuery(e.target.value) }}
                  className="pl-9"
                  aria-label="Search RSVPs by name or email"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v)=>{ setSelectedRsvps(new Set()); setStatusFilter(v) }}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="waitlist">Waitlist</SelectItem>
                </SelectContent>
              </Select>
              {/* Checkpoint Filter */}
              <Select value={checkpointFilter} onValueChange={(v)=>{ setSelectedRsvps(new Set()); setCheckpointFilter(v) }}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Checkpoint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Checkpoints</SelectItem>
                  <SelectItem value="entry">Entry done</SelectItem>
                  <SelectItem value="refreshment">Refreshment done</SelectItem>
                  <SelectItem value="swag">Swag done</SelectItem>
                  <SelectItem value="missing-entry">Missing Entry</SelectItem>
                  <SelectItem value="missing-refreshment">Missing Refreshment</SelectItem>
                  <SelectItem value="missing-swag">Missing Swag</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* M3: Export/Import Actions */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="flex gap-2">
              <a className="inline-flex items-center px-3 py-2 border rounded-md text-sm" href={exportAllUrl} target="_blank" rel="noreferrer">
                Export Current Filter
              </a>
              {selectedRsvps.size > 0 && exportSelectedUrl && (
                <a className="inline-flex items-center px-3 py-2 border rounded-md text-sm" href={exportSelectedUrl} target="_blank" rel="noreferrer">
                  Export Selected ({selectedRsvps.size})
                </a>
              )}
            </div>
            <div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setImportResult(null); setImportOpen(true) }}>Import Tickets CSV</Button>
                <Button asChild>
                  <Link href={`/admin/events/${slug}/email`}>Email Builder</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/admin/events/${slug}/scan`}>Scanner</Link>
                </Button>
              </div>
            </div>
          </div>
          {/* Bulk Actions */}
          {selectedRsvps.size > 0 && (
            <div className="flex items-center gap-2 card-padding-sm bg-blue-50 dark:bg-blue-950 rounded-lg">
              <span className="text-sm font-medium">{selectedRsvps.size} selected</span>
              <div className="flex-1" />
              <Button onClick={() => bulkUpdateStatus('approved')} variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button onClick={() => bulkUpdateStatus('invited')} variant="outline" size="sm">
                Mark Invited
              </Button>
              <Button onClick={() => bulkUpdateStatus('declined')} variant="outline" size="sm">
                Decline
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">Checkpoint</Button>
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
          {/* RSVP Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={rsvps.length > 0 && selectedRsvps.size === rsvps.length}
                      onCheckedChange={selectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead className="text-center">📥 Entry</TableHead>
                  <TableHead className="text-center">🍕 Food</TableHead>
                  <TableHead className="text-center">🎁 Swag</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                  <TableHead className="w-0">Profiles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rsvps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      No registrations found
                    </TableCell>
                  </TableRow>
                ) : (
                  rsvps.map((rsvp) => (
                    <TableRow key={rsvp.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRsvps.has(rsvp.id)}
                          onCheckedChange={() => toggleRsvpSelection(rsvp.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{rsvp.name}</TableCell>
                      <TableCell>{rsvp.email}</TableCell>
                      <TableCell>
                        <Badge variant={rsvp.status === 'approved' ? 'default' : rsvp.status === 'invited' ? 'secondary' : 'outline'}>
                          {rsvp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{rsvp.ticketNumber || '-'}</TableCell>
                      <TableCell>{new Date(rsvp.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{rsvp.notifiedAt ? new Date(rsvp.notifiedAt).toLocaleDateString() : '-'}</TableCell>
                      
                      {/* Checkpoint Status Columns */}
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {rsvp.checkpoints?.hasEntry ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 inline" />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </span>
                            </TooltipTrigger>
                            {rsvp.checkpoints?.entryScannedAt && (
                              <TooltipContent>
                                {new Date(rsvp.checkpoints.entryScannedAt).toLocaleString()}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {rsvp.checkpoints?.hasRefreshment ? (
                                  <CheckCircle className="h-4 w-4 text-orange-600 inline" />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </span>
                            </TooltipTrigger>
                            {rsvp.checkpoints?.refreshmentScannedAt && (
                              <TooltipContent>
                                {new Date(rsvp.checkpoints.refreshmentScannedAt).toLocaleString()}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {rsvp.checkpoints?.hasSwag ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 inline" />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </span>
                            </TooltipTrigger>
                            {rsvp.checkpoints?.swagScannedAt && (
                              <TooltipContent>
                                {new Date(rsvp.checkpoints.swagScannedAt).toLocaleString()}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={async () => {
                                await markCheckpoint(rsvp.id, 'entry')
                              }}
                              disabled={rsvp.checkpoints?.hasEntry}
                            >
                              Mark Entry
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                await markCheckpoint(rsvp.id, 'refreshment')
                              }}
                              disabled={rsvp.checkpoints?.hasRefreshment}
                            >
                              Mark Refreshment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                await markCheckpoint(rsvp.id, 'swag')
                              }}
                              disabled={rsvp.checkpoints?.hasSwag}
                            >
                              Mark Swag
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={async () => {
                                await undoCheckpoint(rsvp.id, 'entry')
                              }}
                              disabled={!rsvp.checkpoints?.hasEntry}
                            >
                              Undo Entry
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                await undoCheckpoint(rsvp.id, 'refreshment')
                              }}
                              disabled={!rsvp.checkpoints?.hasRefreshment}
                            >
                              Undo Refreshment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                await undoCheckpoint(rsvp.id, 'swag')
                              }}
                              disabled={!rsvp.checkpoints?.hasSwag}
                            >
                              Undo Swag
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
  <div className="flex items-center gap-2">
    {rsvp.profile?.linkedin ? (<a href={rsvp.profile.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"><Linkedin className="h-4 w-4" /></a>) : null}
    {rsvp.profile?.twitter ? (<a href={rsvp.profile.twitter} target="_blank" rel="noreferrer" title="Twitter"><Twitter className="h-4 w-4" /></a>) : null}
    {rsvp.profile?.github ? (<a href={rsvp.profile.github} target="_blank" rel="noreferrer" title="GitHub"><Github className="h-4 w-4" /></a>) : null}
    {rsvp.profile?.website ? (<a href={rsvp.profile.website} target="_blank" rel="noreferrer" title="Website"><Globe className="h-4 w-4" /></a>) : null}
  </div>
</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Edit Profile Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile Links</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label className="text-xs">LinkedIn</Label>
                  <Input value={profileForm.linkedin} onChange={e=>setProfileForm(p=>({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Twitter</Label>
                    <Input value={profileForm.twitter} onChange={e=>setProfileForm(p=>({ ...p, twitter: e.target.value }))} placeholder="https://x.com/..." />
                  </div>
                  <div>
                    <Label className="text-xs">GitHub</Label>
                    <Input value={profileForm.github} onChange={e=>setProfileForm(p=>({ ...p, github: e.target.value }))} placeholder="https://github.com/..." />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Website</Label>
                  <Input value={profileForm.website} onChange={e=>setProfileForm(p=>({ ...p, website: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Company</Label>
                    <Input value={profileForm.company} onChange={e=>setProfileForm(p=>({ ...p, company: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input value={profileForm.title} onChange={e=>setProfileForm(p=>({ ...p, title: e.target.value }))} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setEditOpen(false)}>Cancel</Button>
                <Button onClick={saveProfile}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                    Success: {bulkJob?.successCount ?? 0} · Errors: {bulkJob?.errorCount ?? 0}{' '}
                    {bulkJob?.skippedCount != null ? `· Skipped: ${bulkJob?.skippedCount}` : ''}
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
          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total / pageSize))} · {total} total</div>
            <div className="flex items-center gap-2">
              <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(Number(v)); setPage(1) }}>
                <SelectTrigger className="w-28"><SelectValue placeholder={String(pageSize)} /></SelectTrigger>
                <SelectContent>
                  {[10,20,50,100].map(n=> <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={()=>setPage(1)} disabled={page<=1}>First</Button>
                <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={()=>{ const pc=Math.max(1, Math.ceil(total / pageSize)); setPage(p=>Math.min(pc,p+1)) }} disabled={page>=Math.max(1, Math.ceil(total / pageSize))}>Next</Button>
                <Button variant="outline" size="sm" onClick={()=>{ const pc=Math.max(1, Math.ceil(total / pageSize)); setPage(pc) }} disabled={page>=Math.max(1, Math.ceil(total / pageSize))}>Last</Button>
              </div>
            </div>
          </div>
          {/* M3: Import Tickets Dialog */}
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Ticket Image Mappings (CSV)</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>Upload a CSV containing columns like <code>id</code>, <code>ticketNumber</code>, <code>qrCode</code>, or <code>email</code>. Only provided fields will be updated.</p>
                <input ref={fileRef} type="file" accept=".csv,text/csv" />
                {importResult && (
                  <div className="text-muted-foreground">Updated {importResult.updated ?? 0} of {importResult.total ?? 0}</div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>Close</Button>
                <Button type="button" disabled={importing} onClick={async ()=>{
                  try {
                    setImporting(true)
                    const file = fileRef.current?.files?.[0]
                    if (!file) {
                      toast({ title: 'Select file', description: 'Please choose a CSV file.' })
                      return
                    }
                    const text = await file.text()
                    const res = await fetch(`/api/admin/events/${slug}/rsvps/import-ticket-images`, {
                      method: 'POST',
                      headers: withCSRF({ 'Content-Type': 'text/csv' }),
                      body: text,
                    })
                    const json = await res.json()
                    if (!res.ok) {
                      throw new Error(json?.error?.message || json?.error || 'Import failed')
                    }
                    const payload = json?.data ?? json
                    const updated = Number(payload?.updated ?? 0)
                    const total = Number(payload?.total ?? 0)
                    setImportResult({ ok: true, updated, total })
                    toast({ title: 'Import complete', description: `Updated ${updated}/${total}` })
                    await fetchData()
                  } catch (e: any) {
                    toast({ title: 'Error', description: e.message || 'Failed to import', variant: 'destructive' })
                  } finally {
                    setImporting(false)
                  }
                }}>{importing ? 'Importing...' : 'Import'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
