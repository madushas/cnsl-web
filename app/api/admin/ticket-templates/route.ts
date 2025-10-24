import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ticketTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, requireAdmin } from "@/lib/auth";

// GET - List all templates (optionally filtered by event_id)
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    console.error("[GET /api/admin/ticket-templates]", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create a new template
export async function POST(request: NextRequest) {
  try {
    // Diagnostic logging: show request headers and session user
    try {
      console.debug('[POST /api/admin/ticket-templates] headers:', Object.fromEntries(request.headers.entries()));
    } catch {}

    // Use requireAdmin to validate the session and roles (throws on Unauthorized/Forbidden)
    let user;
    try {
      user = await requireAdmin();
    } catch (err) {
      console.warn('[POST /api/admin/ticket-templates] requireAdmin failed', err);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.debug('[POST /api/admin/ticket-templates] session user:', user);

    const body = await request.json();
    const { name, eventId, backgroundImage, qrConfig, textOverlays, isDefault } = body;

    if (!name || !backgroundImage) {
      return NextResponse.json(
        { error: "Name and background image are required" },
        { status: 400 }
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
        qrConfig: qrConfig || { x: 50, y: 50, size: 200, errorCorrectionLevel: "H" },
        textOverlays: textOverlays || [],
        isDefault: isDefault || false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("[POST /api/admin/ticket-templates]", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
