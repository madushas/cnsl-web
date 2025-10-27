import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ticketTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// GET - List all templates (optionally filtered by event_id)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const templates = eventId
      ? await db
          .select()
          .from(ticketTemplates)
          .where(eq(ticketTemplates.eventId, eventId))
      : await db.select().from(ticketTemplates);

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    // Keep logs minimal at endpoint-level; centralized middleware handles request logging
    console.error(
      "[GET /api/admin/ticket-templates] error:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}

// POST - Create a new template
export async function POST(request: NextRequest) {
  try {
    // Use requireAdmin to validate the session and roles (throws on Unauthorized/Forbidden)
    try {
      await requireAdmin();
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      eventId,
      backgroundImage,
      qrConfig,
      textOverlays,
      isDefault,
    } = body as any;

    if (!name || !backgroundImage) {
      return NextResponse.json(
        { error: "Name and background image are required" },
        { status: 400 },
      );
    }

    // If this is set as default, unset other defaults for this event
    if (isDefault && eventId) {
      await db
        .update(ticketTemplates)
        .set({ isDefault: false })
        .where(eq(ticketTemplates.eventId, eventId));
    }

    const [template] = await db
      .insert(ticketTemplates)
      .values({
        name,
        eventId: eventId || null,
        backgroundImage,
        qrConfig: qrConfig || {
          x: 50,
          y: 50,
          size: 200,
          errorCorrectionLevel: "H",
        },
        textOverlays: textOverlays || [],
        isDefault: isDefault || false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    // Keep logs minimal at endpoint-level; centralized middleware handles request logging
    console.error(
      "[POST /api/admin/ticket-templates] error:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 },
    );
  }
}
