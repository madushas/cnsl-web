import { NextRequest, NextResponse } from "next/server";
import "server-only";
import { getSessionUser } from "@/lib/auth";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { logAudit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { apiSuccess, apiError, noContent, created } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { escapeHtml } from "@/lib/utils";
import { sendEmail, sendTelegram } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    // Try to parse JSON body; if not provided and user is logged in, we will fall back to one-click mode
    let parsed: any = null;
    try {
      parsed = await req.json();
    } catch (error) {
      // Allow missing JSON for one-click RSVP (logged-in users)
      // Only log if there's actual malformed JSON (not empty body)
      const contentType = req.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        logger.warn("Invalid JSON in RSVP request", {
          error: error instanceof Error ? error.message : String(error),
          endpoint: req.nextUrl?.pathname,
        });
      }
    }
    const user = await getSessionUser();
    // If logged in, ensure profileCompleted before allowing one-click RSVP
    if (user?.id) {
      const [urow] = await db
        .select({
          profileCompleted: schema.users.profileCompleted,
          email: schema.users.email,
          name: schema.users.name,
        })
        .from(schema.users)
        .where(eq(schema.users.authUserId, String(user.id)))
        .limit(1);
      if (urow && urow.profileCompleted === false) {
        return NextResponse.json(
          {
            error: "Please complete your profile before registering.",
            redirect: "/welcome",
          },
          { status: 409 },
        );
      }
    }
    const normEmail = (user?.email || parsed?.email || "")
      .toString()
      .trim()
      .toLowerCase();
    const normName = (user?.name || parsed?.name || "").toString().trim();
    if (!normEmail || !normName) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }
    const { slug } = await params;
    const [event] = await db
      .select({ id: schema.events.id, title: schema.events.title })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);
    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    // Use database unique constraint to prevent race conditions (SEC-02 fix)
    // Let DB handle duplicate detection atomically instead of SELECT then INSERT
    try {
      await db.insert(schema.rsvps).values({
        eventId: event.id,
        name: normName,
        email: normEmail,
        affiliation: parsed?.affiliation ?? null,
        status: "pending", // All registrations start as pending, admin approved later
        accountId: user?.id ? String(user.id) : null,
        accountEmail: user?.email ?? null,
        accountName: user?.name ?? null,
      });
    } catch (err: any) {
      // Check if it's a unique constraint violation (duplicate registration)
      if (
        err?.code === "23505" ||
        err?.constraint === "rsvps_event_email_key"
      ) {
        logger.info("Duplicate RSVP attempt", {
          email: normEmail,
          eventId: event.id,
        });
        return NextResponse.json({
          ok: true,
          duplicate: true,
          message: "You have already registered for this event",
        });
      }
      // Re-throw other database errors
      throw err;
    }
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      null;
    await logAudit({
      action: "rsvp.create",
      userId: user?.id ? String(user.id) : null,
      entityType: "event",
      entityId: String(event.id),
      newValues: { name: normName, email: normEmail },
      ipAddress: ip,
    });
    // Notify
    const subject = `New RSVP: ${event.title}`;
    const html = `<p><b>${escapeHtml(normName)}</b> (${escapeHtml(normEmail)})<br/>Affiliation: ${escapeHtml(parsed?.affiliation || "-")}<br/>Event: ${escapeHtml(event.title)}</p>`;
    await Promise.all([
      sendEmail({ subject, html }),
      sendTelegram(`RSVP: ${normName} (${normEmail}) -> ${event.title}`),
    ]);
    return created({ ok: true });
  } catch (e: any) {
    logger.error("RSVP POST failed", {
      error: e instanceof Error ? e : String(e),
      endpoint: req.nextUrl?.pathname,
      method: "POST",
    });
    return NextResponse.json(
      { error: "Unable to complete registration. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user?.id && !user?.email)
      return apiError("UNAUTHORIZED", "Unauthorized", 401);
    const { slug } = await params;
    const [event] = await db
      .select({ id: schema.events.id })
      .from(schema.events)
      .where(eq(schema.events.slug, slug))
      .limit(1);
    if (!event) return apiError("NOT_FOUND", "Event not found", 404);
    await db
      .delete(schema.rsvps)
      .where(
        and(
          eq(schema.rsvps.eventId, event.id),
          eq(schema.rsvps.email, String(user.email)),
        ),
      );
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      null;
    await logAudit({
      action: "rsvp.delete",
      userId: user?.id ? String(user.id) : null,
      entityType: "event",
      entityId: String(event.id),
      oldValues: { email: String(user.email) },
      ipAddress: ip,
    });
    return noContent();
  } catch (e: any) {
    // API-01 fix: Use standardized error handler
    return handleApiError(e);
  }
}
