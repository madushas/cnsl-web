import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { eq, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import DOMPurify from 'isomorphic-dompurify'
import { PostInput } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'
import { apiSuccess, apiError, noContent } from '@/lib/api-response'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [row] = await db
    .select()
    .from(schema.posts)
    .where(sql`${schema.posts.slug} = ${slug} AND ${schema.posts.deletedAt} IS NULL`)
    .limit(1)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const admin = await requireAdmin()
    const body = await req.json().catch(()=> ({}))
    const p = PostInput.partial().parse(body)
    const tags = p.tags ? (Array.isArray(p.tags) ? p.tags.join(',') : String(p.tags)) : undefined
    const content = p.content ? (Array.isArray(p.content) ? p.content.join('\n\n') : String(p.content)) : undefined
    const { slug } = await params
    const [oldPost] = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug)).limit(1)
    if (!oldPost) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await db.update(schema.posts).set({
      title: p.title ? (DOMPurify.sanitize(String(p.title)) as any) : undefined,
      excerpt: p.excerpt ? (DOMPurify.sanitize(String(p.excerpt)) as any) : undefined,
      category: p.category ? (DOMPurify.sanitize(String(p.category)) as any) : undefined,
      image: p.image ? (DOMPurify.sanitize(String(p.image)) as any) : undefined,
      date: p.date ? new Date(String(p.date)) : undefined,
      author: p.author ? (DOMPurify.sanitize(String(p.author)) as any) : undefined,
      tags: tags ? (DOMPurify.sanitize(String(tags)) as any) : undefined,
      content: content ? (DOMPurify.sanitize(String(content)) as any) : undefined,
    }).where(eq(schema.posts.slug, slug))
    const [newPost] = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug)).limit(1)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || null
    await logAudit({
      action: 'post.update',
      userId: admin?.id ? String(admin.id) : null,
      entityType: 'post',
      entityId: oldPost?.id ?? null,
      oldValues: oldPost ?? null,
      newValues: newPost ?? null,
      ipAddress: ip,
    })
    return apiSuccess({ ok: true })
  } catch (e: any) {
    return handleApiError(e)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const admin = await requireAdmin()
    const { slug } = await params
    const [oldPost] = await db.select().from(schema.posts).where(eq(schema.posts.slug, slug)).limit(1)
    if (!oldPost) return apiError('NOT_FOUND', 'Post not found', 404)
    await db
      .update(schema.posts)
      .set({ deletedAt: new Date(), deletedBy: admin?.id ? String(admin.id) : null, updatedAt: new Date() })
      .where(eq(schema.posts.slug, slug))
    await logAudit({
      action: 'post.delete',
      userId: admin?.id ? String(admin.id) : null,
      entityType: 'post',
      entityId: oldPost?.id ?? null,
      oldValues: oldPost ?? null,
      newValues: { deletedAt: true },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || null,
    })
    return noContent()
  } catch (e: any) {
    return handleApiError(e)
  }
}
