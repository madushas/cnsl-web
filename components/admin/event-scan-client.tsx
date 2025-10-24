"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { withCSRF } from '@/lib/csrf'
import QrScanner from 'qr-scanner'

export default function EventScanClient({ slug }: { slug: string }) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [manual, setManual] = useState({ ticketNumber: '', email: '', qr: '' })
  const [busy, setBusy] = useState(false)
  const [last, setLast] = useState<{ id?: string, already?: boolean, key?: string } | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState<string>('default')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const successAudioRef = useRef<HTMLAudioElement | null>(null)
  const failAudioRef = useRef<HTMLAudioElement | null>(null)
  const lastScanRef = useRef<{ value: string; ts: number } | null>(null)
  const [logs, setLogs] = useState<Array<{ ts: number; key: string; result: 'success'|'not_found'|'error'; message?: string }>>([])
  const [scannerActive, setScannerActive] = useState(false)
  const [lastDetection, setLastDetection] = useState<string>('')

  useEffect(() => {
    let mounted = true

    async function refreshDevices() {
      try {
        const cameras = await QrScanner.listCameras()
        console.log('[Scanner] Available cameras:', cameras)
        setDevices(cameras.map(c => ({ deviceId: c.id, kind: 'videoinput' as const, label: c.label, groupId: '', toJSON: () => ({}) })))
      } catch (e) {
        console.error('[Scanner] Failed to list cameras:', e)
      }
    }

    async function boot() {
      try {
        setCameraError(null)
        console.log('[Scanner] Initializing QrScanner with device:', deviceId)
        
        if (!videoRef.current) return

        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            const raw = result.data
            console.log('[Scanner] QR detected:', raw.slice(0, 50))
            setLastDetection(raw.slice(0, 32))
            
            const now = Date.now()
            const prev = lastScanRef.current
            if (!prev || prev.value !== raw || now - prev.ts > 2000) {
              console.log('[Scanner] New/unique scan, calling checkIn')
              lastScanRef.current = { value: raw, ts: now }
              checkIn({ qr: raw })
            } else {
              console.log('[Scanner] Duplicate scan ignored (within 2s window)')
            }
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: deviceId !== 'default' ? deviceId : 'environment',
            maxScansPerSecond: 5,
          }
        )

        qrScannerRef.current = scanner
        
        await scanner.start()
        console.log('[Scanner] QrScanner started successfully')
        setStreaming(true)
        setScannerActive(true)
        void refreshDevices()
      } catch (e: any) {
        console.error('[Scanner] Failed to start scanner:', e)
        setStreaming(false)
        setScannerActive(false)
        setCameraError(e?.message || 'Failed to access camera')
      }
    }

    void boot()
    
    return () => {
      mounted = false
      if (qrScannerRef.current) {
        console.log('[Scanner] Destroying scanner')
        qrScannerRef.current.destroy()
        qrScannerRef.current = null
      }
    }
  }, [deviceId])

  function addLog(entry: { key: string; result: 'success'|'not_found'|'error'; message?: string }) {
    setLogs((ls) => [{ ts: Date.now(), ...entry }, ...ls].slice(0, 50))
  }

  async function checkIn(partial: { id?: string; ticketNumber?: string; email?: string; qr?: string }) {
    const key = partial.id || partial.ticketNumber || partial.email || partial.qr
    console.log('[Scanner] checkIn called with:', { key })
    if (busy) {
      console.log('[Scanner] checkIn skipped: already busy')
      return
    }
    setBusy(true)
    try {
      console.log('[Scanner] Sending check-in request to server')
      const res = await fetch(`/api/admin/events/${encodeURIComponent(slug)}/checkins/bulk`, {
        method: 'POST',
        headers: withCSRF({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ action: 'checkin', items: [partial] })
      })
      const data = await res.json()
      console.log('[Scanner] Server response:', data)
      if (!res.ok) throw new Error(data?.error || 'Check-in failed')
      const item = Array.isArray(data?.results) ? data.results[0] : null
      if (item?.updated) {
        console.log('[Scanner] Check-in SUCCESS')
        setLast({ id: undefined, already: false, key })
        toast({ title: 'Checked in', description: String(key || '').slice(0,64) })
        try { await successAudioRef.current?.play() } catch {}
        addLog({ key: String(key || ''), result: 'success' })
        setManual({ ticketNumber: '', email: '', qr: '' })
      } else {
        console.log('[Scanner] Check-in NOT_FOUND')
        toast({ title: 'Not found', description: 'No matching RSVP', variant: 'destructive' })
        try { await failAudioRef.current?.play() } catch {}
        addLog({ key: String(key || ''), result: 'not_found' })
      }
    } catch (e: any) {
      console.error('[Scanner] Check-in ERROR:', e)
      toast({ title: 'Error', description: e.message || 'Failed to check in', variant: 'destructive' })
      try { await failAudioRef.current?.play() } catch {}
      addLog({ key: String(key || ''), result: 'error', message: e?.message })
    } finally {
      setBusy(false)
    }
  }

  async function uncheck() {
    const key = last?.key
    if (!key) return
    const item: any = {}
    if (/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(String(key))) item.id = key
    else if (String(key).includes('@')) item.email = key
    else if (String(key).startsWith('http')) item.qr = key
    else item.ticketNumber = key
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(slug)}/checkins/bulk`, {
        method: 'POST', headers: withCSRF({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ action: 'uncheck', items: [item] })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to uncheck')
      const r = Array.isArray(data?.results) ? data.results[0] : null
      if (r?.updated) {
        toast({ title: 'Reverted', description: 'Check-in cleared' })
        setLast(null)
      } else {
        toast({ title: 'Not found', description: 'Could not match previous check-in', variant: 'destructive' })
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to uncheck', variant: 'destructive' })
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Scanner</CardTitle>
          <CardDescription>Use your device camera to scan QR codes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end">
            <div>
              <Label className="text-xs block mb-1">Camera</Label>
              <Select value={deviceId} onValueChange={setDeviceId}>
                <SelectTrigger><SelectValue placeholder={devices.length ? 'Select camera' : 'No cameras'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Auto (rear/front)</SelectItem>
                  {devices.map((d) => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex sm:justify-end">
              <Button type="button" variant="outline" onClick={async()=>{ try { const cameras=await QrScanner.listCameras(); setDevices(cameras.map(c=>({deviceId:c.id,kind:'videoinput' as const,label:c.label,groupId:'',toJSON:()=>({})}))) } catch {} }}>Refresh</Button>
            </div>
          </div>
          <video ref={videoRef} className="w-full rounded bg-black" playsInline muted />
          <audio ref={successAudioRef} src="/sound/scan-success-sound.mp3" preload="auto" className="hidden" />
          <audio ref={failAudioRef} src="/sound/scan-fail-sound.mp3" preload="auto" className="hidden" />
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">{cameraError ? `Camera error: ${cameraError}` : (streaming ? 'Camera active' : 'Camera unavailable, use manual entry')}</div>
            {streaming && (
              <div className="text-xs">
                <span className={scannerActive ? 'text-green-500' : 'text-yellow-500'}>
                  {scannerActive ? '● Scanner active' : '○ Scanner unavailable (use manual entry)'}
                </span>
                {lastDetection && <span className="ml-2 text-muted-foreground">Last: {lastDetection}...</span>}
              </div>
            )}
          </div>
          {!streaming && (
            <div className="text-xs text-muted-foreground">Tip: open the site on http://localhost:3000 (or HTTPS). Browsers block camera access on plain HTTP over LAN IPs.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Entry</CardTitle>
          <CardDescription>Check-in by ticket number, email, or QR URL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs block mb-1">Ticket Number</label>
            <Input value={manual.ticketNumber} onChange={e=>setManual(p=>({ ...p, ticketNumber: e.target.value }))} onKeyDown={(e)=>{ if(e.key==='Enter') checkIn({ ticketNumber: manual.ticketNumber }) }} />
          </div>
          <div>
            <label className="text-xs block mb-1">Email</label>
            <Input type="email" value={manual.email} onChange={e=>setManual(p=>({ ...p, email: e.target.value }))} onKeyDown={(e)=>{ if(e.key==='Enter') checkIn({ email: manual.email }) }} />
          </div>
          <div>
            <label className="text-xs block mb-1">QR URL</label>
            <Input value={manual.qr} onChange={e=>setManual(p=>({ ...p, qr: e.target.value }))} onKeyDown={(e)=>{ if(e.key==='Enter') checkIn({ qr: manual.qr }) }} />
          </div>
          <div className="flex items-center gap-2">
            <Button disabled={busy} onClick={()=>checkIn({ ticketNumber: manual.ticketNumber })}>Check-in</Button>
            <Button variant="outline" disabled={!last?.key} onClick={uncheck}>Undo last</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan Log</CardTitle>
          <CardDescription>Recent scans (latest first)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 overflow-auto rounded border">
            <div className="divide-y divide-border text-xs">
              {logs.length === 0 && (
                <div className="p-2 text-muted-foreground">No scans yet</div>
              )}
              {logs.map((e, idx) => (
                <div key={idx} className="p-2 flex items-center gap-2">
                  <span className="text-muted-foreground tabular-nums">{new Date(e.ts).toLocaleTimeString()}</span>
                  <span className={e.result === 'success' ? 'text-green-500' : e.result === 'not_found' ? 'text-yellow-500' : 'text-red-500'}>
                    {e.result.toUpperCase()}
                  </span>
                  <span className="font-mono truncate">{e.key}</span>
                  {e.message ? <span className="text-muted-foreground">· {e.message}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
