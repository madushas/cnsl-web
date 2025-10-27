import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rsvps } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// PATCH - Batch update ticket URLs for RSVPs
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();

    const { updates } = await request.json();

    console.log(`[BATCH UPDATE] Received ${updates?.length || 0} updates:`, 
      updates?.slice(0, 2).map((u: any) => ({
        id: u.id,
        hasTicketNumber: !!u.ticketNumber,
        hasQrCode: !!u.qrCode,
        hasTicketImageUrl: !!u.ticketImageUrl,
        ticketNumber: u.ticketNumber?.substring(0, 20) + '...',
        qrCodeLength: u.qrCode?.length || 0
      }))
    );

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Updates array is required" },
        { status: 400 },
      );
    }

    // Batch update all RSVPs
    const updatePromises = updates.map(
      (update: { 
        id: string; 
        ticketImageUrl: string;
        ticketNumber?: string;
        qrCode?: string;
      }) => {
        // Build update data - always include all provided fields
        const updateData: any = {
          ticketImageUrl: update.ticketImageUrl,
          ticketGeneratedAt: new Date(),
        };
        
        // Always update ticket number if provided
        if (update.ticketNumber) {
          updateData.ticketNumber = update.ticketNumber;
        }
        
        // Always update QR code if provided  
        if (update.qrCode) {
          updateData.qrCode = update.qrCode;
        }
        
        console.log(`[BATCH UPDATE] RSVP ${update.id}:`, {
          received: {
            ticketNumber: update.ticketNumber?.substring(0, 20),
            qrCodeLength: update.qrCode?.length,
            ticketImageUrl: update.ticketImageUrl?.substring(0, 50)
          },
          updating: updateData
        });
        
        return db
          .update(rsvps)
          .set(updateData)
          .where(eq(rsvps.id, update.id));
      },
    );

    const results = await Promise.all(updatePromises);
    
    console.log(`[BATCH UPDATE] Successfully updated ${updates.length} RSVPs`);
    
    // Verify the updates by checking a few records
    if (updates.length > 0) {
      const sampleIds = updates.slice(0, 2).map(u => u.id);
      const verifyResults = await db
        .select({
          id: rsvps.id,
          ticketNumber: rsvps.ticketNumber,
          qrCode: rsvps.qrCode,
          ticketImageUrl: rsvps.ticketImageUrl
        })
        .from(rsvps)
        .where(inArray(rsvps.id, sampleIds));
        
      console.log('[BATCH UPDATE] Verification - DB records after update:', verifyResults);
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} RSVPs`,
      count: updates.length,
    });
  } catch (error) {
    console.error(
      "[PATCH /api/admin/events/:slug/rsvps/batch-update-tickets]",
      error,
    );
    return NextResponse.json(
      { error: "Failed to update RSVPs" },
      { status: 500 },
    );
  }
}
