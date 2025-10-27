/**
 * CheckpointScanner Component
 *
 * Multi-checkpoint QR scanner with tabbed interface
 * Supports entry, refreshment, and swag checkpoints
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { withCSRF } from "@/lib/csrf";
import QrScanner from "qr-scanner";
import {
  CheckpointType,
  ScanMethod,
  CheckpointLabels,
  CheckpointIcons,
} from "@/lib/types/checkpoint";
import { CheckpointTabs } from "./checkpoint-tabs";
import { CheckpointStats } from "./checkpoint-stats";
import { AlertCircle, Camera, Check, X } from "lucide-react";

interface ScanLogEntry {
  ts: number;
  key: string;
  result: "success" | "already_scanned" | "not_found" | "error";
  message?: string;
  attendeeName?: string;
  checkpointType?: CheckpointType;
}

interface ScanStats {
  entry: number;
  refreshment: number;
  swag: number;
}

export default function CheckpointScanner({ slug }: { slug: string }) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [manual, setManual] = useState({ ticketNumber: "", email: "", qr: "" });
  const [busy, setBusy] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("default");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const failAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastScanRef = useRef<{ value: string; ts: number } | null>(null);
  const [logs, setLogs] = useState<ScanLogEntry[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [lastDetection, setLastDetection] = useState<string>("");
  const [activeCheckpoint, setActiveCheckpoint] =
    useState<CheckpointType>("entry");
  const [stats, setStats] = useState<ScanStats>({
    entry: 0,
    refreshment: 0,
    swag: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function refreshDevices() {
      try {
        const cameras = await QrScanner.listCameras();
        // debug: available cameras (removed verbose client log)
        setDevices(
          cameras.map((c) => ({
            deviceId: c.id,
            kind: "videoinput" as const,
            label: c.label,
            groupId: "",
            toJSON: () => ({}),
          })),
        );
      } catch (e) {
        console.error("[Scanner] Failed to list cameras:", e);
      }
    }

    async function boot() {
      try {
        setCameraError(null);
        // debug: initializing scanner (removed verbose client log)

        if (!videoRef.current) return;

        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            const raw = result.data;
            // debug: QR detected (removed verbose client log of full payload)
            setLastDetection(raw.slice(0, 32));

            const now = Date.now();
            const prev = lastScanRef.current;
            if (!prev || prev.value !== raw || now - prev.ts > 2000) {
              // debug: new unique scan detected (removed noisy client log)
              lastScanRef.current = { value: raw, ts: now };
              scanCheckpoint({ qr: raw }, "qr");
            } else {
              // debug: duplicate scan ignored (removed noisy client log)
            }
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: deviceId !== "default" ? deviceId : "environment",
            maxScansPerSecond: 5,
          },
        );

        qrScannerRef.current = scanner;

        await scanner.start();
        // debug: scanner started (removed noisy client log)
        setStreaming(true);
        setScannerActive(true);
        void refreshDevices();
      } catch (e: any) {
        console.error("[Scanner] Failed to start scanner:", e);
        setStreaming(false);
        setScannerActive(false);
        setCameraError(e?.message || "Failed to access camera");
      }
    }

    void boot();

    return () => {
      mounted = false;
      if (qrScannerRef.current) {
        // debug: destroying scanner (removed noisy client log)
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [deviceId]);

  const addLog = useCallback((entry: Omit<ScanLogEntry, "ts">) => {
    setLogs((ls) => [{ ts: Date.now(), ...entry }, ...ls].slice(0, 50));
  }, []);

  const scanCheckpoint = useCallback(
    async (
      identifier: {
        id?: string;
        ticketNumber?: string;
        email?: string;
        qr?: string;
      },
      scanMethod: ScanMethod,
    ) => {
      const key =
        identifier.id ||
        identifier.ticketNumber ||
        identifier.email ||
        identifier.qr;
      // debug: scanCheckpoint invoked (removed noisy client log)

      if (busy) {
        // debug: scan skipped because scanner is busy (removed noisy client log)
        return;
      }

      setBusy(true);
      try {
        const res = await fetch(
          `/api/admin/events/${encodeURIComponent(slug)}/checkpoints`,
          {
            method: "POST",
            headers: withCSRF({ "Content-Type": "application/json" }),
            body: JSON.stringify({
              checkpointType: activeCheckpoint,
              identifier,
              scanMethod,
            }),
          },
        );

        const data = await res.json();
        // debug: server response (removed verbose client log)

        if (!res.ok) throw new Error(data?.error?.message || "Scan failed");

        const result = data.data;

        if (!result.found) {
          toast({
            title: "Not found",
            description: "No matching RSVP for this event",
            variant: "destructive",
          });
          try {
            await failAudioRef.current?.play();
          } catch {}
          addLog({
            key: String(key || ""),
            result: "not_found",
            checkpointType: activeCheckpoint,
          });
        } else if (result.alreadyScanned) {
          toast({
            title: "Already scanned",
            description: `${result.attendee.name} already scanned at ${CheckpointLabels[activeCheckpoint]}`,
            variant: "default",
          });
          try {
            await failAudioRef.current?.play();
          } catch {}
          addLog({
            key: String(key || ""),
            result: "already_scanned",
            attendeeName: result.attendee.name,
            checkpointType: activeCheckpoint,
          });
        } else {
          toast({
            title: `${CheckpointIcons[activeCheckpoint]} Success!`,
            description: `${result.attendee.name} - ${CheckpointLabels[activeCheckpoint]}`,
          });
          try {
            await successAudioRef.current?.play();
          } catch {}
          addLog({
            key: String(key || ""),
            result: "success",
            attendeeName: result.attendee.name,
            checkpointType: activeCheckpoint,
          });
          setManual({ ticketNumber: "", email: "", qr: "" });
        }
      } catch (e: any) {
        console.error("[Scanner] Scan ERROR:", e);
        toast({
          title: "Error",
          description: e.message || "Failed to scan checkpoint",
          variant: "destructive",
        });
        try {
          await failAudioRef.current?.play();
        } catch {}
        addLog({
          key: String(key || ""),
          result: "error",
          message: e?.message,
          checkpointType: activeCheckpoint,
        });
      } finally {
        setBusy(false);
      }
    },
    [slug, activeCheckpoint, busy, toast, addLog],
  );

  const handleStatsRefresh = useCallback((newStats: any) => {
    setStats({
      entry: newStats.entry,
      refreshment: newStats.refreshment,
      swag: newStats.swag,
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Checkpoint Selector */}
      <CheckpointTabs
        activeCheckpoint={activeCheckpoint}
        onCheckpointChange={setActiveCheckpoint}
        stats={stats}
      />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camera Scanner */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Scanner - {CheckpointLabels[activeCheckpoint]}
            </CardTitle>
            <CardDescription>
              Scan QR codes for{" "}
              {CheckpointLabels[activeCheckpoint].toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end">
              <div>
                <Label className="text-xs block mb-1">Camera</Label>
                <Select value={deviceId} onValueChange={setDeviceId}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        devices.length ? "Select camera" : "No cameras"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Auto (rear/front)</SelectItem>
                    {devices.map((d) => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>
                        {d.label || "Camera"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    const cameras = await QrScanner.listCameras();
                    setDevices(
                      cameras.map((c) => ({
                        deviceId: c.id,
                        kind: "videoinput" as const,
                        label: c.label,
                        groupId: "",
                        toJSON: () => ({}),
                      })),
                    );
                  } catch {}
                }}
              >
                Refresh
              </Button>
            </div>

            <video
              ref={videoRef}
              className="w-full rounded bg-black aspect-video"
              playsInline
              muted
            />

            <audio
              ref={successAudioRef}
              src="/sound/scan-success-sound.mp3"
              preload="auto"
              className="hidden"
            />
            <audio
              ref={failAudioRef}
              src="/sound/scan-fail-sound.mp3"
              preload="auto"
              className="hidden"
            />

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                {cameraError ? (
                  <span className="text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Camera error: {cameraError}
                  </span>
                ) : streaming ? (
                  "Camera active - scan QR codes above"
                ) : (
                  "Camera unavailable, use manual entry below"
                )}
              </div>
              {streaming && (
                <div className="text-xs flex items-center gap-2">
                  <span
                    className={
                      scannerActive ? "text-green-500" : "text-yellow-500"
                    }
                  >
                    {scannerActive
                      ? "● Scanner active"
                      : "○ Scanner unavailable"}
                  </span>
                  {lastDetection && (
                    <span className="text-muted-foreground">
                      Last: {lastDetection}...
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Stats */}
        <CheckpointStats
          slug={slug}
          activeCheckpoint={activeCheckpoint}
          onRefresh={handleStatsRefresh}
          autoRefresh={true}
          refreshInterval={5000}
        />
      </div>

      {/* Manual Entry & Scan Log */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
            <CardDescription>
              Scan by ticket number, email, or QR URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs block mb-1">Ticket Number</label>
              <Input
                value={manual.ticketNumber}
                onChange={(e) =>
                  setManual((p) => ({ ...p, ticketNumber: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manual.ticketNumber) {
                    scanCheckpoint(
                      { ticketNumber: manual.ticketNumber },
                      "ticket",
                    );
                  }
                }}
                placeholder="e.g., T12345"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Email</label>
              <Input
                type="email"
                value={manual.email}
                onChange={(e) =>
                  setManual((p) => ({ ...p, email: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manual.email) {
                    scanCheckpoint({ email: manual.email }, "email");
                  }
                }}
                placeholder="attendee@example.com"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">QR URL</label>
              <Input
                value={manual.qr}
                onChange={(e) =>
                  setManual((p) => ({ ...p, qr: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manual.qr) {
                    scanCheckpoint({ qr: manual.qr }, "manual");
                  }
                }}
                placeholder="https://..."
              />
            </div>
            <Button
              disabled={
                busy || (!manual.ticketNumber && !manual.email && !manual.qr)
              }
              onClick={() => {
                if (manual.ticketNumber)
                  scanCheckpoint(
                    { ticketNumber: manual.ticketNumber },
                    "ticket",
                  );
                else if (manual.email)
                  scanCheckpoint({ email: manual.email }, "email");
                else if (manual.qr) scanCheckpoint({ qr: manual.qr }, "manual");
              }}
              className="w-full"
            >
              Scan {CheckpointLabels[activeCheckpoint]}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scan Log</CardTitle>
            <CardDescription>Recent scans (latest first)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-auto rounded border">
              <div className="divide-y divide-border text-xs">
                {logs.length === 0 && (
                  <div className="p-3 text-center text-muted-foreground">
                    No scans yet - start scanning above
                  </div>
                )}
                {logs.map((e, idx) => (
                  <div key={idx} className="p-2 flex items-start gap-2">
                    <span className="text-muted-foreground tabular-nums shrink-0">
                      {new Date(e.ts).toLocaleTimeString()}
                    </span>
                    {e.result === "success" && (
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                    {e.result === "already_scanned" && (
                      <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                    )}
                    {e.result === "not_found" && (
                      <X className="h-4 w-4 text-orange-500 shrink-0" />
                    )}
                    {e.result === "error" && (
                      <X className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {e.checkpointType && (
                        <span className="mr-1">
                          {CheckpointIcons[e.checkpointType]}
                        </span>
                      )}
                      {e.attendeeName && (
                        <span className="font-medium">{e.attendeeName}</span>
                      )}
                      {!e.attendeeName && (
                        <span className="font-mono text-muted-foreground truncate block">
                          {e.key}
                        </span>
                      )}
                      {e.message && (
                        <div className="text-muted-foreground mt-0.5">
                          {e.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
