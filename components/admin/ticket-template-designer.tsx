"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  generateTicket,
  loadImage,
  downloadBlob,
  type TicketTemplate,
  type TextOverlay,
  type QRConfig,
} from "@/lib/ticket-generator";

type TemplateDesignerProps = {
  eventId?: string;
  onSaveAction?: (template: TicketTemplate) => Promise<void>;
  initialTemplate?: Partial<TicketTemplate>;
};

const SAMPLE_DATA = {
  name: "John Doe",
  ticketNumber: "TKT-2025-001",
  email: "john@example.com",
  eventTitle: "Cloud Native Meetup",
  eventDate: "Oct 25, 2025",
  venue: "Colombo, Sri Lanka",
};

export default function TicketTemplateDesigner({
  onSaveAction: onSave,
  initialTemplate,
}: TemplateDesignerProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [templateName, setTemplateName] = useState(initialTemplate?.name || "");
  const [backgroundImage, setBackgroundImage] = useState<string>(
    initialTemplate?.backgroundImage || "",
  );
  const [qrConfig, setQRConfig] = useState<QRConfig>(
    initialTemplate?.qrConfig || {
      x: 50,
      y: 50,
      size: 200,
      errorCorrectionLevel: "H",
    },
  );
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>(
    initialTemplate?.textOverlays || [
      {
        field: "name",
        x: 300,
        y: 100,
        fontSize: 48,
        fontFamily: "Arial",
        color: "#000000",
        align: "left",
      },
    ],
  );

  const [selectedOverlay, setSelectedOverlay] = useState<number>(0);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle background image upload
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setBackgroundImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Generate preview
  const generatePreview = async () => {
    if (!backgroundImage) {
      toast({
        title: "Background required",
        description: "Please upload a background image first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const template: TicketTemplate = {
        id: initialTemplate?.id || "preview",
        name: templateName || "Preview",
        backgroundImage,
        qrConfig,
        textOverlays,
      };

      const blob = await generateTicket(template, SAMPLE_DATA, "png");
      setPreviewBlob(blob);

      // Draw on canvas for visual feedback
      const img = await loadImage(URL.createObjectURL(blob));
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        }
      }

      toast({
        title: "Preview generated",
        description: "Preview updated successfully",
      });
    } catch (error) {
      console.error("Preview generation failed:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate preview when config changes
  useEffect(() => {
    if (backgroundImage) {
      const timer = setTimeout(() => {
        generatePreview();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [backgroundImage, qrConfig, textOverlays]);

  // Add text overlay
  const addTextOverlay = () => {
    setTextOverlays([
      ...textOverlays,
      {
        field: "name",
        x: 100,
        y: 100 + textOverlays.length * 60,
        fontSize: 32,
        fontFamily: "Arial",
        color: "#000000",
        align: "left",
      },
    ]);
  };

  // Remove text overlay
  const removeTextOverlay = (index: number) => {
    setTextOverlays(textOverlays.filter((_, i) => i !== index));
    if (selectedOverlay >= textOverlays.length - 1) {
      setSelectedOverlay(Math.max(0, textOverlays.length - 2));
    }
  };

  // Update text overlay
  const updateTextOverlay = (index: number, updates: Partial<TextOverlay>) => {
    setTextOverlays(
      textOverlays.map((overlay, i) =>
        i === index ? { ...overlay, ...updates } : overlay,
      ),
    );
  };

  // Save template
  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    if (!backgroundImage) {
      toast({
        title: "Background required",
        description: "Please upload a background image",
        variant: "destructive",
      });
      return;
    }

    const template: TicketTemplate = {
      id: initialTemplate?.id || crypto.randomUUID(),
      name: templateName,
      backgroundImage,
      qrConfig,
      textOverlays,
    };

    // Show loading state
    toast({
      title: initialTemplate?.id ? "Updating template..." : "Saving template...",
      description: initialTemplate?.id 
        ? "Please wait while we update your template"
        : "Please wait while we save your template",
    });

    try {
      console.debug("[TicketTemplateDesigner] Saving template", {
        id: template.id,
        name: template.name,
      });

      const endpoint = initialTemplate?.id 
        ? `/api/admin/ticket-templates/${initialTemplate.id}`
        : "/api/admin/ticket-templates";
      const method = initialTemplate?.id ? "PATCH" : "POST";
      
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      let responseJson = null;
      try {
        responseJson = await res.json();
      } catch (err) {
        console.error(
          "[TicketTemplateDesigner] Error parsing save response:",
          err instanceof Error ? err.message : String(err),
        );
      }

      // Loading toast will auto-dismiss

      if (!res.ok) {
        console.error(
          "[TicketTemplateDesigner] Save failed:",
          res.status,
          responseJson?.error ?? null,
        );
        throw new Error(
          responseJson?.error || `HTTP ${res.status}: Failed to save template`,
        );
      }

      // Show success message
      toast({
        title: initialTemplate?.id ? "Template updated" : "Template saved",
        description: initialTemplate?.id 
          ? "Your template has been updated successfully"
          : "Your template has been saved successfully",
        duration: 3000, // Show for 3 seconds
      });

      // Notify parent (if provided) so UI can close/refresh
      if (typeof onSave === "function") {
        try {
          await onSave(responseJson?.template || template);
        } catch (e) {
          console.error(
            "[TicketTemplateDesigner] onSave handler threw:",
            e instanceof Error ? e.message : String(e),
          );
        }
      }
    } catch (error) {
      // Loading toast will auto-dismiss on error
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Save failed:", errorMessage);
      
      toast({
        title: "Save failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Show error for 5 seconds
      });
    }
  };

  // Download preview
  const handleDownloadPreview = () => {
    if (!previewBlob) {
      toast({
        title: "No preview",
        description: "Generate a preview first",
        variant: "destructive",
      });
      return;
    }

    downloadBlob(previewBlob, `ticket-preview-${Date.now()}.png`);
  };

  return (
    <div className="space-y-6">
      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Template Designer</CardTitle>
          <CardDescription>
            Design your ticket template with QR code and text overlays
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Default Event Ticket"
            />
          </div>

          <div>
            <Label htmlFor="background-upload">Background Image</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                id="background-upload"
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {backgroundImage ? "Change Background" : "Upload Background"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 1080x1920px (portrait) or 1920x1080px (landscape)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Preview Canvas */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Real-time preview with sample data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative border rounded-lg overflow-hidden bg-muted">
              {backgroundImage ? (
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[70vh]"
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Upload a background image to start designing</p>
                  </div>
                </div>
              )}
            </div>

            {backgroundImage && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={generatePreview}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? "Generating..." : "Refresh Preview"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPreview}
                  disabled={!previewBlob}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="text">Text Overlays</TabsTrigger>
              </TabsList>

              {/* QR Config */}
              <TabsContent value="qr" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>X Position</Label>
                    <Input
                      type="number"
                      value={qrConfig.x}
                      onChange={(e) =>
                        setQRConfig({ ...qrConfig, x: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Y Position</Label>
                    <Input
                      type="number"
                      value={qrConfig.y}
                      onChange={(e) =>
                        setQRConfig({ ...qrConfig, y: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Size (px)</Label>
                  <Input
                    type="number"
                    value={qrConfig.size}
                    onChange={(e) =>
                      setQRConfig({ ...qrConfig, size: Number(e.target.value) })
                    }
                    min={64}
                    max={512}
                  />
                </div>

                <div>
                  <Label>Error Correction</Label>
                  <Select
                    value={qrConfig.errorCorrectionLevel}
                    onValueChange={(v: any) =>
                      setQRConfig({ ...qrConfig, errorCorrectionLevel: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Text Overlays Config */}
              <TabsContent value="text" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Text Fields ({textOverlays.length})</Label>
                  <Button size="sm" variant="outline" onClick={addTextOverlay}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {textOverlays.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No text overlays yet. Click &quot;Add&quot; to create one.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Overlay Selector */}
                    <Select
                      value={String(selectedOverlay)}
                      onValueChange={(v) => setSelectedOverlay(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {textOverlays.map((overlay, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {overlay.field} ({i + 1})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Selected Overlay Config */}
                    {textOverlays[selectedOverlay] && (
                      <div className="space-y-3 border rounded-lg p-4">
                        <div>
                          <Label>Field</Label>
                          <Select
                            value={textOverlays[selectedOverlay].field}
                            onValueChange={(v: any) =>
                              updateTextOverlay(selectedOverlay, { field: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="ticketNumber">
                                Ticket Number
                              </SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="eventTitle">
                                Event Title
                              </SelectItem>
                              <SelectItem value="eventDate">
                                Event Date
                              </SelectItem>
                              <SelectItem value="venue">Venue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>X</Label>
                            <Input
                              type="number"
                              value={textOverlays[selectedOverlay].x}
                              onChange={(e) =>
                                updateTextOverlay(selectedOverlay, {
                                  x: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Y</Label>
                            <Input
                              type="number"
                              value={textOverlays[selectedOverlay].y}
                              onChange={(e) =>
                                updateTextOverlay(selectedOverlay, {
                                  y: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Font Size</Label>
                          <Input
                            type="number"
                            value={textOverlays[selectedOverlay].fontSize}
                            onChange={(e) =>
                              updateTextOverlay(selectedOverlay, {
                                fontSize: Number(e.target.value),
                              })
                            }
                            min={8}
                            max={200}
                          />
                        </div>

                        <div>
                          <Label>Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={textOverlays[selectedOverlay].color}
                              onChange={(e) =>
                                updateTextOverlay(selectedOverlay, {
                                  color: e.target.value,
                                })
                              }
                              className="w-16"
                            />
                            <Input
                              type="text"
                              value={textOverlays[selectedOverlay].color}
                              onChange={(e) =>
                                updateTextOverlay(selectedOverlay, {
                                  color: e.target.value,
                                })
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTextOverlay(selectedOverlay)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove This Overlay
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={generatePreview}
          disabled={isGenerating}
        >
          Refresh Preview
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>
    </div>
  );
}
