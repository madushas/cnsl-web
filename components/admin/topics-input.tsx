"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function TopicsInput({ value, onChange, placeholder = 'Add a topic and press Enter' }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(tag: string) {
    const t = tag.trim()
    if (!t) return
    if (value.includes(t)) return
    onChange([...value, t])
    setText('')
    inputRef.current?.focus()
  }

  function removeTag(tag: string) {
    onChange(value.filter(v => v !== tag))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(text)
    } else if (e.key === 'Backspace' && !text && value.length) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className="rounded-md border border-border bg-white/5 p-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2 py-0.5 text-xs">
            {tag}
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={()=>removeTag(tag)} aria-label={`Remove ${tag}`}>×</button>
          </span>
        ))}
      </div>
      <Input ref={inputRef} value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} className="mt-2" />
      <div className="mt-2">
        <Button type="button" variant="outline" size="sm" onClick={()=>addTag(text)}>Add</Button>
      </div>
    </div>
  )
}
