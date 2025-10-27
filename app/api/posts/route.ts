import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { logAudit } from "@/lib/audit";
import DOMPurify from "isomorphic-dompurify";
import { PostInput } from "@/lib/validation";
import { handleApiError } from "@/lib/errors";
import {
  apiSuccess,
  created,
  parsePaginationParams,
  paginationMeta,
} from "@/lib/api-response";

// Cache public posts list for 60 seconds
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePaginationParams(searchParams);

    const queryStart = Date.now();

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.posts)
      .where(sql`${schema.posts.deletedAt} IS NULL`);

    // Get paginated posts
    const posts = await db
      .select()
      .from(schema.posts)
      .where(sql`${schema.posts.deletedAt} IS NULL`)
      .orderBy(desc(schema.posts.date))
      .limit(limit)
      .offset(offset);

    const queryDuration = Date.now() - queryStart;
    logger.slowQuery("GET /api/posts", queryDuration, {
      postCount: posts.length,
      page,
      limit,
    });

    logger.api("GET", "/api/posts", 200, Date.now() - startTime, {
      count: posts.length,
      page,
    });
    return apiSuccess(posts, 200, paginationMeta(page, limit, Number(count)));
  } catch (e) {
    logger.error("Failed to list posts", {
      error: e as Error,
      duration: Date.now() - startTime,
    });
    return NextResponse.json(
      { error: "Failed to list posts" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = PostInput.parse(body);
    const now = new Date();
    const tagsStr = parsed.tags
      ? Array.isArray(parsed.tags)
        ? parsed.tags.join(",")
        : String(parsed.tags)
      : null;
    const [inserted] = await db
      .insert(schema.posts)
      .values({
        slug: String(parsed.slug),
        title: DOMPurify.sanitize(String(parsed.title)) as any,
        excerpt: parsed.excerpt
          ? (DOMPurify.sanitize(String(parsed.excerpt)) as any)
          : null,
        content: parsed.content
          ? (DOMPurify.sanitize(
              Array.isArray(parsed.content)
                ? parsed.content.join("\n\n")
                : String(parsed.content),
            ) as any)
          : null,
        author: (parsed.author
          ? (DOMPurify.sanitize(String(parsed.author)) as any)
          : "CNSL") as any,
        date: parsed.date ? new Date(String(parsed.date)) : now,
        category: parsed.category
          ? (DOMPurify.sanitize(String(parsed.category)) as any)
          : null,
        image: parsed.image
          ? (DOMPurify.sanitize(String(parsed.image)) as any)
          : null,
        tags: tagsStr ? (DOMPurify.sanitize(String(tagsStr)) as any) : null,
        published:
          parsed.published !== undefined ? Boolean(parsed.published) : false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;
    await logAudit({
      action: "post.create",
      userId: admin?.id ? String(admin.id) : null,
      entityType: "post",
      entityId: inserted?.id ?? null,
      oldValues: null,
      newValues: inserted ?? null,
      ipAddress: ip,
    });

    logger.info("Post created", {
      postId: inserted?.id,
      slug: body.slug,
      duration: Date.now() - startTime,
    });

    return created({ id: inserted?.id });
  } catch (e: any) {
    logger.error("Failed to create post", {
      error: e as Error,
      duration: Date.now() - startTime,
    });
    return handleApiError(e);
  }
}
