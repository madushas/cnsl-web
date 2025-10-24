"use client"

import { useEffect, useState } from 'react'
import { withCSRF } from '@/lib/csrf'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ProfileForm({ onSaved }: { onSaved?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)

  const [form, setForm] = useState({
    linkedin: '',
    twitter: '',
    github: '',
    website: '',
    company: '',
    title: '',
    phone: '',
    whatsapp: '',
  })

  useEffect(() => {
    fetch('/api/me/profile', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.profile) {
          setForm(f => ({
            ...f,
            linkedin: d.profile.linkedin || '',
            twitter: d.profile.twitter || '',
            github: d.profile.github || '',
            website: d.profile.website || '',
            company: d.profile.company || '',
            title: d.profile.title || '',
            phone: d.profile.phone || '',
            whatsapp: d.profile.whatsapp || '',
          }))
        }
      })
      .catch(() => {})
  }, [])

  function update<K extends keyof typeof form>(k: K, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setStatus(null)
    try {
      setLoading(true)
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: withCSRF({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...form, profileCompleted: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save profile')
      setStatus({ ok: true, msg: 'Profile saved.' })
      onSaved?.()
    } catch (e: any) {
      setStatus({ ok: false, msg: e.message || 'Failed to save profile' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Input placeholder="LinkedIn URL" value={form.linkedin} onChange={e=>update('linkedin', e.target.value)} />
        <Input placeholder="Twitter URL" value={form.twitter} onChange={e=>update('twitter', e.target.value)} />
        <Input placeholder="GitHub URL" value={form.github} onChange={e=>update('github', e.target.value)} />
        <Input placeholder="Website" value={form.website} onChange={e=>update('website', e.target.value)} />
        <Input placeholder="Company" value={form.company} onChange={e=>update('company', e.target.value)} />
        <Input placeholder="Title" value={form.title} onChange={e=>update('title', e.target.value)} />
        <Input placeholder="Phone (E.164)" value={form.phone} onChange={e=>update('phone', e.target.value)} />
        <Input placeholder="WhatsApp (E.164)" value={form.whatsapp} onChange={e=>update('whatsapp', e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
        {status && <span className={`text-sm ${status.ok ? 'text-green-400' : 'text-red-400'}`}>{status.msg}</span>}
      </div>
    </form>
  )
}
