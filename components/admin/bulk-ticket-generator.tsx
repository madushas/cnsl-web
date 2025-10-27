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
import { Ticket } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  generateTicketsBatch,
  generateTicketsBatchWithCDN,
  type TicketTemplate,
  type TicketData,
} from "@/lib/ticket-generator";
import Image from "next/image";

type RSVP = {
  id: string;
  name: string;
  email: string;
  status: string;
  ticketNumber?: string;
  ticketImageUrl?: string;
  qrCode?: string;
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
      // Fetch all templates (global + event-specific) with no cache to ensure fresh data
      const res = await fetch("/api/admin/ticket-templates", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        const allTemplates = data.templates || [];
        setTemplates(allTemplates);

        // Auto-select default template
        const defaultTemplate = allTemplates.find((t: any) => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        } else if (allTemplates.length > 0) {
          setSelectedTemplateId(allTemplates[0].id);
        }

        if (allTemplates.length === 0) {
          toast({
            title: "No templates found",
            description:
              "Please create a ticket template first in Ticket Templates page",
            variant: "destructive",
          });
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
        "png",
      );

      const urls = Array.from(blobs.values()).map((blob) =>
        URL.createObjectURL(blob),
      );
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

  // Upload blob to CDN using Cloudinary
  const uploadBlob = async (blob: Blob, filename: string): Promise<string> => {
    try {
      // Extract ticket number from filename for CDN naming
      const ticketNumber = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');
      
      // Use the new CDN upload function
      const { uploadTicketImage } = await import('@/lib/cloudinary-upload');
      return await uploadTicketImage(blob, ticketNumber);
    } catch (error) {
      console.warn('CDN upload failed, falling back to data URL:', error);
      // Fallback to data URL if CDN upload fails
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      });
    }
  };

  // Batch update RSVPs with ticket URLs, QR codes, and ticket numbers
  const batchUpdateRSVPs = async (
    updates: { 
      id: string; 
      ticketImageUrl: string;
      ticketNumber?: string;
      qrCode?: string;
    }[],
  ) => {
    // debug log removed: Sending batch update payload
    const res = await fetch(
      `/api/admin/events/${eventId}/rsvps/batch-update-tickets`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      },
    );

    let responseJson = null;
    try {
      responseJson = await res.json();
    } catch (err) {
      console.error(
        "[BulkTicketGenerator] Error parsing batch update response:",
        err,
      );
    }

    if (!res.ok) {
      console.error(
        "[BulkTicketGenerator] Batch update failed:",
        res.status,
        responseJson,
      );
      throw new Error(
        "Failed to update RSVPs: " + (responseJson?.error || res.status),
      );
    }

    // debug log removed: Batch update response
    return responseJson;
  };

  // Generate ticket number using the same format as the bulk API
  const generateTicketNumber = (eventId: string, rsvpId: string): string => {
    const prefix = eventId.slice(0, 6).toUpperCase();
    const suffix = rsvpId.slice(0, 8).toUpperCase();
    return `${prefix}-${suffix}`;
  };

  // Debug function to check configuration
  const checkConfiguration = () => {
    const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL);
    console.log('Configuration check:', {
      hasCloudinary,
      templatesCount: templates.length,
      selectedTemplate: selectedTemplateId,
      eligibleRsvps: rsvps.filter(r => r.status === 'approved' && !r.ticketImageUrl).length,
    });
    
    if (!hasCloudinary) {
      toast({
        title: "Configuration Warning",
        description: "Cloudinary not configured. Tickets will use data URLs instead of CDN.",
        variant: "destructive",
      });
    }
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
      // Step 1: Filter RSVPs - only approved ones without existing tickets
      const eligibleRsvps = rsvps.filter((rsvp) => {
        // Only approved RSVPs
        if (rsvp.status !== 'approved') {
          return false;
        }
        
        // Skip if ticket already exists (has ticketImageUrl)
        if (rsvp.ticketImageUrl) {
          return false;
        }
        
        return true;
      });

      if (eligibleRsvps.length === 0) {
        const approvedCount = rsvps.filter(r => r.status === 'approved').length;
        const withTicketsCount = rsvps.filter(r => r.ticketImageUrl).length;
        
        toast({
          title: "No tickets to generate",
          description: `${approvedCount} approved RSVPs already have tickets. ${withTicketsCount} total tickets exist.`,
          variant: "default",
        });
        setIsGenerating(false);
        return;
      }

      const skippedCount = rsvps.length - eligibleRsvps.length;
      if (skippedCount > 0) {
        toast({
          title: "Filtering RSVPs",
          description: `Generating tickets for ${eligibleRsvps.length} approved RSVPs. Skipping ${skippedCount} (not approved or already have tickets).`,
          variant: "default",
        });
      }

      // Step 2: Prepare ticket data with numbers (QR codes will be generated server-side)
      setCurrentStep("Preparing ticket data...");
      
      const ticketData: TicketData[] = [];
      const dbUpdates: Array<{
        id: string;
        ticketNumber: string;
        qrCode: string;
        ticketImageUrl: string;
      }> = [];

      for (let i = 0; i < eligibleRsvps.length; i++) {
        const rsvp = eligibleRsvps[i];
        
        // Generate ticket number if not exists
        const ticketNumber = rsvp.ticketNumber || generateTicketNumber(eventId, rsvp.id);
        
        ticketData.push({
          name: rsvp.name,
          email: rsvp.email,
          ticketNumber,
          eventTitle,
          eventDate,
          venue,
          qrCodeUrl: '', // Will be filled after QR generation
        });

        // Prepare database update (QR code and ticket image will be filled later)
        dbUpdates.push({
          id: rsvp.id,
          ticketNumber,
          qrCode: '', // Will be generated server-side
          ticketImageUrl: '', // Will be filled after ticket generation
        });

        setProgress((i / eligibleRsvps.length) * 20); // 20% for preparation
      }

      // Step 3: Generate QR codes server-side
      setCurrentStep("Generating QR codes on server...");
      const qrRequests = dbUpdates.map(update => ({
        payload: `${eventId}|${update.ticketNumber}|${update.id}`,
        ticketNumber: update.ticketNumber
      }));

      const qrResponse = await fetch('/api/admin/generate-qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrRequests })
      });

      if (!qrResponse.ok) {
        throw new Error('Failed to generate QR codes on server');
      }

      const qrData = await qrResponse.json();
      if (!qrData.success) {
        throw new Error('QR code generation failed');
      }

      // Update dbUpdates with QR code URLs
      for (let i = 0; i < dbUpdates.length; i++) {
        const qrResult = qrData.results.find((r: any) => r.ticketNumber === dbUpdates[i].ticketNumber);
        if (qrResult && qrResult.success) {
          dbUpdates[i].qrCode = qrResult.qrCodeUrl;
        } else {
          console.warn(`QR code generation failed for ${dbUpdates[i].ticketNumber}`);
          dbUpdates[i].qrCode = ''; // Will skip this in database update
        }
      }

      // Update ticket data with QR code URLs before generating ticket images
      for (let i = 0; i < ticketData.length; i++) {
        ticketData[i].qrCodeUrl = dbUpdates[i].qrCode;
      }

      setProgress(40); // 40% after QR generation

      // Step 4: Generate ticket images (client-side)
      setCurrentStep(`Generating ${eligibleRsvps.length} ticket images...`);
      const ticketBlobs = await generateTicketsBatch(
        template,
        ticketData,
        (processed: number, total: number) => {
          setProgress(40 + (processed / total) * 30); // 40-70% for ticket generation
        },
        "webp", // Use WebP for better compression
        0.85,
      );

      // Step 5: Upload ticket images to CDN (server-side)
      setCurrentStep("Uploading ticket images to CDN...");
      const formData = new FormData();
      
      // Add each ticket blob to form data
      for (let i = 0; i < ticketData.length; i++) {
        const ticketNumber = ticketData[i].ticketNumber;
        const blob = ticketBlobs.get(ticketNumber);
        if (blob) {
          formData.append(`ticket_${ticketNumber}`, blob, `${ticketNumber}.webp`);
        }
      }

      const uploadResponse = await fetch('/api/admin/upload-ticket-images', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload ticket images to CDN');
      }

      const uploadData = await uploadResponse.json();
      if (!uploadData.success) {
        throw new Error('Ticket image upload failed');
      }

      setProgress(90); // 90% after uploads

      // Update the ticket image URLs from upload results
      for (let i = 0; i < dbUpdates.length; i++) {
        const uploadResult = uploadData.uploads.find((u: any) => u.ticketNumber === dbUpdates[i].ticketNumber);
        if (uploadResult && uploadResult.success) {
          dbUpdates[i].ticketImageUrl = uploadResult.ticketImageUrl;
        } else {
          console.warn(`Ticket image upload failed for ${dbUpdates[i].ticketNumber}`);
          dbUpdates[i].ticketImageUrl = ''; // Will skip this in database update
        }
      }

      // Step 5: Update database with all ticket data
      setCurrentStep("Updating database...");
      const batchResult = await batchUpdateRSVPs(dbUpdates);
      if (!batchResult?.success) {
        throw new Error(
          "Batch update failed: " + (batchResult?.error || "Unknown error"),
        );
      }
      setProgress(100);

      toast({
        title: "Success!",
        description: `Generated ${eligibleRsvps.length} complete tickets (QR codes + images) for approved RSVPs`,
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

  // Add debug button for testing
  const handleDebugTest = () => {
    checkConfiguration();
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
              variant="outline"
              onClick={handleDebugTest}
              disabled={isGenerating}
            >
              Debug Config
            </Button>
            <Button
              onClick={handleGenerateAll}
              disabled={isGenerating || !selectedTemplateId}
            >
              {isGenerating
                ? "Generating..."
                : `Generate ${rsvps.length} Tickets`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
