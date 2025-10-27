import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadTicketImage } from "@/lib/cloudinary-upload";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const uploads = [];

    // Process each file in the form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('ticket_') && value instanceof File) {
        const ticketNumber = key.replace('ticket_', '');
        
        try {
          console.log(`[TICKET UPLOAD] Processing ${ticketNumber}, size: ${value.size} bytes`);
          
          // Upload to Cloudinary
          const cdnUrl = await uploadTicketImage(value, ticketNumber);
          
          console.log(`[TICKET UPLOAD] Success for ${ticketNumber}: ${cdnUrl}`);
          
          uploads.push({
            ticketNumber,
            ticketImageUrl: cdnUrl,
            success: true
          });
        } catch (error) {
          console.error(`[TICKET UPLOAD] Failed for ${ticketNumber}:`, error);
          uploads.push({
            ticketNumber,
            ticketImageUrl: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    const successCount = uploads.filter(u => u.success).length;
    console.log(`[TICKET UPLOAD] Completed: ${successCount}/${uploads.length} successful`);

    return NextResponse.json({
      success: true,
      uploads,
      successCount,
      totalCount: uploads.length
    });
  } catch (error) {
    console.error("[TICKET UPLOAD] API Error:", error);
    return NextResponse.json(
      { error: "Failed to upload ticket images" },
      { status: 500 },
    );
  }
}