import "server-only";
import { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { handleApiError } from "@/lib/errors";
import { apiSuccess, apiError } from "@/lib/api-response";

function safeUrl(u: any): string | null {
  if (!u) return null;
  try {
    const s = String(u).trim();
    if (!s) return null;
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.toString().length > 500) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ authUserId: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { authUserId } = await params;
    const body = await req.json().catch(() => ({}) as any);

    const update: any = {
      linkedin: safeUrl(body.linkedin),
      twitter: safeUrl(body.twitter),
      github: safeUrl(body.github),
      website: safeUrl(body.website),
      company: body.company ? String(body.company).slice(0, 200) : null,
      title: body.title ? String(body.title).slice(0, 200) : null,
      updatedAt: new Date(),
    };

    const [prev] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authUserId, authUserId))
      .limit(1);
    if (!prev) return apiError("NOT_FOUND", "User not found", 404);

    await db
      .update(schema.users)
      .set(update)
      .where(eq(schema.users.authUserId, authUserId));

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      null;
    await logAudit({
      action: "admin.user.profile.update",
      userId: admin?.id ? String(admin.id) : null,
      entityType: "user",
      entityId: authUserId,
      oldValues: {
        linkedin: prev.linkedin,
        twitter: prev.twitter,
        github: prev.github,
        website: prev.website,
        company: prev.company,
        title: prev.title,
      },
      newValues: {
        linkedin: update.linkedin,
        twitter: update.twitter,
        github: update.github,
        website: update.website,
        company: update.company,
        title: update.title,
      },
      ipAddress: ip,
    });

    const [row] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authUserId, authUserId))
      .limit(1);
    return apiSuccess({ ok: true, profile: row });
  } catch (e: any) {
    return handleApiError(e);
  }
}
