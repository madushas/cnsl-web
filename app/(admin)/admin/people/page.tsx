"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { withCSRF } from '@/lib/csrf'
import { toast } from 'sonner'
import { PersonInput } from '@/lib/types'

export default function AdminPeoplePage() {
  type Person = {
    id?: string
    name: string
    role?: string
    title?: string
    company?: string
    linkedin?: string
    twitter?: string
    github?: string
    website?: string
    photo?: string
    category: 'organizer' | 'advisor'
  }

  function startEdit(p: Person) {
    setEditingId(p.id!)
    setEditForm({
      id: p.id,
      name: p.name,
      role: p.role || '',
      title: p.title || '',
      company: p.company || '',
      linkedin: p.linkedin || '',
      twitter: p.twitter || '',
      github: p.github || '',
      website: p.website || '',
      photo: p.photo || '',
      category: p.category,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(null)
  }

  async function saveEdit() {
    if (!editingId || !editForm) return
    await patch(editingId, {
      name: editForm.name,
      role: editForm.role,
      title: editForm.title,
      company: editForm.company,
      linkedin: editForm.linkedin,
      twitter: editForm.twitter,
      github: editForm.github,
      website: editForm.website,
      photo: editForm.photo,
      category: editForm.category,
    })
    cancelEdit()
  }

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [organizers, setOrganizers] = useState<Person[]>([])
  const [advisors, setAdvisors] = useState<Person[]>([])
  const [form, setForm] = useState<Person>({ name: '', category: 'organizer' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Person | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/people', { cache: 'no-store' })
      const data = await res.json()
      setOrganizers(data.organizers || [])
      setAdvisors(data.advisors || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load people')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    // Normalize
    const payload = {
      name: form.name,
      role: form.role || undefined,
      title: form.title || undefined,
      company: form.company || undefined,
      linkedin: form.linkedin || undefined,
      twitter: form.twitter || undefined,
      github: form.github || undefined,
      website: form.website || undefined,
      photo: form.photo || undefined,
      category: form.category,
    }
    const validation = PersonInput.safeParse(payload)
    if (!validation.success) {
      // collect per-field errors
      const errs: Record<string, string> = {}
      for (const issue of validation.error.issues) {
        const key = issue.path.join('.')
        if (!errs[key]) errs[key] = issue.message
      }
      setFormErrors(errs)
      const msg = 'Validation failed. Please fix the highlighted fields.'
      toast.error(msg)
      return
    }
    setFormErrors({})
    const res = await fetch('/api/people', { method: 'POST', headers: withCSRF({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) })
    if (res.ok) { setForm({ name: '', category: 'organizer' }); toast.success('Person added'); load() }
    else { const data = await res.json().catch(()=>({})); toast.error(data?.error || 'Failed to add person') }
  }

  async function del(id: string) {
    const res = await fetch(`/api/people/${id}`, { method: 'DELETE', headers: withCSRF() })
    if (res.ok) { toast.success('Person deleted'); load() }
    else { const data = await res.json().catch(()=>({})); toast.error(data?.error || 'Failed to delete person') }
  }

  async function patch(id: string, patch: Partial<Person>) {
    const payload: Partial<Person> = { ...patch }
    for (const k of ['role','title','company','linkedin','twitter','github','website','photo'] as const) {
      if (payload[k] === '') payload[k] = undefined
    }
    const validation = PersonInput.partial().safeParse(payload)
    if (!validation.success) {
      const msg = 'Validation failed: ' + validation.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join(', ')
      toast.error(msg); return
    }
    const res = await fetch(`/api/people/${id}`, { method: 'PATCH', headers: withCSRF({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) })
    if (res.ok) { toast.success('Updated'); load() }
    else { const data = await res.json().catch(()=>({})); toast.error(data?.error || 'Failed to update') }
  }

  return (
      <div className="px-4 lg:px-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 text-foreground">Admin · People</h1>
        </div>

  {!loading && (
          <Card>
            <CardContent className="card-padding space-y-3">
              <div className="font-semibold text-foreground">Add Person</div>
              <form onSubmit={create} className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required aria-invalid={!!formErrors.name} value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} placeholder="Name" />
                  {formErrors.name && <div className="text-xs text-red-400">{formErrors.name}</div>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.category} onValueChange={(v)=>setForm({ ...form, category: v === 'advisor' ? 'advisor' : 'organizer' })}>
                    <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="advisor">Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={form.role || ''} onChange={e=>setForm({ ...form, role: e.target.value })} placeholder="Role" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title || ''} onChange={e=>setForm({ ...form, title: e.target.value })} placeholder="Title" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={form.company || ''} onChange={e=>setForm({ ...form, company: e.target.value })} placeholder="Company" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input id="linkedin" value={form.linkedin || ''} onChange={e=>setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input id="twitter" value={form.twitter || ''} onChange={e=>setForm({ ...form, twitter: e.target.value })} placeholder="https://x.com/..." />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input id="github" value={form.github || ''} onChange={e=>setForm({ ...form, github: e.target.value })} placeholder="https://github.com/..." />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={form.website || ''} onChange={e=>setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
                </div>
                <div className="grid gap-1.5 md:col-span-2">
                  <Label htmlFor="photo">Photo URL</Label>
                  <Input id="photo" value={form.photo || ''} onChange={e=>setForm({ ...form, photo: e.target.value })} placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="px-5">Add</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {error && <div className="text-sm text-red-400">{error}</div>}
  {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[0,1].map((col)=> (
              <Card key={col}>
                <CardContent className="card-padding space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <div className="space-y-2">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

  {!loading && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="card-padding space-y-3">
                <div className="text-lg font-semibold text-foreground">Organizers</div>
                <ul className="space-y-2">
                  {organizers.map(p => (
                    <li key={p.id} className="rounded-md border border-border bg-white/5 p-3">
                      {editingId === p.id ? (
                        <div className="space-y-3">
                          <div className="grid gap-2 md:grid-cols-3">
                            <Input value={editForm?.name || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), name: e.target.value }))} placeholder="Name" />
                            <Input value={editForm?.role || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), role: e.target.value }))} placeholder="Role" />
                            <Input value={editForm?.title || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), title: e.target.value }))} placeholder="Title" />
                            <Input value={editForm?.company || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), company: e.target.value }))} placeholder="Company" />
                            <Input value={editForm?.linkedin || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), linkedin: e.target.value }))} placeholder="LinkedIn URL" />
                            <Input value={editForm?.twitter || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), twitter: e.target.value }))} placeholder="Twitter URL" />
                            <Input value={editForm?.github || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), github: e.target.value }))} placeholder="GitHub URL" />
                            <Input value={editForm?.website || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), website: e.target.value }))} placeholder="Website" />
                            <Input value={editForm?.photo || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), photo: e.target.value }))} placeholder="Photo URL" />
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                            <Button size="sm" onClick={saveEdit}>Save</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-foreground">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{[p.role, p.title, p.company].filter(Boolean).join(' • ')}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={()=>startEdit(p)}>Edit</Button>
                            <Button variant="outline" size="sm" onClick={()=>patch(p.id!, { category: 'advisor' })}>Make advisor</Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Delete</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete person?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete "{p.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={()=>del(p.id!)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-padding space-y-3">
                <div className="text-lg font-semibold text-foreground">Advisors</div>
                <ul className="space-y-2">
                  {advisors.map(p => (
                    <li key={p.id} className="rounded-md border border-border bg-white/5 p-3">
                      {editingId === p.id ? (
                        <div className="space-y-3">
                          <div className="grid gap-2 md:grid-cols-3">
                            <Input value={editForm?.name || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), name: e.target.value }))} placeholder="Name" />
                            <Input value={editForm?.role || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), role: e.target.value }))} placeholder="Role" />
                            <Input value={editForm?.title || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), title: e.target.value }))} placeholder="Title" />
                            <Input value={editForm?.company || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), company: e.target.value }))} placeholder="Company" />
                            <Input value={editForm?.linkedin || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), linkedin: e.target.value }))} placeholder="LinkedIn URL" />
                            <Input value={editForm?.twitter || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), twitter: e.target.value }))} placeholder="Twitter URL" />
                            <Input value={editForm?.github || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), github: e.target.value }))} placeholder="GitHub URL" />
                            <Input value={editForm?.website || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), website: e.target.value }))} placeholder="Website" />
                            <Input value={editForm?.photo || ''} onChange={e=>setEditForm(f=>({ ...(f as Person), photo: e.target.value }))} placeholder="Photo URL" />
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                            <Button size="sm" onClick={saveEdit}>Save</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-foreground">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{[p.role, p.title, p.company].filter(Boolean).join(' • ')}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={()=>startEdit(p)}>Edit</Button>
                            <Button variant="outline" size="sm" onClick={()=>patch(p.id!, { category: 'organizer' })}>Make organizer</Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Delete</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete person?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete "{p.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={()=>del(p.id!)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  )
}
