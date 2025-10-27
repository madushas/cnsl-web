// API route for individual event details (admin)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, getUserRoles } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest, ctx: any) {
  const { params } = ctx as { params: { id: string } };
  try {
    const user = await getSessionUser();
    const roles = await getUserRoles(user);

    if (!roles.includes("admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, params.id))
      .limit(1);

    if (!event[0]) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event[0]);
  } catch (error) {
    logger.error("Error fetching event", {
      error: error instanceof Error ? error : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
