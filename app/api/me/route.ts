import "server-only";
import { NextRequest } from "next/server";
import { getSessionUser, getUserRoles, syncUserToDatabase } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

// GET should be idempotent - no mutations (API-09 fix)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHORIZED", "Not authenticated", 401);
  const roles = await getUserRoles(user);
  return apiSuccess({ user, roles });
}

// POST to sync user data (should be called after login)
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return apiError("UNAUTHORIZED", "Not authenticated", 401);

  // Sync user to database
  await syncUserToDatabase(user);

  const roles = await getUserRoles(user);
  return apiSuccess({ user, roles, synced: true });
}
