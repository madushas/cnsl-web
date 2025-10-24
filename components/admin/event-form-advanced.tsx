"use client"

import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TopicsInput } from '@/components/admin/topics-input'
import { SpeakersInput, type Speaker } from '@/components/admin/speakers-input'
import { withCSRF } from '@/lib/csrf'
import { toast } from 'sonner'
import { EventInput } from '@/lib/types'
import { ImageUpload } from '@/components/admin/image-upload'

export type EventValue = {
  slug: string
  title: string
  description?: string
  date: string // ISO string
  city?: string
  venue?: string
  image?: string
  capacity?: number
  published?: boolean
  topics?: string[]
  speakers?: Speaker[]
}

export function EventFormAdvanced({ mode, initial, onSaved }: { mode: 'create' | 'edit', initial?: Partial<EventValue> | null, onSaved?: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [form, setForm] = useState<EventValue>(() => ({
    slug: initial?.slug || '',
    title: initial?.title || '',
    description: initial?.description || '',
    // convert ISO to datetime-local value for the input
    date: initial?.date ? new Date(initial.date).toISOString() : new Date().toISOString(),
    city: initial?.city || '',
    venue: initial?.venue || '',
    image: initial?.image || '',
    capacity: typeof initial?.capacity === 'number' ? initial?.capacity : 0,
    published: Boolean(initial?.published),
    topics: initial?.topics || [],
    speakers: initial?.speakers || [],
  }))

  // Autosave draft to localStorage
  const draftKey = `event-draft:${mode}:${initial?.slug || 'new'}`
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw)
        setForm(prev => ({ ...prev, ...draft }))
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    try { localStorage.setItem(draftKey, JSON.stringify(form)) } catch {}
  }, [form, draftKey])
  function clearDraft() { try { localStorage.removeItem(draftKey) } catch {} }

  useEffect(() => {
    if (!initial) return
    setForm(prev => ({
      ...prev,
      slug: initial.slug || prev.slug,
      title: initial.title || prev.title,
      description: initial.description || prev.description,
      date: initial.date ? new Date(initial.date).toISOString() : prev.date,
      city: initial.city || prev.city,
      venue: initial.venue || prev.venue,
      image: initial.image || prev.image,
      capacity: typeof initial.capacity === 'number' ? initial.capacity : prev.capacity,
      published: typeof initial.published === 'boolean' ? initial.published : prev.published,
      topics: initial.topics || prev.topics,
      speakers: initial.speakers || prev.speakers,
    }))
  }, [initial?.slug])

  function set<K extends keyof EventValue>(key: K, val: EventValue[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function collectErrors(payload: any) {
    const result = EventInput.safeParse(payload)
    if (result.success) { setFormErrors({}); return null }
    const errs: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join('.')
      if (!errs[key]) errs[key] = issue.message
    }
    setFormErrors(errs)
    return errs
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      // Convert ISO string to input acceptable (server expects ISO)
      const payload: EventValue = {
        ...form,
        date: new Date(form.date).toISOString(),
      }
      const errs = collectErrors(payload)
      if (errs) {
        const msg = 'Validation failed. Please fix the highlighted fields.'
        setError(msg)
        toast.error(msg)
        setSaving(false)
        return
      }
      if (mode === 'create') {
        const res = await fetch('/api/events', { method: 'POST', headers: withCSRF({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to create event')
        toast.success('Event created')
      } else {
        const res = await fetch(`/api/events/${form.slug}`, { method: 'PATCH', headers: withCSRF({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to update event')
        toast.success('Event updated')
      }
      clearDraft()
      onSaved?.()
    } catch (e: any) {
      setError(e.message)
      toast.error(e.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // Convert ISO to datetime-local input value (YYYY-MM-DDTHH:mm)
  const datetimeLocalValue = useMemo(() => {
    try {
      const d = new Date(form.date)
      const pad = (n: number) => String(n).padStart(2, '0')
      const yyyy = d.getFullYear()
      const mm = pad(d.getMonth() + 1)
      const dd = pad(d.getDate())
      const hh = pad(d.getHours())
      const mi = pad(d.getMinutes())
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
    } catch { return '' }
  }, [form.date])

  return (
    <form onSubmit={submit} className="grid gap-4">
      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="flex items-center gap-2">
        <Button type="button" variant={showPreview? 'default':'outline'} size="sm" onClick={()=>setShowPreview(p=>!p)}>
          {showPreview? 'Hide Preview' : 'Preview'}
        </Button>
      </div>

      {!showPreview ? (
      <>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug {mode==='edit' ? <span className="text-xs text-muted-foreground">(read-only)</span> : null}</Label>
          <Input id="slug" required aria-invalid={!!formErrors.slug} value={form.slug} onChange={(e)=>set('slug', e.target.value)} onBlur={()=>collectErrors({ ...form, date: new Date(form.date).toISOString() })} disabled={mode==='edit'} placeholder="cnsl-oct-2025-colombo" />
          {formErrors.slug && <div className="text-xs text-red-400">{formErrors.slug}</div>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required aria-invalid={!!formErrors.title} value={form.title} onChange={(e)=>set('title', e.target.value)} onBlur={()=>collectErrors({ ...form, date: new Date(form.date).toISOString() })} placeholder="CNSL October Meetup" />
          {formErrors.title && <div className="text-xs text-red-400">{formErrors.title}</div>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date">Date & Time</Label>
          <Input id="date" type="datetime-local" value={datetimeLocalValue} onChange={(e)=>{
            // Convert local value back to ISO using local time
            const v = e.target.value
            const iso = new Date(v).toISOString()
            set('date', iso)
          }} />
          {formErrors.date && <div className="text-xs text-red-400">{formErrors.date}</div>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" aria-invalid={!!formErrors.city} value={form.city || ''} onChange={(e)=>set('city', e.target.value)} onBlur={()=>collectErrors({ ...form, date: new Date(form.date).toISOString() })} placeholder="Colombo" />
          {formErrors.city && <div className="text-xs text-red-400">{formErrors.city}</div>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="venue">Venue</Label>
          <Input id="venue" aria-invalid={!!formErrors.venue} value={form.venue || ''} onChange={(e)=>set('venue', e.target.value)} onBlur={()=>collectErrors({ ...form, date: new Date(form.date).toISOString() })} placeholder="WSO2 Auditorium" />
          {formErrors.venue && <div className="text-xs text-red-400">{formErrors.venue}</div>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="image">Image</Label>
          <Input id="image" aria-invalid={!!formErrors.image} value={form.image || ''} onChange={(e)=>set('image', e.target.value)} onBlur={()=>collectErrors({ ...form, date: new Date(form.date).toISOString() })} placeholder="https://..." />
          <ImageUpload value={form.image || ''} onChange={(url)=>set('image', url)} label="Upload banner" />
          {formErrors.image && <div className="text-xs text-red-400">{formErrors.image}</div>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" type="number" min={0} aria-invalid={!!formErrors.capacity} value={form.capacity ?? 0} onChange={(e)=>set('capacity', Number(e.target.value))} onBlur={()=>collectErrors({ ...form, date: new Date(form.date).toISOString() })} />
          {formErrors.capacity && <div className="text-xs text-red-400">{formErrors.capacity}</div>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="published">Published</Label>
          <div className="flex items-center gap-2">
            <Switch id="published" checked={!!form.published} onCheckedChange={(v)=>set('published', v)} />
            <span className="text-sm text-muted-foreground">Visible on site when published</span>
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" aria-invalid={!!formErrors.description} value={form.description || ''} onChange={(e)=>set('description', e.target.value)} onBlur={()=>collectErrors({ ...form, date: new Date(form.date).toISOString() })} rows={6} placeholder="Event details..." />
        {formErrors.description && <div className="text-xs text-red-400">{formErrors.description}</div>}
      </div>

      <div className="grid gap-2">
        <Label>Topics</Label>
        <TopicsInput value={form.topics || []} onChange={(v)=>set('topics', v)} placeholder="Type topic and press Enter" />
      </div>

      <div className="grid gap-2">
        <Label>Speakers</Label>
        <SpeakersInput value={form.speakers || []} onChange={(v)=>set('speakers', v)} topics={form.topics || []} />
      </div>
      </>
      ) : (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="text-sm text-muted-foreground">Preview</div>
          <div className="space-y-2">
            <div className="text-xl font-semibold">{form.title || 'Untitled Event'}</div>
            <div className="text-xs text-muted-foreground">{new Date(form.date).toLocaleString()} {form.city ? `· ${form.city}` : ''} {form.venue ? `· ${form.venue}` : ''}</div>
            {form.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image} alt="banner" className="rounded-md border max-h-64 object-cover" />
            ) : null}
            {form.description && <p className="text-sm whitespace-pre-wrap">{form.description}</p>}
            {(form.topics || []).length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {(form.topics || []).map(t => <span key={t} className="rounded-full border border-border px-2 py-0.5">{t}</span>)}
              </div>
            )}
            {(form.speakers || []).length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1">Speakers</div>
                <ul className="list-disc pl-5 space-y-1">
                  {(form.speakers || []).map((s, i) => (
                    <li key={i}>
                      <span className="font-medium">{s.name}</span>{s.title ? `, ${s.title}` : ''}{s.topic ? ` – ${s.topic}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : (mode==='create' ? 'Create Event' : 'Save Changes')}</Button>
      </div>
    </form>
  )
}
