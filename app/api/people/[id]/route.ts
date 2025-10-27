import "server-only";
import { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import DOMPurify from "isomorphic-dompurify";
import { PersonInput } from "@/lib/validation";
import { handleApiError } from "@/lib/errors";
import { apiSuccess, apiError, noContent } from "@/lib/api-response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const p = PersonInput.partial().parse(body);
    const { id } = await params;
    const [oldPerson] = await db
      .select()
      .from(schema.people)
      .where(eq(schema.people.id, id))
      .limit(1);
    await db
      .update(schema.people)
      .set({
        name: p.name ? (DOMPurify.sanitize(String(p.name)) as any) : undefined,
        role: p.role ? (DOMPurify.sanitize(String(p.role)) as any) : undefined,
        title: p.title
          ? (DOMPurify.sanitize(String(p.title)) as any)
          : undefined,
        company: p.company
          ? (DOMPurify.sanitize(String(p.company)) as any)
          : undefined,
        linkedin: p.linkedin
          ? (DOMPurify.sanitize(String(p.linkedin)) as any)
          : undefined,
        twitter: p.twitter
          ? (DOMPurify.sanitize(String(p.twitter)) as any)
          : undefined,
        github: p.github
          ? (DOMPurify.sanitize(String(p.github)) as any)
          : undefined,
        website: p.website
          ? (DOMPurify.sanitize(String(p.website)) as any)
          : undefined,
        photo: p.photo
          ? (DOMPurify.sanitize(String(p.photo)) as any)
          : undefined,
        category: p.category
          ? (DOMPurify.sanitize(String(p.category)) as any)
          : undefined,
      })
      .where(eq(schema.people.id, id));
    const [newPerson] = await db
      .select()
      .from(schema.people)
      .where(eq(schema.people.id, id))
      .limit(1);
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;
    await logAudit({
      action: "person.update",
      userId: admin?.id ? String(admin.id) : null,
      entityType: "person",
      entityId: id,
      oldValues: oldPerson ?? null,
      newValues: newPerson ?? null,
      ipAddress: ip,
    });
    return apiSuccess({ ok: true });
  } catch (e: any) {
    return handleApiError(e);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const [oldPerson] = await db
      .select()
      .from(schema.people)
      .where(eq(schema.people.id, id))
      .limit(1);
    if (!oldPerson) return apiError("NOT_FOUND", "Person not found", 404);
    await db
      .update(schema.people)
      .set({
        deletedAt: new Date(),
        deletedBy: admin?.id ? String(admin.id) : null,
      })
      .where(eq(schema.people.id, id));
    await logAudit({
      action: "person.delete",
      userId: admin?.id ? String(admin.id) : null,
      entityType: "person",
      entityId: id,
      oldValues: oldPerson ?? null,
      newValues: { deletedAt: true },
      ipAddress:
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        null,
    });
    return noContent();
  } catch (e: any) {
    return handleApiError(e);
  }
}
