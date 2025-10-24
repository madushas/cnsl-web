"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function ImageUpload({ value, onChange, label = 'Upload image' }: { value?: string; onChange: (url: string) => void; label?: string }) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  async function pick() {
    fileRef.current?.click()
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)')
      return
    }
    const fd = new FormData()
    fd.append('file', f)
    setUploading(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Upload failed')
      onChange(String(data.url))
      toast.success('Image uploaded')
    } catch (e: any) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled={uploading} onClick={pick}>{uploading ? 'Uploading…' : label}</Button>
        {value && (
          <a href={value} target="_blank" rel="noreferrer" className="text-sm text-primary underline">View</a>
        )}
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="uploaded" className="h-28 w-28 rounded border object-cover" />
      )}
      <Input ref={fileRef as any} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
    </div>
  )
}
