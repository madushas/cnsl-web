import 'server-only'
import { NextRequest } from 'next/server'
import { and, eq, sql, ilike, or, type SQL } from 'drizzle-orm'
import { db, schema } from '@/db'
import { requireAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { apiSuccess, parsePaginationParams, paginationMeta } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const { page, limit: pageSize, offset } = parsePaginationParams(searchParams)
    const q = (searchParams.get('q') || '').trim()
    const category = (searchParams.get('category') || '').trim()
    const sortBy = (searchParams.get('sortBy') || 'date').trim() as 'date' | 'title'
    const sortDir = (searchParams.get('sortDir') || 'desc').trim() as 'asc' | 'desc'

    const whereClauses = [sql`${schema.posts.deletedAt} IS NULL`]
    if (q) {
      const pattern = `%${q}%`
      const orExpr = or(
        ilike(schema.posts.title, pattern),
        ilike(schema.posts.slug, pattern),
        ilike(schema.posts.author, pattern),
        ilike(schema.posts.tags, pattern),
      ) as SQL
      whereClauses.push(orExpr)
    }
    if (category && category!=='all') {
      whereClauses.push(eq(schema.posts.category, category))
    }

    const whereExpr = and(...whereClauses)
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.posts)
      .where(whereExpr)

    const orderExpr = sortBy === 'title' ? sql`${schema.posts.title} ${sql.raw(sortDir)}` : sql`${schema.posts.date} ${sql.raw(sortDir)}`

    const items = await db
      .select()
      .from(schema.posts)
      .where(whereExpr)
      .orderBy(orderExpr)
      .limit(pageSize)
      .offset(offset)

    const serialized = items.map((it) => ({
      ...it,
      date: it?.date ? (it.date instanceof Date ? it.date.toISOString() : String(it.date)) : null,
    }))

    return apiSuccess(
      { items: serialized, total: Number(count) || 0, page, pageSize },
      200,
      paginationMeta(page, pageSize, Number(count) || 0)
    )
  } catch (e) {
    return handleApiError(e)
  }
}
