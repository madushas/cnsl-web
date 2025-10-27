/**
 * Ticket Generation Library
 *
 * Client-side ticket generation using Canvas API and QR codes.
 * This replaces the manual Python script workflow.
 *
 * Features:
 * - Generate QR codes with high error correction
 * - Composite ticket images with QR codes and text overlays
 * - Export as PNG/WebP blobs for upload
 * - Target: < 500ms per ticket
 */

import QRCode from "qrcode";

// Type definitions
export type QRConfig = {
  x: number;
  y: number;
  size: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"; // L=7%, M=15%, Q=25%, H=30%
};

export type TextOverlay = {
  field:
    | "name"
    | "ticketNumber"
    | "email"
    | "eventTitle"
    | "eventDate"
    | "venue";
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string; // hex color
  align?: "left" | "center" | "right";
  maxWidth?: number; // for text wrapping
};

export type TicketTemplate = {
  id: string;
  name: string;
  backgroundImage: string; // URL or data URL
  qrConfig: QRConfig;
  textOverlays: TextOverlay[];
  isDefault?: boolean; // for template selection UI
  eventId?: string | null;
};

export type TicketData = {
  name: string;
  ticketNumber: string;
  email: string;
  eventTitle?: string;
  eventDate?: string;
  venue?: string;
};

/**
 * Generate QR code and upload to CDN
 * @param payload QR code content (usually ticket number or URL)
 * @param ticketNumber Ticket number for CDN naming
 * @param size Size in pixels (default: 200)
 * @param errorCorrectionLevel Error correction level (default: H for 30%)
 * @returns Promise<string> CDN URL of QR code
 */
export async function generateQRCode(
  payload: string,
  ticketNumber?: string,
  size: number = 200,
  errorCorrectionLevel: "L" | "M" | "Q" | "H" = "H",
): Promise<string> {
  try {
    // Generate QR code as data URL first (works in both browser and Node.js)
    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: size,
      margin: 1,
      errorCorrectionLevel,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // If we have a ticket number, try to upload to CDN
    if (ticketNumber && (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL)) {
      try {
        // Convert data URL to blob for CDN upload
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        
        const { uploadQRCode } = await import('./cloudinary-upload');
        return await uploadQRCode(blob, ticketNumber);
      } catch (uploadError) {
        console.warn('CDN upload failed, falling back to data URL:', uploadError);
        // Fallback to data URL if CDN upload fails
        return qrDataUrl;
      }
    }

    // Return data URL for backward compatibility
    return qrDataUrl;
  } catch (error) {
    console.error("QR generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Load image from URL as HTMLImageElement
 * @param url Image URL (can be data URL)
 * @returns Promise<HTMLImageElement>
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS for external images
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Draw text with optional alignment and wrapping
 * @param ctx Canvas context
 * @param text Text to draw
 * @param overlay Text overlay configuration
 * @returns Text metrics for bounds checking
 */
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  overlay: TextOverlay,
): TextMetrics {
  const {
    x,
    y,
    fontSize,
    fontFamily,
    color,
    align = "left",
    maxWidth,
  } = overlay;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";

  if (maxWidth && ctx.measureText(text).width > maxWidth) {
    // Simple truncation with ellipsis
    let truncated = text;
    while (
      ctx.measureText(truncated + "...").width > maxWidth &&
      truncated.length > 0
    ) {
      truncated = truncated.slice(0, -1);
    }
    text = truncated + "...";
  }

  ctx.fillText(text, x, y);
  return ctx.measureText(text);
}

/**
 * Generate ticket image with QR code and text overlays
 * @param template Ticket template configuration
 * @param data Ticket data (name, ticket number, etc.)
 * @param format Output format (default: 'png')
 * @param quality Quality for lossy formats (0-1, default: 0.92)
 * @returns Promise<Blob> Ticket image blob
 */
export async function generateTicket(
  template: TicketTemplate,
  data: TicketData,
  format: "png" | "webp" | "jpeg" = "png",
  quality: number = 0.92,
): Promise<Blob> {
  const startTime = performance.now();

  try {
    // Load background image
    const bgImage = await loadImage(template.backgroundImage);

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = bgImage.width;
    canvas.height = bgImage.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Draw background
    ctx.drawImage(bgImage, 0, 0);

    // Generate and draw QR code
    const qrDataUrl = await generateQRCode(
      data.ticketNumber,
      data.ticketNumber, // Pass ticket number for CDN naming
      template.qrConfig.size,
      template.qrConfig.errorCorrectionLevel || "H",
    );
    const qrImage = await loadImage(qrDataUrl);
    ctx.drawImage(
      qrImage,
      template.qrConfig.x,
      template.qrConfig.y,
      template.qrConfig.size,
      template.qrConfig.size,
    );

    // Draw text overlays
    for (const overlay of template.textOverlays) {
      let text = "";
      switch (overlay.field) {
        case "name":
          text = data.name;
          break;
        case "ticketNumber":
          text = data.ticketNumber;
          break;
        case "email":
          text = data.email;
          break;
        case "eventTitle":
          text = data.eventTitle || "";
          break;
        case "eventDate":
          text = data.eventDate || "";
          break;
        case "venue":
          text = data.venue || "";
          break;
      }

      if (text) {
        drawText(ctx, text, overlay);
      }
    }

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      const mimeType =
        format === "png"
          ? "image/png"
          : format === "webp"
            ? "image/webp"
            : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        mimeType,
        quality,
      );
    });

    const endTime = performance.now();
    console.log(`Ticket generated in ${(endTime - startTime).toFixed(2)}ms`);

    return blob;
  } catch (error) {
    console.error("Ticket generation failed:", error);
    throw error;
  }
}

/**
 * Generate ticket and upload to CDN
 * @param template Ticket template
 * @param data Ticket data
 * @param format Output format (default: webp for better compression)
 * @param quality Quality (0-1, default: 0.85)
 * @returns Promise<string> CDN URL of generated ticket
 */
export async function generateTicketWithCDN(
  template: TicketTemplate,
  data: TicketData,
  format: "png" | "jpeg" | "webp" = "webp",
  quality: number = 0.85,
): Promise<string> {
  try {
    // Generate ticket blob
    const ticketBlob = await generateTicket(template, data, format, quality);
    
    // Upload to CDN if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL) {
      try {
        const { uploadTicketImage } = await import('./cloudinary-upload');
        return await uploadTicketImage(ticketBlob, data.ticketNumber);
      } catch (uploadError) {
        console.warn('CDN upload failed, falling back to data URL:', uploadError);
        // Fallback to data URL if CDN upload fails
        return blobToDataURL(ticketBlob);
      }
    }
    
    // Fallback to data URL if no CDN configured
    return blobToDataURL(ticketBlob);
  } catch (error) {
    console.error("Ticket generation with CDN failed:", error);
    throw error;
  }
}

/**
 * Generate multiple tickets in batch with CDN upload
 * @param template Ticket template
 * @param dataList Array of ticket data
 * @param onProgress Progress callback (current, total)
 * @param format Output format (default: webp)
 * @param quality Quality (0-1, default: 0.85)
 * @returns Promise<string[]> Array of CDN URLs
 */
export async function generateTicketsBatchWithCDN(
  template: TicketTemplate,
  dataList: TicketData[],
  onProgress?: (current: number, total: number) => void,
  format: "png" | "jpeg" | "webp" = "webp",
  quality: number = 0.85,
): Promise<string[]> {
  const results: string[] = [];
  const total = dataList.length;

  for (let i = 0; i < total; i++) {
    try {
      const ticketUrl = await generateTicketWithCDN(template, dataList[i], format, quality);
      results.push(ticketUrl);
      
      if (onProgress) {
        onProgress(i + 1, total);
      }
    } catch (error) {
      console.error(`Failed to generate ticket ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Generate multiple tickets in batch
 * @param template Ticket template
 * @param dataList Array of ticket data
 * @param onProgress Progress callback (current, total)
 * @param format Output format
 * @param quality Quality for lossy formats
 * @returns Promise<Map<string, Blob>> Map of ticket number to blob
 */
export async function generateTicketsBatch(
  template: TicketTemplate,
  dataList: TicketData[],
  onProgress?: (current: number, total: number) => void,
  format: "png" | "webp" | "jpeg" = "png",
  quality: number = 0.92,
): Promise<Map<string, Blob>> {
  const results = new Map<string, Blob>();
  const startTime = performance.now();

  for (let i = 0; i < dataList.length; i++) {
    const data = dataList[i];
    try {
      const blob = await generateTicket(template, data, format, quality);
      results.set(data.ticketNumber, blob);

      if (onProgress) {
        onProgress(i + 1, dataList.length);
      }
    } catch (error) {
      console.error(
        `Failed to generate ticket for ${data.ticketNumber}:`,
        error,
      );
      // Continue with next ticket instead of failing entire batch
    }
  }

  const endTime = performance.now();
  const avgTime = (endTime - startTime) / dataList.length;
  console.log(
    `Batch complete: ${results.size}/${dataList.length} tickets in ${((endTime - startTime) / 1000).toFixed(2)}s (avg ${avgTime.toFixed(2)}ms/ticket)`,
  );

  return results;
}

/**
 * Download blob as file (for single ticket download)
 * @param blob File blob
 * @param filename Filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convert blob to base64 data URL (for preview or storage)
 * @param blob File blob
 * @returns Promise<string> Data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get default template configuration
 * @returns Default ticket template
 */
export function getDefaultTemplate(): Omit<
  TicketTemplate,
  "id" | "name" | "backgroundImage"
> {
  return {
    qrConfig: {
      x: 50,
      y: 50,
      size: 200,
      errorCorrectionLevel: "H",
    },
    textOverlays: [
      {
        field: "name",
        x: 300,
        y: 100,
        fontSize: 48,
        fontFamily: "Arial, sans-serif",
        color: "#000000",
        align: "left",
        maxWidth: 600,
      },
      {
        field: "ticketNumber",
        x: 300,
        y: 170,
        fontSize: 32,
        fontFamily: "Courier New, monospace",
        color: "#666666",
        align: "left",
      },
    ],
  };
}
