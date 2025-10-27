import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import QRCode from "qrcode";
import { uploadQRCode } from "@/lib/cloudinary-upload";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { qrRequests } = await request.json();

    if (!Array.isArray(qrRequests) || qrRequests.length === 0) {
      return NextResponse.json(
        { error: "QR requests array is required" },
        { status: 400 },
      );
    }

    console.log(`[QR GENERATION] Processing ${qrRequests.length} QR codes`);

    const results = [];

    for (const request of qrRequests) {
      const { payload, ticketNumber } = request;
      
      try {
        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(payload, {
          width: 400,
          margin: 1,
          errorCorrectionLevel: "H",
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        // Convert data URL to blob
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();

        // Upload to Cloudinary
        const cdnUrl = await uploadQRCode(blob, ticketNumber);
        
        console.log(`[QR GENERATION] Success for ${ticketNumber}: ${cdnUrl}`);
        
        results.push({
          ticketNumber,
          qrCodeUrl: cdnUrl,
          success: true
        });
      } catch (error) {
        console.error(`[QR GENERATION] Failed for ${ticketNumber}:`, error);
        results.push({
          ticketNumber,
          qrCodeUrl: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[QR GENERATION] Completed: ${successCount}/${qrRequests.length} successful`);

    return NextResponse.json({
      success: true,
      results,
      successCount,
      totalCount: qrRequests.length
    });
  } catch (error) {
    console.error("[QR GENERATION] API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR codes" },
      { status: 500 },
    );
  }
}