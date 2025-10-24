import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { and, eq, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import DOMPurify from 'isomorphic-dompurify'
import { PersonInput } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'
import { created } from '@/lib/api-response'

export async function GET() {
  const organizers = await db
    .select()
    .from(schema.people)
    .where(and(eq(schema.people.category, 'organizer'), sql`${schema.people.deletedAt} IS NULL`))
  const advisors = await db
    .select()
    .from(schema.people)
    .where(and(eq(schema.people.category, 'advisor'), sql`${schema.people.deletedAt} IS NULL`))
  return NextResponse.json({ organizers, advisors })
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const p = PersonInput.parse(body)
    const [newPerson] = await db.insert(schema.people).values({
      name: DOMPurify.sanitize(String(p.name)) as any,
      role: p.role ? (DOMPurify.sanitize(String(p.role)) as any) : null,
      title: p.title ? (DOMPurify.sanitize(String(p.title)) as any) : null,
      company: p.company ? (DOMPurify.sanitize(String(p.company)) as any) : null,
      linkedin: p.linkedin ? (DOMPurify.sanitize(String(p.linkedin)) as any) : null,
      twitter: p.twitter ? (DOMPurify.sanitize(String(p.twitter)) as any) : null,
      github: p.github ? (DOMPurify.sanitize(String(p.github)) as any) : null,
      website: p.website ? (DOMPurify.sanitize(String(p.website)) as any) : null,
      photo: p.photo ? (DOMPurify.sanitize(String(p.photo)) as any) : null,
      category: DOMPurify.sanitize(String(p.category)) as any,
    }).returning()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || null
    await logAudit({
      action: 'person.create',
      userId: admin?.id ? String(admin.id) : null,
      entityType: 'person',
      entityId: newPerson?.id ?? null,
      oldValues: null,
      newValues: newPerson ?? null,
      ipAddress: ip,
    })
    return created({ id: newPerson?.id })
  } catch (e: any) {
    return handleApiError(e)
  }
}
