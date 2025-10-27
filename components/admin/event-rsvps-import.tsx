"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { withCSRF } from "@/lib/csrf";

type Props = {
  slug: string;
};

export default function EventRSVPsImport({ slug }: Props) {
  const { toast } = useToast();
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    ok: boolean;
    updated?: number;
    total?: number;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download RSVP data in CSV format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Download className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Export All RSVPs</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Download all event registrations with full details
                </p>
                <a
                  href={`/api/admin/events/${slug}/rsvps/export`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </a>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Exported data includes:</p>
              <ul className="ml-4 space-y-1">
                <li>• Name, email, status</li>
                <li>• Ticket number, QR code</li>
                <li>• Registration and notification dates</li>
                <li>• Checkpoint status (entry, refreshment, swag)</li>
                <li>• Profile information (LinkedIn, company, etc.)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Ticket Data</CardTitle>
          <CardDescription>Upload ticket information via CSV</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Upload className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  Import Ticket Numbers & QR Codes
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Update ticket information for existing RSVPs
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImportResult(null);
                    setImportOpen(true);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">CSV format:</p>
              <ul className="ml-4 space-y-1">
                <li>
                  • Must include:{" "}
                  <code className="bg-muted px-1 rounded">id</code> or{" "}
                  <code className="bg-muted px-1 rounded">email</code>
                </li>
                <li>
                  • Optional columns:{" "}
                  <code className="bg-muted px-1 rounded">ticketNumber</code>,{" "}
                  <code className="bg-muted px-1 rounded">qrCode</code>
                </li>
                <li>• Only provided fields will be updated</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Ticket Image Mappings (CSV)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              Upload a CSV containing columns like{" "}
              <code className="bg-muted px-1 rounded">id</code>,{" "}
              <code className="bg-muted px-1 rounded">ticketNumber</code>,{" "}
              <code className="bg-muted px-1 rounded">qrCode</code>, or{" "}
              <code className="bg-muted px-1 rounded">email</code>. Only
              provided fields will be updated.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm"
            />
            {importResult && (
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Import Complete</p>
                <p className="text-muted-foreground">
                  Updated {importResult.updated ?? 0} of{" "}
                  {importResult.total ?? 0} records
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              disabled={importing}
              onClick={async () => {
                try {
                  setImporting(true);
                  const file = fileRef.current?.files?.[0];
                  if (!file) {
                    toast({
                      title: "Select file",
                      description: "Please choose a CSV file.",
                    });
                    return;
                  }
                  const text = await file.text();
                  const res = await fetch(
                    `/api/admin/events/${slug}/rsvps/import-ticket-images`,
                    {
                      method: "POST",
                      headers: withCSRF({ "Content-Type": "text/csv" }),
                      body: text,
                    },
                  );
                  const json = await res.json();
                  if (!res.ok) {
                    throw new Error(
                      json?.error?.message || json?.error || "Import failed",
                    );
                  }
                  const payload = json?.data ?? json;
                  const updated = Number(payload?.updated ?? 0);
                  const total = Number(payload?.total ?? 0);
                  setImportResult({ ok: true, updated, total });
                  toast({
                    title: "Import complete",
                    description: `Updated ${updated}/${total}`,
                  });
                } catch (e: any) {
                  toast({
                    title: "Error",
                    description: e.message || "Failed to import",
                    variant: "destructive",
                  });
                } finally {
                  setImporting(false);
                }
              }}
            >
              {importing ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
