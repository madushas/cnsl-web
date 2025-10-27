import "server-only";
import { stackServerApp } from "@/stack/server";
import { db, schema } from "@/db";
import { eq, or, ilike } from "drizzle-orm";
import { logger } from "@/lib/logger";

export type SessionUser = {
  id?: string;
  email?: string;
  name?: string;
  imageUrl?: string;
  [k: string]: unknown;
} | null;

export async function getSessionUser(): Promise<SessionUser> {
  try {
    const u = await stackServerApp?.getUser();
    if (!u) return null;

    const id = u.id as string | undefined;
    const email = u.primaryEmail as string | undefined;
    const name = u.displayName as string | undefined;
    const imageUrl = u.profileImageUrl as string | undefined;

    return { id, email, name, imageUrl };
  } catch (error) {
    logger.error("Session validation failed", {
      error: error instanceof Error ? error : String(error),
    });
    return null;
  }
}

export async function getUserRoles(user: SessionUser): Promise<string[]> {
  if (!user) return [];
  let rows: { role: string }[] = [];
  const hasId = !!user?.id;
  const hasEmail = !!user?.email;
  if (hasId || hasEmail) {
    const cond =
      hasId && hasEmail
        ? or(
            eq(schema.userRoles.userId, String(user!.id)),
            ilike(schema.userRoles.email, String(user!.email)),
          )
        : hasId
          ? eq(schema.userRoles.userId, String(user!.id))
          : ilike(schema.userRoles.email, String(user!.email!));
    rows = await db
      .select({ role: schema.userRoles.role })
      .from(schema.userRoles)
      .where(cond);
  }
  // Normalize DB roles: trim + lowercase (e.g., ' ADMIN ' => 'admin')
  const roles = rows.map((r) =>
    String(r.role || "")
      .trim()
      .toLowerCase(),
  );
  const envAdmins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (
    user?.email &&
    envAdmins.includes(user.email.toLowerCase()) &&
    !roles.includes("admin")
  ) {
    roles.push("admin");
  }
  return roles;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  const roles = await getUserRoles(user);
  return roles.includes("admin");
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  const roles = await getUserRoles(user);
  if (!roles.includes("admin")) throw new Error("Forbidden");
  return user;
}

export async function requireAdminOrCheckin() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  const roles = await getUserRoles(user);
  if (!roles.includes("admin") && !roles.includes("checkin"))
    throw new Error("Forbidden");
  return user;
}

/**
 * Sync user data from Stack Auth to local database
 * Should be called on login/profile updates, NOT in GET requests
 */
export async function syncUserToDatabase(user: SessionUser): Promise<void> {
  if (!user?.id) return;

  await db
    .insert(schema.users)
    .values({
      authUserId: String(user.id),
      email: user.email ?? null,
      name: user.name ?? null,
      imageUrl: user.imageUrl ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.users.authUserId,
      set: {
        email: user.email ?? null,
        name: user.name ?? null,
        imageUrl: user.imageUrl ?? null,
        updatedAt: new Date(),
      },
    });
}
