"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Ticket, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  generateTicketsBatch,
  downloadBlob,
  type TicketTemplate,
  type TicketData,
} from "@/lib/ticket-generator";

type RSVP = {
  id: string;
  name: string;
  email: string;
  ticketNumber?: string;
  ticketImageUrl?: string;
};

type BulkTicketGeneratorProps = {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  rsvps: RSVP[];
  onComplete?: () => void;
};

export default function BulkTicketGenerator({
  eventId,
  eventTitle,
  eventDate,
  venue,
  rsvps,
  onComplete,
}: BulkTicketGeneratorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Load templates
  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, eventId]);

  const loadTemplates = async () => {
    try {
      const res = await fetch(`/api/admin/ticket-templates?eventId=${eventId}`);
      const data = await res.json();
      
      if (data.success) {
        setTemplates(data.templates);
        // Auto-select default template
        const defaultTemplate = data.templates.find((t: any) => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        } else if (data.templates.length > 0) {
          setSelectedTemplateId(data.templates[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast({
        title: "Error",
        description: "Failed to load ticket templates",
        variant: "destructive",
      });
    }
  };

  // Generate preview of first 3 tickets
  const generatePreviews = async () => {
    if (!selectedTemplateId) return;

    const template = templates.find((t) => t.id === selectedTemplateId);
    if (!template) return;

    setCurrentStep("Generating previews...");
    const previewRSVPs = rsvps.slice(0, 3);
    const ticketData: TicketData[] = previewRSVPs.map((rsvp) => ({
      name: rsvp.name,
      email: rsvp.email,
      ticketNumber: rsvp.ticketNumber || `TKT-${rsvp.id.substring(0, 8)}`,
      eventTitle,
      eventDate,
      venue,
    }));

    try {
      const blobs = await generateTicketsBatch(
        template,
        ticketData,
        (processed: number, total: number) => {
          setProgress((processed / total) * 100);
        },
        "png"
      );

      const urls = Array.from(blobs.values()).map((blob) => URL.createObjectURL(blob));
      setPreviewUrls(urls);
      setCurrentStep("");
    } catch (error) {
      console.error("Preview generation failed:", error);
      toast({
        title: "Preview failed",
        description: "Could not generate preview tickets",
        variant: "destructive",
      });
    }
  };

  // Load previews when template changes
  useEffect(() => {
    if (selectedTemplateId && rsvps.length > 0) {
      setPreviewUrls([]);
      generatePreviews();
    }
  }, [selectedTemplateId]);

  // Upload blob to CDN (mock - replace with actual CDN upload)
  const uploadBlob = async (blob: Blob, filename: string): Promise<string> => {
    // TODO: Replace with actual CDN upload logic
    // For now, convert to data URL (not recommended for production)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  };

  // Batch update RSVPs with ticket URLs
  const batchUpdateRSVPs = async (updates: { id: string; ticketImageUrl: string }[]) => {
    console.log("[BulkTicketGenerator] Sending batch update payload:", updates);
    const res = await fetch(`/api/admin/events/${eventId}/rsvps/batch-update-tickets`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    let responseJson = null;
    try {
      responseJson = await res.json();
    } catch (err) {
      console.error("[BulkTicketGenerator] Error parsing batch update response:", err);
    }

    if (!res.ok) {
      console.error("[BulkTicketGenerator] Batch update failed:", res.status, responseJson);
      throw new Error("Failed to update RSVPs: " + (responseJson?.error || res.status));
    }

    console.log("[BulkTicketGenerator] Batch update response:", responseJson);
    return responseJson;
  };

  // Generate all tickets
  const handleGenerateAll = async () => {
    if (!selectedTemplateId) {
      toast({
        title: "Template required",
        description: "Please select a ticket template",
        variant: "destructive",
      });
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplateId);
    if (!template) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Step 1: Generate all tickets
      setCurrentStep(`Generating ${rsvps.length} tickets...`);
      const ticketData: TicketData[] = rsvps.map((rsvp) => ({
        name: rsvp.name,
        email: rsvp.email,
        ticketNumber: rsvp.ticketNumber || `TKT-${rsvp.id.substring(0, 8)}`,
        eventTitle,
        eventDate,
        venue,
      }));

      const blobs = await generateTicketsBatch(
        template,
        ticketData,
        (processed: number, total: number) => {
          setProgress((processed / total) * 50); // 50% for generation
        },
        "png"
      );

      // Step 2: Upload to CDN
      const blobsArray = Array.from(blobs.values());
      setCurrentStep(`Uploading ${blobsArray.length} tickets...`);
      const uploadPromises = blobsArray.map((blob, index) =>
        uploadBlob(blob, `ticket-${rsvps[index].id}.png`)
      );

      // Upload in batches of 5
      const urls: string[] = [];
      for (let i = 0; i < uploadPromises.length; i += 5) {
        const batch = uploadPromises.slice(i, i + 5);
        const batchUrls = await Promise.all(batch);
        urls.push(...batchUrls);
        setProgress(50 + ((i + batch.length) / uploadPromises.length) * 40); // 40% for upload
      }

      // Step 3: Update database
      setCurrentStep("Updating database...");
      const updates = rsvps.map((rsvp, index) => ({
        id: rsvp.id,
        ticketImageUrl: urls[index],
      }));

      const batchResult = await batchUpdateRSVPs(updates);
      if (!batchResult?.success) {
        throw new Error("Batch update failed: " + (batchResult?.error || "Unknown error"));
      }
      setProgress(100);

      toast({
        title: "Success!",
        description: `Generated ${rsvps.length} tickets successfully`,
      });

      setOpen(false);
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Bulk generation failed:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setCurrentStep("");
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Ticket className="h-4 w-4 mr-2" />
          Generate Tickets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Ticket Generator</DialogTitle>
          <DialogDescription>
            Generate tickets for {rsvps.length} RSVPs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <Label>Ticket Template</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                    {template.isDefault && " (Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {previewUrls.length > 0 && (
            <div>
              <Label>Preview (First 3 tickets)</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {previewUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-auto rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <Label>{currentStep}</Label>
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                {progress.toFixed(0)}% complete
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAll}
              disabled={isGenerating || !selectedTemplateId}
            >
              {isGenerating ? "Generating..." : `Generate ${rsvps.length} Tickets`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
