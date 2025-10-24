"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { IconSearch, IconPlus, IconDotsVertical, IconPencil, IconTrash, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconRefresh } from '@tabler/icons-react'
import type { Post as PostType } from '@/components/admin/post-form'
import { useDebouncedValue } from '@/lib/hooks/use-debounce'
import { withCSRF } from '@/lib/csrf'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

type ListResp = { items: PostType[]; total: number; page: number; pageSize: number }

export default function AdminPostsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // query state
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState<'date'|'title'>('date')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // data
  const [rows, setRows] = useState<PostType[]>([])
  const [total, setTotal] = useState(0)

  // drawer removed in favor of dedicated pages

  // Debounce search input
  const debouncedQ = useDebouncedValue(q, 500)

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const categories = useMemo(() => Array.from(new Set(rows.map(r => r.category).filter(Boolean))) as string[], [rows])

  // Initialize state from URL
  useEffect(() => {
    const sp = searchParams
    if (!sp) return
    setQ(sp.get('q') || '')
    setCategory((sp.get('category') || '').toString())
    const sb = sp.get('sortBy') || 'date'
    setSortBy(sb === 'title' ? 'title' : 'date')
    const sd = sp.get('sortDir') || 'desc'
    setSortDir(sd === 'asc' ? 'asc' : 'desc')
    const pg = Number(sp.get('page') || '1')
    setPage(Number.isFinite(pg) && pg > 0 ? pg : 1)
    const psz = Number(sp.get('pageSize') || '10')
    setPageSize([10,20,50,100].includes(psz) ? psz : 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load(signal?: AbortSignal) {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sortBy, sortDir })
      if (debouncedQ.trim()) params.set('q', debouncedQ.trim())
      if (category.trim()) params.set('category', category.trim())
      const res = await fetch(`/api/admin/posts?${params.toString()}`, { cache: 'no-store', signal })
      const data: ListResp = await res.json()
      if (!res.ok) throw new Error('Failed to load posts')
      setRows(data.items || [])
      setTotal(data.total || 0)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // ignore abort
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load posts')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ab = new AbortController()
    load(ab.signal)
    return () => ab.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ab = new AbortController()
    load(ab.signal)
    return () => ab.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, category, sortBy, sortDir, page, pageSize])

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQ.trim()) params.set('q', debouncedQ.trim())
    if (category.trim()) params.set('category', category.trim())
    params.set('sortBy', sortBy)
    params.set('sortDir', sortDir)
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    router.replace(params.toString() ? `/admin/posts?${params.toString()}` : '/admin/posts', { scroll: false })
  }, [debouncedQ, category, sortBy, sortDir, page, pageSize, router])

  function resetAndSearch() {
    setPage(1)
    load()
  }

  async function del(slug: string) {
    const prev = rows
    setRows(rs => rs.filter(r => r.slug !== slug))
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE', headers: withCSRF() })
    if (res.ok) {
      toast.success('Post deleted')
      load()
    } else {
      const data = await res.json().catch(()=>({}))
      setRows(prev)
      toast.error(data?.error || 'Failed to delete post')
    }
  }

  function sortOn(col: 'date'|'title') {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('desc')
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Admin · Posts</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={()=>load()}><IconRefresh />Refresh</Button>
          <Button size="sm" asChild><Link href="/admin/posts/new"><IconPlus />New Post</Link></Button>
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}
      {loading && (
        <>
          <div className="hidden md:block rounded-lg border overflow-hidden">
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-4 p-3">
                  <Skeleton className="h-5 w-48 col-span-2" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
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
                <div className="flex items-center justify-end gap-3">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-12" />
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
              <Input id="search" placeholder="Search title, slug, tags, author" className="pl-8 w-64" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') resetAndSearch() }} />
            </div>
            <Button size="sm" variant="outline" onClick={resetAndSearch}>Filter</Button>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="category" className="text-sm">Category</Label>
            <Select value={category} onValueChange={(v)=>{ setCategory(v); setPage(1) }}>
              <SelectTrigger className="w-40" id="category"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map(c => (<SelectItem key={c} value={c!}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Select value={sortBy} onValueChange={(v)=>setSortBy(v === 'title' ? 'title' : 'date')}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDir} onValueChange={(v)=>setSortDir(v === 'asc' ? 'asc' : 'desc')}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Dir" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(Number(v)); setPage(1) }}>
              <SelectTrigger className="w-28"><SelectValue placeholder={String(pageSize)} /></SelectTrigger>
              <SelectContent>
                {[10,20,50,100].map(n=> <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
    </div>
  <div className="space-y-2 md:hidden">
          {rows.map((p) => (
            <div key={p.slug} className="rounded-md border p-3">
              <div className="font-medium truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {p.date || '-'} {p.author ? `· ${p.author}` : ''} {p.category ? `· ${p.category}` : ''}
              </div>
              {p.tags && (
                <div className="text-xs text-muted-foreground truncate">{Array.isArray(p.tags) ? p.tags.join(', ') : String(p.tags)}</div>
              )}
              <div className="flex items-center justify-end gap-3 mt-2">
                <Link href={`/admin/posts/${p.slug}/edit`} className="text-xs underline">Edit</Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs text-red-400 underline">Delete</button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete post?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete "{p.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={()=>del(p.slug)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-center text-sm text-muted-foreground">No posts</div>
          )}
    </div>
  <div className="rounded-lg border overflow-x-auto hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={()=>sortOn('title')}>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="cursor-pointer" onClick={()=>sortOn('date')}>Date</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-0">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.slug}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                  <TableCell>{p.category || '-'}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{p.date || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{p.author || '-'}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[240px] truncate">{Array.isArray(p.tags) ? (p.tags.length ? p.tags.join(', ') : '-') : (p.tags || '-')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><IconDotsVertical /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/posts/${p.slug}/edit`} className="cursor-pointer"><IconPencil />Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem><IconTrash />Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete post?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete "{p.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={()=>del(p.slug)}>Delete</AlertDialogAction>
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
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">No posts</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">Page {page} of {pageCount} · {total} total</div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={()=>{ setPage(1) }} disabled={page<=1}><IconChevronsLeft /></Button>
          <Button variant="outline" size="icon" onClick={()=>{ setPage(p=>Math.max(1,p-1)) }} disabled={page<=1}><IconChevronLeft /></Button>
          <Button variant="outline" size="icon" onClick={()=>{ setPage(p=>Math.min(pageCount,p+1)) }} disabled={page>=pageCount}><IconChevronRight /></Button>
          <Button variant="outline" size="icon" onClick={()=>{ setPage(pageCount) }} disabled={page>=pageCount}><IconChevronsRight /></Button>
        </div>
      </div>
    </div>
  )
}
