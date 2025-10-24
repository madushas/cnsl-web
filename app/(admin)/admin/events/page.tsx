"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { IconSearch, IconPlus, IconDotsVertical, IconPencil, IconTrash, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconRefresh, IconUsers } from '@tabler/icons-react'
import { withCSRF } from '@/lib/csrf'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

type EventRow = {
  id: string
  slug: string
  title: string
  date: string
  city?: string | null
  venue?: string | null
  capacity?: number | null
  published?: boolean | null
  image?: string | null
  registered?: number
}

type ListResp = { items: EventRow[]; total: number; page: number; pageSize: number }

export default function AdminEventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // query state
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'published'|'draft'|''>('')
  const [timeframe, setTimeframe] = useState<'upcoming'|'past'|''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // data
  const [rows, setRows] = useState<EventRow[]>([])
  const [total, setTotal] = useState(0)

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // Initialize state from URL
  useEffect(() => {
    const sp = searchParams
    if (!sp) return
    setQ(sp.get('q') || '')
    const st = sp.get('status') || ''
    setStatus(st === 'published' || st === 'draft' ? (st as 'published'|'draft') : '')
    const tf = sp.get('timeframe') || ''
    setTimeframe(tf === 'upcoming' || tf === 'past' ? (tf as 'upcoming'|'past') : '')
    const pg = Number(sp.get('page') || '1')
    setPage(Number.isFinite(pg) && pg > 0 ? pg : 1)
    const psz = Number(sp.get('pageSize') || '10')
    setPageSize([10,20,50,100].includes(psz) ? psz : 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load(signal?: AbortSignal) {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (q.trim()) params.set('q', q.trim())
      if (status) params.set('status', status)
      if (timeframe) params.set('timeframe', timeframe)
      const res = await fetch(`/api/admin/events?${params.toString()}`, { cache: 'no-store', signal })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Failed to load events')
      const payload: ListResp | undefined = data?.data ?? data
      setRows(payload?.items || [])
      setTotal(payload?.total || 0)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // ignore abort
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load events')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ab = new AbortController()
    load(ab.signal)
    return () => ab.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ab = new AbortController()
    load(ab.signal)
    return () => ab.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, timeframe, page, pageSize])

  async function del(slug: string) {
    const prev = rows
    setRows(r => r.filter(x => x.slug !== slug))
    const res = await fetch(`/api/events/${slug}`, { method: 'DELETE', headers: withCSRF() })
    if (res.ok) {
      toast.success('Event deleted')
      load()
    } else {
      const data = await res.json().catch(()=>({}))
      setRows(prev) // revert
      toast.error(data?.error || 'Failed to delete event')
    }
  }

  async function togglePublished(row: EventRow) {
    setRows(rs => rs.map(r => r.slug === row.slug ? { ...r, published: !row.published } : r))
    const res = await fetch(`/api/events/${row.slug}`, { method: 'PATCH', headers: withCSRF({ 'Content-Type': 'application/json' }), body: JSON.stringify({ published: !row.published }) })
    if (res.ok) {
      toast.success(`Event ${!row.published ? 'published' : 'unpublished'}`)
    } else {
      const data = await res.json().catch(()=>({}))
      toast.error(data?.error || 'Failed to update')
    }
  }

  function openEdit(slug: string) {
    router.push(`/admin/events/${slug}/edit`)
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Admin · Events</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={()=>load()}><IconRefresh />Refresh</Button>
          <Button size="sm" asChild><Link href="/admin/events/new"><IconPlus />New Event</Link></Button>
        </div>
      </div>

      <div className="space-y-2 md:hidden">
        {rows.map((ev) => (
          <div key={ev.id} className="rounded-md border p-3">
            <div className="font-medium truncate">{ev.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {new Date(ev.date).toLocaleString()} {ev.city ? `· ${ev.city}` : ''} {ev.venue ? `· ${ev.venue}` : ''}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Switch checked={!!ev.published} onCheckedChange={()=>togglePublished(ev)} />
                <span className="text-xs">{ev.published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/events/${ev.slug}`} className="text-xs underline">RSVPs</Link>
                <Link href={`/admin/events/${ev.slug}/edit`} className="text-xs underline">Edit</Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs text-red-400 underline">Delete</button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event "{ev.title}" and remove its data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={()=>del(ev.slug)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">No events</div>
        )}
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}
      {loading && (
        <>
          <div className="hidden md:block rounded-lg border overflow-hidden">
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-9 gap-4 p-3">
                  <Skeleton className="h-5 w-40 col-span-2" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-8 w-8 justify-self-end rounded-md" />
                </div>
              ))}
            </div>
          </div>
          <div className="md:hidden space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-md border p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="search" className="sr-only">Search</Label>
            <div className="relative">
              <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input id="search" placeholder="Search title, slug, city, venue" className="pl-8 w-72" value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Status</Label>
            <Select value={status} onValueChange={(v)=>{ setStatus(v === 'published' ? 'published' : v === 'draft' ? 'draft' : ''); setPage(1) }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">When</Label>
            <Select value={timeframe} onValueChange={(v)=>{ setTimeframe(v === 'upcoming' ? 'upcoming' : v === 'past' ? 'past' : ''); setPage(1) }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      <div className="rounded-lg border overflow-x-auto hidden md:block">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
                <TableHead className="text-center">Published</TableHead>
                <TableHead className="text-right">Registered</TableHead>
                <TableHead className="w-0">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell className="font-medium">{ev.title}</TableCell>
                  <TableCell className="text-muted-foreground">{ev.slug}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{new Date(ev.date).toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{ev.city || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{ev.venue || '-'}</TableCell>
                  <TableCell className="text-right">{ev.capacity ?? 0}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch checked={!!ev.published} onCheckedChange={()=>togglePublished(ev)} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{ev.registered ?? 0}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><IconDotsVertical /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/events/${ev.slug}`} className="cursor-pointer">
                            <IconUsers className="mr-2 h-4 w-4" />
                            Manage RSVPs
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/events/${ev.slug}/edit`} className="cursor-pointer">
                            <IconPencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem>
                              <IconTrash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete event?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the event "{ev.title}" and remove its data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={()=>del(ev.slug)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">No events</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Page {page} of {pageCount} · {total} total</div>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(Number(v)); setPage(1) }}>
              <SelectTrigger className="w-28"><SelectValue placeholder={String(pageSize)} /></SelectTrigger>
              <SelectContent>
                {[10,20,50,100].map(n=> <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={()=>{ setPage(1) }} disabled={page<=1}><IconChevronsLeft /></Button>
              <Button variant="outline" size="icon" onClick={()=>{ setPage(p=>Math.max(1,p-1)) }} disabled={page<=1}><IconChevronLeft /></Button>
              <Button variant="outline" size="icon" onClick={()=>{ setPage(p=>Math.min(pageCount,p+1)) }} disabled={page>=pageCount}><IconChevronRight /></Button>
              <Button variant="outline" size="icon" onClick={()=>{ setPage(pageCount) }} disabled={page>=pageCount}><IconChevronsRight /></Button>
            </div>
          </div>
        </div>
    </div>
  )
}
