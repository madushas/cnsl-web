import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSessionUser, syncUserToDatabase } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { apiSuccess, apiError } from "@/lib/api-response";

function safeUrl(u: any): string | null {
  if (!u) return null;
  try {
    const s = String(u).trim();
    if (!s) return null;
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // limit length
    if (url.toString().length > 500) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normPhone(p: any): string | null {
  if (!p) return null;
  const digits = String(p).replace(/[^+\d]/g, "");
  if (!digits) return null;
  return digits.slice(0, 32);
}

// GET should be idempotent - no mutations (API-09 fix)
export async function GET() {
  const user = await getSessionUser();
  if (!user?.id) return apiError("UNAUTHORIZED", "Not authenticated", 401);

  // Just read the profile, don't create it on GET
  const [row] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.authUserId, String(user.id)))
    .limit(1);

  return apiSuccess({ user, profile: row || null });
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return apiError("UNAUTHORIZED", "Unauthorized", 401);

    // Ensure user exists in database before updating profile
    await syncUserToDatabase(user);
    const body = await req.json().catch(() => ({}));
    const update: any = {
      linkedin: safeUrl(body.linkedin),
      twitter: safeUrl(body.twitter),
      github: safeUrl(body.github),
      website: safeUrl(body.website),
      company: body.company ? String(body.company).slice(0, 200) : null,
      title: body.title ? String(body.title).slice(0, 200) : null,
      phone: normPhone(body.phone),
      whatsapp: normPhone(body.whatsapp),
      profileCompleted: body.profileCompleted === false ? false : true,
      updatedAt: new Date(),
    };
    await db
      .insert(schema.users)
      .values({
        authUserId: String(user.id),
        email: user.email ?? null,
        name: user.name ?? null,
        imageUrl: user.imageUrl ?? null,
        ...update,
      })
      .onConflictDoUpdate({ target: schema.users.authUserId, set: update });
    const [row] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authUserId, String(user.id)))
      .limit(1);
    return apiSuccess({ ok: true, profile: row });
  } catch (e: any) {
    return handleApiError(e);
  }
}
