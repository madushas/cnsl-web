import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rsvps } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

// PATCH - Batch update ticket URLs for RSVPs
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { updates } = await request.json();

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Updates array is required" },
        { status: 400 }
      );
    }

    // Batch update all RSVPs
    const updatePromises = updates.map((update: { id: string; ticketImageUrl: string }) =>
      db
        .update(rsvps)
        .set({
          ticketImageUrl: update.ticketImageUrl,
          ticketGeneratedAt: new Date(),
        })
        .where(eq(rsvps.id, update.id))
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} RSVPs`,
      count: updates.length,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/events/:slug/rsvps/batch-update-tickets]", error);
    return NextResponse.json(
      { error: "Failed to update RSVPs" },
      { status: 500 }
    );
  }
}
