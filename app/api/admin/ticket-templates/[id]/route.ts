import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ticketTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const [template] = await db
      .select()
      .from(ticketTemplates)
      .where(eq(ticketTemplates.id, id))
      .limit(1);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("[GET /api/admin/ticket-templates/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 },
    );
  }
}

// PATCH - Update a template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      eventId,
      backgroundImage,
      qrConfig,
      textOverlays,
      isDefault,
    } = body;

    // If this is set as default, unset other defaults for this event
    if (isDefault && eventId) {
      await db
        .update(ticketTemplates)
        .set({ isDefault: false })
        .where(eq(ticketTemplates.eventId, eventId));
    }

    // Build update object with all provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (name !== undefined) updateData.name = name;
    if (eventId !== undefined) updateData.eventId = eventId;
    if (backgroundImage !== undefined) updateData.backgroundImage = backgroundImage;
    if (qrConfig !== undefined) updateData.qrConfig = qrConfig;
    if (textOverlays !== undefined) updateData.textOverlays = textOverlays;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const [template] = await db
      .update(ticketTemplates)
      .set(updateData)
      .where(eq(ticketTemplates.id, id))
      .returning();

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/ticket-templates/:id]", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const { id } = await params;
    await db.delete(ticketTemplates).where(eq(ticketTemplates.id, id));

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/ticket-templates/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 },
    );
  }
}
