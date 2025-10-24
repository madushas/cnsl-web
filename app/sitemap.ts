import type { MetadataRoute } from "next"
import { db, schema } from "@/db"
import { desc } from "drizzle-orm"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/initiatives",
    "/events",
    "/blog",
    "/contact",
    "/code-of-conduct",
    "/privacy",
    "/terms",
    "/programs/cnsl-connect",
    "/programs/university-outreach",
    "/programs/monthly-meetups",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }))

  // Dynamic blog posts
  let postEntries: MetadataRoute.Sitemap = []
  try {
    const posts = await db.select().from(schema.posts).orderBy(desc(schema.posts.date))
    postEntries = posts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.date instanceof Date ? p.date : (p.date ? new Date(String(p.date)) : new Date()),
      changeFrequency: "monthly",
      priority: 0.6,
    }))
  } catch {
    postEntries = []
  }

  // Dynamic events
  let eventEntries: MetadataRoute.Sitemap = []
  try {
    const events = await db.select().from(schema.events)
    eventEntries = events.map((e) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: e.date instanceof Date ? e.date : (e.date ? new Date(String(e.date)) : new Date()),
      changeFrequency: "weekly",
      priority: 0.7,
    }))
  } catch {
    eventEntries = []
  }

  return [...staticRoutes, ...postEntries, ...eventEntries]
}
